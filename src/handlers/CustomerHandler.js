const { validate } = require('../validators/CustomerValidator');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const CUSTOMER_TABLE = process.env.CUSTOMER_TABLE;
app.use(bodyParser.json({ strict: false }));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.get('/customer/:id', function (request, response) {
    const params = { TableName: CUSTOMER_TABLE, Key: { id: request.params.id }};
    dynamoDb.get(params, (error, result) => {
        if (error) {
          console.log(error);
          response.status(400).json({ error: 'Could not get customer' });
        }
        if (result.Item) {
            response.json(result.Item);
        } else {
            response.status(404).json({ error: "Customer not found" });
        }
      });
});

app.get('/customer/', function (request, response) {
    const params = { TableName: CUSTOMER_TABLE }
    dynamoDb.scan(params, (error, result) => {
        if (error) {
          console.log(error);
          response.status(400).json({ error: 'Could not get user' });
        }
        if (result) {
            response.json(result.Items);
        } else {
            response.status(404).json({ error: "Customer not found" });
        }
      });
});


app.post('/customer/', function (request, response) {
    const validationResult = validate(request.body);
    if (!validationResult.success) {
        response.status(400).json(validationResult);
    }
    const { name, active, email, phone } = request.body;
    const id = uuidv4();
    const createdAt = new Date().toString();
    const params = {
        TableName: CUSTOMER_TABLE,
        Item: { id, name, active, email, phone, createdAt },
    };

  dynamoDb.put(params, (error, data) => {
    if (error) {
      console.log(error);
      response.status(400).json({ error: 'Could not create customer' });
    }
    response.json({id, name, active, email, phone, createdAt });
  });
});


app.delete('/customer/:id', function (request, response) {

    if (request.params.id === undefined) {
        response.status(400).json({ error: "'id' field is required" });
    }
    
    const params = {
        TableName: CUSTOMER_TABLE,
        Key: { id: request.params.id },
    }
    
    dynamoDb.delete(params, (error, result) => {
        if (error) {
          console.log(error);
          response.status(400).json({ error: 'Could not delete customer' });
        }
        response.json({ success: true});
        
      });
});

app.put('/customer/:id', function (request, response) {
    const validationResult = validate(request.body);
    if (!validationResult.success) {
        response.status(400).json(validationResult);
    }

    if (request.params.id === undefined) {
        response.status(400).json({ error: "'id' field is required" });
    }

    const { name, active, email, phone } = request.body;
    const params = {
        TableName: CUSTOMER_TABLE,
        Key: { id: request.params.id },
        UpdateExpression: "set #name = :name, #active = :active, #email = :email, #phone = :phone",
        ExpressionAttributeNames: {
            "#name": 'name',
            "#active": 'active',
            "#email": 'email',
            "#phone": 'phone',
        },
        ExpressionAttributeValues: {
            ':name': name,
            ':active': false,
            ':email': email, 
            ':phone': phone,
        },
        ReturnValues:"UPDATED_NEW"
    };

    dynamoDb.update(params, (error, data) => {
        if (error) {
        console.log(error);
        response.status(400).json({ message: 'Could not update customer', error });
        }
        response.json({id: request.params.id, name, active, email, phone });
    });
});

module.exports.handler = serverless(app);