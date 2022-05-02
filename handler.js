const AWS = require("aws-sdk");
const serverless = require("serverless-http");
const express = require("express");
const app = express();

const DEMO_TABLE = process.env.DEMO_TABLE;
const dynamodb = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/items", async function (req, res) {
  
  const params = {
    TableName: DEMO_TABLE,
    Key: {
      itemKey: req.body.itemKey,
    },
  };

  try {
    const { Item } = await dynamodb.get(params).promise();
    if (Item) {
      const { itemKey, name } = Item;
      res.json({ itemKey, name });
    } else {
      res
        .status(404)
        .json({ error: '404: Could not locate item' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not locate item" });
  }
});

 
app.post("/addItem", async function (req, res) {
  const { itemKey, name } = req.body;

  const params = {
    TableName: DEMO_TABLE,
    Item: {
      itemKey: itemKey,
      name: name
    },
  };

  try {
    await dynamodb.put(params).promise();
    res.json({ "itemKey": itemKey, "name": name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error, tablename: DEMO_TABLE, params: params, reqbody: req });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
