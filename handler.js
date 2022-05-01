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
    res.json({"body": req.body});
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
