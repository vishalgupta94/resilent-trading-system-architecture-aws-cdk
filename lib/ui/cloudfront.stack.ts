import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {
  BucketDeployment,
  ServerSideEncryption,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment';
import path from 'path';

export class PrimaryWebSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    let primaryBucket = new Bucket(this, "PrimaryBucket", {
        bucketName: `website-${props?.env?.account}-primary`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
    })

    const cloudfront = new Distribution(this, "PrimaryDistribution",{
        defaultBehavior: {
            origin: S3BucketOrigin.withOriginAccessControl(primaryBucket)
        }
    })

    new BucketDeployment(this, "BucketDeployment", {
        destinationBucket: primaryBucket,
        sources: [Source.asset(path.join(process.cwd(),"ui/dist"))],
    })

  }
}
