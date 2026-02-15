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
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { EndpointType, LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class PrimaryXRayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    
    const secretsManager = new Secret(this, "secret", {
        secretName: "private-signing-key-1",
        
    })

    const rotationLambda = new NodejsFunction(this, "rotationLambda-1",{
        entry: path.join(__dirname, "handlers/login/rotation-lambda/index.ts")
    })

    secretsManager.addRotationSchedule("4-rotation", {
        automaticallyAfter: cdk.Duration.hours(5),
        rotationLambda
    })

  }
}
