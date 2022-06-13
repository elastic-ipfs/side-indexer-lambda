# Side Indexer Lambda

[![build](https://github.com/ipfs-elastic-provider/side-indexer-lambda/actions/workflows/build.yml/badge.svg)](https://github.com/ipfs-elastic-provider/side-indexer-lambda/actions/workflows/build.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

AWS Lambda that creates CARv2 side indexes for CAR files uploaded to an S3 bucket.

<img src="https://user-images.githubusercontent.com/152863/173384826-e6e53826-0a27-4c0e-9b8e-8f8db5540cc7.png" width="541"/>

Note: The Lambda needs a policy with `GetObject` and `PutObject` access to the bucket it is deployed on.

## Contributing

Feel free to join in. All welcome. [Open an issue](https://github.com/ipfs-elastic-provider/side-indexer-lambda/issues)!

## License

Dual-licensed under [MIT + Apache 2.0](https://github.com/ipfs-elastic-provider/side-indexer-lambda/blob/main/LICENSE.md)
