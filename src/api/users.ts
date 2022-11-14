import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ReplicaGlobalSecondaryIndexAutoScalingDescriptionFilterSensitiveLog, ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "./ddbDocClient";
import { ddbClient } from "./ddbClient";
import { AstroCookies } from "astro/dist/core/cookies";
import { clearDrawnTable } from "./draw";


export type User = {
    id: number,
    userName: string,
    email: string,
    isAdmin?: boolean,
    pin?: string
}


/**
 * Converts data returned from query to a User object.
 * @param data data
 * @returns 
 */
function toUser(data): User {
    console.log(`converting data to User ${data.Item.id}`);
    if (data.Item) {
        return {
            id: data.Item.id,
            userName: data.Item.userName,
            email: data.Item.email
        }
    }
    return null;
}


/**
 * Returns logged in user.
 * @param cookies cookies
 * @returns 
 */
export async function getCurrentUser(cookies: AstroCookies): Promise<User> {
    console.log("checking logged user");
    if (cookies.has("session")) {
        let id = parseInt(cookies.get("session").value);
        console.log(`has cookie ${id}`);
        let u = await getUserById(id);
        if (u.email == "mariusz.jakubowski.79@gmail.com") {
            u.isAdmin = true;
        }
        return u;
    }
    return null;
}


/**
 * Returns a user by the email.
 * @param email 
 * @returns 
 */
async function getUserByEmail(email: string, pin: string): Promise<User> {
    console.log(`query for user ${email}`);
    const params = {
      FilterExpression: "email = :e AND pin = :p",
      ExpressionAttributeValues: {
        ":e": {S: email},
        ":p": {S: pin}
      },
      ProjectionExpression: "id, userName, email",
      TableName: "Users",
    };
    const data = await ddbClient.send(new ScanCommand(params));
    if (data.Items && data.Items.length > 0) {
      console.log("user found");
      const u = data.Items[0];
      return {
        'id': parseInt(u.id.N), 
        'userName': u.userName.S, 
        'email': u.email.S
      }
    } else {
      console.warn("user not found");
    }
    return null;
}


/**
 * Returns user with a given id.
 * @param id 
 * @returns 
 */
export async function getUserById(id: number) {
    console.log(`get user by id ${id}`);
    const userParams = {
        TableName: "Users",
        Key: {
            id: id
        },
    };
    const data = await ddbDocClient.send(new GetCommand(userParams));
    return toUser(data);
}


/**
 * Try to log-in user.
 * @param email 
 * @returns 
 */
export async function login(email: string, pin: string): Promise<User> {
    return await getUserByEmail(email, pin);
}

/**
 * Get all users.
 * @returns 
 */
export async function getUsers(): Promise<User[]> {
    console.log("list users");
    const params = {
      // Set the projection expression, which the the attributes that you want.
      ProjectionExpression: "id, userName, email, pin",
      TableName: "Users",
    };
    const data = await ddbClient.send(new ScanCommand(params));
    const users: User[] = data.Items.map(u => { 
      const user = { 'id': parseInt(u.id.N), 'userName': u.userName.S, 'email': u.email.S } as User;
      return user;
    });
    return users;
  }
  
  
  const cyrb53 = (str, seed = 0) => {
      let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
      for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      
      return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };

function generatePin(): string {
  let pin = "";
  for (let i=0; i<4; i++) {
    pin += Math.floor(Math.random() * 10);
  }
  return pin;
}
  
  
/**
 * Saves a new user in a database.
 * @param user 
 * @returns 
 */
export async function addUser(user: User) {
  console.log(`creating user ${user.email}`);
  const params = {
    TableName: "Users",
    Item: {
      'id': cyrb53(user.userName + "#" + user.email),
      'userName': user.userName,
      'email': user.email,
      'pin': generatePin()
    },
  };
  console.dir(params);
  const data = await ddbDocClient.send(new PutCommand(params));
  await clearDrawnTable();
  return data;      
}
  
  
/**
 * Deletes an user.
 * @param id 
 */
export async function deleteUser(id: number) {
  console.log(`deleting user ${id}`);
  const params = {
    TableName: "Users",
    Key: {
      "id": id
    }
  };
  let data = await ddbDocClient.send(new DeleteCommand(params));
  await clearDrawnTable();
  return data;
}
