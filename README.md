# Side Indexer Lambda

[![build](https://github.com/ipfs-elastic-provider/side-indexer-lambda/actions/workflows/build.yml/badge.svg)](https://github.com/ipfs-elastic-provider/side-indexer-lambda/actions/workflows/build.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

AWS Lambda that creates CARv2 side indexes for CAR files uploaded to an S3 bucket.

<img src="https://user-images.githubusercontent.com/152863/172424487-9d4d09df-df33-4fa1-a483-ff6565047bd6.png" width="471"/>

## Deployment Environment Variables

| Name                         | Default | Description            |
| ---------------------------- | ------- | ---------------------- |
| AWS_ACCESS_KEY_ID            |         | The AWS key ID.        |
| AWS_SECRET_ACCESS_KEY        |         | The AWS secret key.    |
| AWS_SESSION_TOKEN            |         | The AWS Session token. |

Note: The Lambda needs `GetObject` and `PutObject` access on the bucket it is deployed on.

## Contributing

Feel free to join in. All welcome. [Open an issue](https://github.com/ipfs-elastic-provider/side-indexer-lambda/issues)!

## License

Dual-licensed under [MIT + Apache 2.0](https://github.com/ipfs-elastic-provider/side-indexer-lambda/blob/main/LICENSE.md)
