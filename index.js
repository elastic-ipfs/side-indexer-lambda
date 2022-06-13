const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { MultihashIndexSortedWriter } = require('cardex')
const { CarIndexer } = require('@ipld/car/indexer')
const { concat } = require('uint8arrays')

/**
 * @type {import('aws-lambda').SNSHandler}
 */
exports.handler = async function handler (event, context) {
  /** @type {typeof S3Client} */
  const S3 = typeof context?.clientContext?.Custom?.S3Client === 'function'
    ? context.clientContext.Custom.S3Client
    : S3Client
  const records = toS3Event(event).Records
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

/**
 * Extract an S3Event from the passed SNSEvent.
 * @param {import('aws-lambda').SNSEvent} snsEvent
 * @returns {import('aws-lambda').S3Event}
 */
function toS3Event (snsEvent) {
  const s3Event = { Records: [] }
  for (const snsRec of snsEvent.Records) {
    try {
      for (const s3Rec of JSON.parse(snsRec.Sns.Message).Records || []) {
        if (s3Rec.eventSource !== 'aws:s3') continue
        s3Event.Records.push(s3Rec)
      }
    } catch (err) {
      console.error(`failed to extract S3Event record from SNSEvent record: ${err.message}`, snsRec)
    }
  }
  return s3Event
}
