import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ScanCommand, BatchWriteItemCommand, WriteRequest } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "./ddbDocClient";
import { ddbClient } from "./ddbClient";
import { User, getUsers, getUserById } from "./users";


type DrawInfo = {
    fromId: number;
    toId: number;
  }
  
  

/**
 * Clears a table with drawn info.
 * @returns 
 */
 export async function clearDrawnTable() {
    console.log("clearing drawn table");
    const params = {
      // Set the projection expression, which the the attributes that you want.
      ProjectionExpression: "fromId",
      TableName: "Drawn",
    };
    const data = await ddbClient.send(new ScanCommand(params));
    if (!data.Items || data.Items.length == 0) {
      return;
    }
    const drawnArray = data.Items.map(user => {
      return {
        DeleteRequest: {
          Key: { "fromId": { "N": "" + user.fromId.N } }
        }
      } 
    });
  
    let delParams = {
      RequestItems: {
        "Drawn": drawnArray
      }
    };
    await ddbClient.send(new BatchWriteItemCommand(delParams));
  }
  
  
  /**
   * Saves drawn info.
   * @param drawnArray 
   */
  async function saveDrawn(drawnArray: DrawInfo[]) {
    console.log("save drawn");
    let drawnArray2: WriteRequest[] = drawnArray.map(d => {
      return {
        PutRequest: {
          Item: {
            "fromId": { N: "" + d.fromId },
            "toId": { N: "" + d.toId }
          }
        },      
      }
    });
    let params = {
      RequestItems: {
        "Drawn": drawnArray2
      }
    };
    let res = await ddbClient.send(new BatchWriteItemCommand(params));
    console.dir(res);
  }
  
  
  /**
   * Draws people. Saves this info into database.
   */
  export async function drawUsers() {
    await clearDrawnTable();
    console.log("shuffling");
    let users = await getUsers();
    shuffle(users);
    let ids = users.map(u => u.id);
    let drawnArray: DrawInfo[] = [];
    for (let i=0; i<users.length-1; i++) {
      drawnArray.push({ "fromId": ids[i], "toId": ids[i+1] });
    }
    drawnArray.push({ "fromId": ids[users.length - 1 ], "toId": ids[0] });
    await saveDrawn(drawnArray);
  }
  
  
  
  export async function getDrawnPerson(user: User): Promise<string> {
    console.log(`getting drawn for ${user.id}`)
    const params = {
      TableName: "Drawn",
      Key: {
        fromId: user.id
      },
    };
    const data = await ddbDocClient.send(new GetCommand(params));
    console.dir(data);
    if (data.Item) {
      let u = await getUserById(data.Item.toId);
      console.log(`getting drawn ${u.id} ${u.userName}`);
      return u?.userName;
    }
    return null;
  }
  
  
  function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
  
  