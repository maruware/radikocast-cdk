# radikocast-cdk

radikocast deployment with AWS CDK

## Usage

### Requirements

- Enabled AWS credentials and set region
  - Basic: set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION

### Basic

#### 1. Write config

See [sample.yml](sample.yml)

#### 2. Deploy

Specify config file path with context

```sh
$ npm run build
$ npx cdk deploy -c ./sample.yml
```

#### 3. Subscribe feed

Feed URL is http://{mybucket}.s3-website-{region}.amazonaws.com/feed.xml

### CDK commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
