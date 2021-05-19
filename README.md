# radikocast-cdk

radikocast deployment with AWS CDK

## Usage

### Write Config

See [sample.yml](sample.yml)

### Requirements

- aws-cdk
  - `npm i -g aws-cdk`

### CDK commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

Specify config file path with context

```sh
$ cdk deploy -c ./sample.yml
```
