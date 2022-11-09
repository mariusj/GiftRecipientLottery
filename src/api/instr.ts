import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient";
import { ddbClient } from "./ddbClient";


/**
 * Returns a text of instructions.
 * @returns 
 */
export const getInstructions = async () => {
  const InstrParams = {
    TableName: "Texts",
    Key: {
      idx: "Instructions"
    },
  };

  try {
      const data = await ddbDocClient.send(new GetCommand(InstrParams));
      console.log("Success :", data.Item);
      return data.Item.Body;
    } catch (err) {
      console.log("Error", err);
      return "Błąd pobierania instrukcji";
    }
};


/**
 * Saves instructions into database.
 * @param body 
 * @returns 
 */
export async function saveInstructions(body: string) {
    console.log("saving instr " + body);
    try {
        const params = {
            TableName: "Texts",
            Key: {
                "idx": "Instructions"
            },
            UpdateExpression: "set Body = :s",
            ExpressionAttributeValues: {
                ":s": body
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await ddbClient.send(new UpdateCommand(params));
        console.log(result);
        return result;
    } catch (err) {
      console.log("Error", err);
      return "Błąd zapisywania instrukcji";
    }
};

