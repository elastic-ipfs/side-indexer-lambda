import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { MultihashIndexSortedWriter } from 'cardex'
import { CarIndexer } from '@ipld/car/indexer'
import { concat } from 'uint8arrays'

/**
 * @type {import('aws-lambda').Handler<import('aws-lambda').S3Event>}
 */
export async function handler (event, context) {
  /** @type {typeof S3Client} */
  const S3 = typeof context?.clientContext?.Custom?.S3Client === 'function'
    ? context.clientContext.Custom.S3Client
    : S3Client
  const records = event.Records
    .filter(r => r.eventName.startsWith('ObjectCreated'))
    .filter(r => r.s3.object.key.endsWith('.car'))

  for (const r of records) {
    const s3 = new S3({
      region: r.awsRegion,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
      }
    })

    const getCmd = new GetObjectCommand({
      Bucket: r.s3.bucket.name,
      Key: r.s3.object.key
    })

    const res = await s3.send(getCmd)

    const { writer, out } = MultihashIndexSortedWriter.create()
    ;(async () => {
      const indexer = await CarIndexer.fromIterable(res.Body)
      for await (const blockIndexData of indexer) {
        await writer.put(blockIndexData)
      }
      await writer.close()
    })()

    // TODO: stream?
    const chunks = []
    for await (const chunk of out) {
      chunks.push(chunk)
    }

    const putCmd = new PutObjectCommand({
      Bucket: r.s3.bucket.name,
      Key: r.s3.object.key + '.idx',
      Body: concat(chunks)
    })

    await s3.send(putCmd)
  }
}
