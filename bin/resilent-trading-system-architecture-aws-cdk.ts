#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ResilentTradingSystemArchitectureAwsCdkStack } from '../lib/resilent-trading-system-architecture-aws-cdk-stack';
import { PrimaryWebSiteStack } from '../lib/ui/cloudfront.stack';

const app = new cdk.App();
new PrimaryWebSiteStack(app, 'PrimaryWebSiteStack', {
  env: { account: '339713054130', region: 'us-east-1' },
});
