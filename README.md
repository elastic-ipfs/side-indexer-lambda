# Side Indexer Lambda

[![build](https://github.com/ipfs-elastic-provider/side-indexer-lambda/actions/workflows/build.yml/badge.svg)](https://github.com/ipfs-elastic-provider/side-indexer-lambda/actions/workflows/build.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

AWS Lambda that creates CARv2 side indexes for CAR files uploaded to an S3 bucket.

## Deployment Environment Variables

| Name                         | Default               | Description         |
| ---------------------------- | --------------------- | ------------------- |
| AWS_ACCESS_KEY_ID            |                       | The AWS key ID.     |
| AWS_SECRET_ACCESS_KEY        |                       | The AWS secret key. |
