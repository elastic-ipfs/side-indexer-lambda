import anyTest from 'ava'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MultihashIndexSortedReader } from 'cardex'
import { concat, equals } from 'uint8arrays'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { CID } from 'multiformats'
import * as raw from 'multiformats/codecs/raw'
import { handler } from '../index.js'

/** @typedef {{ mockS3: import('./helpers/mock-s3').MockS3 }} Context */

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('ava').TestFn<Context>} */
const test = anyTest

test('creates an index on put', async t => {
  const cid = CID.parse('bafybeihkqv2ukwgpgzkwsuz7whmvneztvxglkljbs3zosewgku2cfluvba')

  /** @type {Uint8Array} */
  let putData
  class MockS3Client {
    async send (cmd) {
      if (cmd instanceof GetObjectCommand) {
        const carPath = path.join(__dirname, 'fixtures', cmd.input.Key)
        return { Body: fs.createReadStream(carPath) }
      }
      if (cmd instanceof PutObjectCommand) {
        putData = cmd.input.Body
        return
      }
      throw new Error('unexpected command')
    }
  }

  await handler({
    Records: [{
      eventName: 'ObjectCreated:Put',
      s3: {
        bucket: { name: 'test' },
        object: { key: `${cid}.car` }
      }
    }]
  }, { clientContext: { Custom: { S3Client: MockS3Client } } })

  // Read entire index to ensure a valid index was written.
  // Sanity check at least the root block was indexed!
  const reader = MultihashIndexSortedReader.fromBytes(putData)
  let isRootBlockIndexed = false
  for await (const entry of reader.entries()) {
    if (equals(entry.digest, cid.multihash.digest)) {
      isRootBlockIndexed = true
    }
    console.log(`${CID.createV1(raw.code, entry.multihash)}, @ ${entry.offset}`)
  }
  t.true(isRootBlockIndexed, 'root CID indexed')
})
