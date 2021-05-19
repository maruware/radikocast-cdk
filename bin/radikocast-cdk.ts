#!/usr/bin/env node
import 'source-map-support/register'
import { RadikocastCdkStack } from '../lib/radikocast-cdk-stack'
import Config from '../lib/config'
import cdk = require('@aws-cdk/core')

const app = new cdk.App()
const configPath = app.node.tryGetContext('config')
if (!configPath) {
  throw new Error('required config')
}
const config = Config.load(configPath)

new RadikocastCdkStack(app, 'RadikocastCdkStack', config)
