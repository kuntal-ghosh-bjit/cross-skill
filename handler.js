const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
require('dotenv').config()
console.log(process.env)
const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
console.log("users",USERS_TABLE);
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
// const dynamoDbClientParams = {};
// if (process.env.IS_OFFLINE) {
//   dynamoDbClientParams.region = 'localhost'
//   dynamoDbClientParams.endpoint = 'http://localhost:8000'
// }

app.use(express.json());

app.get("/users", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      res.json(Item);
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});

app.get("/users/:userId", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      const {  userId, name,orderId ,firstName,lastName,address,productName,quantity } = Item;
      res.json({  userId, name,orderId ,firstName,lastName,address,productName,quantity });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});


app.post("/orders", async function (req, res) {
  const { userId, name,orderId ,firstName,lastName,address,productName,quantity } = req.body;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
      orderId:orderId,
      firstName:firstName,
      lastName:lastName,
      address:address,
      productName:productName,
      quantity:quantity
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json({ userId, name,orderId ,firstName,lastName,address,productName,quantity });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
