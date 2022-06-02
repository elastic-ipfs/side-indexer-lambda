import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { MultihashIndexSortedWriter } from 'cardex'
import { CarIndexer } from '@ipld/car/indexer'

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env

/**
 * @type {import('aws-lambda').Handler<import('aws-lambda').S3Event>}
 */
export async function handler (event) {
  const records = event.Records
    .filter(r => r.eventName.startsWith('ObjectCreated'))
    .filter(r => r.s3.object.key.endsWith('.car'))

  for (const r of records) {
    const s3 = new S3Client({
      region: r.awsRegion,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    })

    const getCmd = new GetObjectCommand({
      Bucket: r.s3.bucket,
      Key: r.s3.object.key
    })

    const res = await s3.send(getCmd)

    const { writer, out } = MultihashIndexSortedWriter.create()
    ;(async () => {
      for (const blockIndexData of CarIndexer.fromIterable(res.Body)) {
        await writer.put(blockIndexData)
      }
      await writer.close()
    })()

    const putCmd = new PutObjectCommand({
      Bucket: r.s3.bucket,
      Key: r.s3.object.key + '.idx',
      Body: out
    })

    await s3.send(putCmd)
  }
}
