import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import {
  BucketDeployment,
  ServerSideEncryption,
  Source,
} from "aws-cdk-lib/aws-s3-deployment";
import path from "path";
import {
  BastionHostLinux,
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  Subnet,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import {
  AuroraPostgresEngineVersion,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
  ParameterGroup,
  SubnetGroup,
} from "aws-cdk-lib/aws-rds";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class PrimaryRDSFargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let vpc = new Vpc(this, "vpc", {});

    vpc.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // 2) Security Group for Postgres (DB lives in private subnets)
    const dbSg = new SecurityGroup(this, "DbSg", {
      vpc,
      description: "Security group for Postgres",
      allowAllOutbound: true,
    });

    dbSg.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    for (const subnet of vpc.publicSubnets) {
      const cidr = (subnet as Subnet).ipv4CidrBlock; // e.g. 10.0.0.0/24
      dbSg.addIngressRule(
        Peer.ipv4(cidr),
        Port.tcp(5432),
        `Allow Postgres from public subnet ${subnet.subnetId}`,
      );
    }

    const privateSubnetGroup = new SubnetGroup(this, "DbSubnetGroup", {
      vpc,
      description: "Private subnets for the DB",
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
    });

    // Aurora PostgreSQL Cluster
    const cluster = new DatabaseCluster(this, "AuroraPostgres", {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_14_6,
      }),
      vpc,
      credentials: Credentials.fromGeneratedSecret("postgres"),
      defaultDatabaseName: "appdb",
      subnetGroup: privateSubnetGroup,
      storageEncrypted: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      writer: ClusterInstance.provisioned("ClusterInstance", {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      }),
      securityGroups: [dbSg],
    });

    const bastionHost = new BastionHostLinux(this, "BastionHostLinux", {
      vpc,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
    });

    // Allow bastion to connect to database
    cluster.connections.allowFrom(bastionHost, Port.tcp(5432), "Allow bastion to connect to Aurora");

    // Grant bastion access to read database secret
    if (cluster.secret) {
      cluster.secret.grantRead(bastionHost.role);
    }

    // IAM policy statement
    const statement1 = new PolicyStatement({
      actions: ["secretsmanager:ListSecrets", "secretsmanager:GetSecretValue"],
      resources: ["*"],
    });

    // IAM policy statement
    const statement2 = new PolicyStatement({
      actions: ["ssm:GetParameter", "ssm:PutParameter"],
      resources: ["*"],
    });

    // IAM policy statement
    const statement3 = new PolicyStatement({
      actions: ["elasticloadbalancing:DescribeLoadBalancers"],
      resources: ["*"],
    });

    // Attach to bastion role
    bastionHost.role.addToPrincipalPolicy(statement1);
    // Attach to bastion role
    bastionHost.role.addToPrincipalPolicy(statement2);
    // Attach to bastion role
    bastionHost.role.addToPrincipalPolicy(statement3);

    // Output the secret ARN for reference
    new cdk.CfnOutput(this, "DatabaseSecretArn", {
      value: cluster.secret?.secretArn || "N/A",
      description: "ARN of the database credentials secret",
    });

    // Output the cluster endpoint
    new cdk.CfnOutput(this, "DatabaseEndpoint", {
      value: cluster.clusterEndpoint.hostname,
      description: "Aurora cluster endpoint",
    });
  }
}
