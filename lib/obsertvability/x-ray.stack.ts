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

export class PrimaryXRayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // DynamoDB table
    const table = new Table(this, "ItemsTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });


    const handler = new NodejsFunction(this,"Function",{
        entry: path.join(process.cwd(), "lib/obsertvability/handlers/basic/index.ts"),
        handler: "handler",
        tracing: Tracing.ACTIVE,
    })
    handler.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    handler.addEnvironment("TABLE_NAME",table.tableName)

        // Give Lambda access to DynamoDB
    table.grantReadWriteData(handler);

    // Make sure Lambda can send X-Ray telemetry (usually already present, but explicit is fine)
    handler.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess')
    );

    // API Gateway
    const api = new RestApi(this, "ItemsApi", {
      restApiName: "items-api",
      deployOptions: {
        tracingEnabled: true, // enables X-Ray for API Gateway
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: false, // set true if you want request/response logs (can be noisy)
      },
      endpointTypes: [EndpointType.REGIONAL]
    });

    const items = api.root.addResource("items");
    items.addMethod("POST", new LambdaIntegration(handler));

    const itemById = items.addResource("{id}");
    itemById.addMethod("GET", new LambdaIntegration(handler));

    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
    new cdk.CfnOutput(this, "TableName", { value: table.tableName });

  }
}
