import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const REGION = "eu-central-1";

export const ddbClient = new DynamoDBClient({ region: REGION });

