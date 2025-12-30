import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// 1. Import X-Ray SDK
import * as AWSXRay from "aws-xray-sdk-core";

// 2. DevOps Strategy: Prevent crashing if X-Ray context is missing (local testing)
AWSXRay.setContextMissingStrategy("LOG_ERROR");

// 3. Wrap the base client and then create the DocumentClient from it
const baseClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const ddb = DynamoDBDocumentClient.from(baseClient);

const TABLE_NAME = process.env.TABLE_NAME!;

function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event: any, context: Context): Promise<APIGatewayProxyResultV2> {
    console.log("event",event)
  // Use the helper to get the segment provided by API Gateway (Pass-through)
  const segment = AWSXRay.getSegment();

  const method = event?.requestContext?.http?.method || event?.httpMethod || "UNKNOWN";
  const rawPath = event?.rawPath || event?.path || "";
  const pathParams = event?.pathParameters || {};
  const requestId = context.awsRequestId;

  // Add Annotations to the main segment for searching/filtering in the console
  if (segment) {
    segment.addAnnotation("requestId", requestId);
    segment.addAnnotation("method", method);
    segment.addAnnotation("path", rawPath);
  }

  try {
    if (method === "POST" && rawPath.endsWith("/items")) {
      const bodyStr = event?.body ?? "{}";
      const body = typeof bodyStr === "string" ? JSON.parse(bodyStr) : bodyStr;

      if (!body?.id) return json(400, { message: "Missing required field: id" });

      // 4. Manual Subsegment for Business Logic (The pattern we discussed)
      const subsegment = segment?.addNewSubsegment("PutItemLogic");
      try {
        subsegment?.addMetadata("incomingBody", body);

        await ddb.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              id: String(body.id),
              payload: body.payload ?? null,
              createdAt: new Date().toISOString(),
            },
          })
        );
      } finally {
        subsegment?.close(); // Always close in finally block
      }

      return json(201, { ok: true, id: String(body.id) });
    }

    if (method === "GET" && rawPath.includes("/items/")) {
      const id = pathParams.id;
      if (!id) return json(400, { message: "Missing path parameter: id" });

      // This call is automatically traced as a subsegment by ddbClient
      const res = await ddb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: String(id) },
        })
      );

      if (!res.Item) return json(404, { message: "Not found", id });
      return json(200, res.Item);
    }

    return json(404, { message: "Route not found", method, rawPath });
  } catch (err: any) {
    console.error("ERROR", err);
    // Tell X-Ray about the failure
    segment?.addError(err); 
    return json(500, { message: "Internal error", error: err?.message ?? "unknown" });
  }
}