AWS Developer Associate Content Series : Using Events to Invoke AWS Lambda
==========================================================================

<a href=https://rscott-aws-developer.atlassian.net/wiki/spaces/ADACS/pages/13074433/Using+Events+to+Invoke+AWS+Lambda>Link to original article</a>
--------------------
Created by Rob Scott on May 05, 2022

The main approach to execute Lambda’s has been through API Gateway thus far. This demonstration will dive a bit deeper into event-driven architecture and [asynchronous invocation](https://rscott-aws-developer.atlassian.net/wiki/spaces/ADACS/pages/12353537/Synchronous+vs+Asynchronous+Invocation). This demonstration is going to use the existing serverless development repository (see [the previous demonstration](https://rscott-aws-developer.atlassian.net/wiki/spaces/ADACS/pages/9961475/Serverless) ) and add another Lambda with an event source-- Amazon S3.

**NOTE:** This demonstration builds on [Serverless Development Repository](https://github.com/rscott-senior-project/serverless-dev-dynamodb/tree/dynamodb) on GitHub. Refer to the `s3-event` branch to see the code for this demo.

Objective
---------

The objective is to provision and configure an S3 bucket that can store objects, and invoke a Lambda as a result of any object being stored. This parallels a variety of use-cases-- uploading pictures to be resized, building a file storage framework that runs in tandem with DynamoDB, writing comprehensive logs for audit trails, etc.

Another large benefit of this approach is that the entire system will be provisioned from _infrastructure as code_. This supports portability of code, easy version control, and minimizes user mistakes when orchestrating such systems.

Infrastructure as Code
----------------------

Much of this system is relies only on the infrastructure as code. From the original `serverless.yml` file, observe the new code that is added for the S3 event trigger.

    service: serverless-dev-demo
    frameworkVersion: '3'

    custom:
      tableName: 'rsp-demo-table-${sls:stage}'
      #################  NEW CODE  ##########################
  
      bucketName: 'rsp-s3-event-trigger-${sls:stage}'
  
      #################  NEW CODE  ##########################

    provider:
      name: aws
      runtime: nodejs14.x
      iam:
        role:
          statements:
            - Effect: Allow
              Action:
                - dynamodb:Query
                - dynamodb:Scan
                - dynamodb:GetItem
                - dynamodb:PutItem
                - dynamodb:UpdateItem
                - dynamodb:DeleteItem
              Resource:
                - Fn::GetAtt: [ DemoTable, Arn ]
      environment:
        DEMO_TABLE: ${self:custom.tableName}

    functions:
      api:
        handler: handler.handler
        events:
          - httpApi: '*'
      
      ########################  NEW CODE  ##########################
  
      s3-trigger:
        handler: s3-event.handler
        events:
          - s3:
              bucket: ${self:custom.bucketName}
              event: s3:ObjectCreated:*
  
      ########################  NEW CODE  ##########################

    resources:
      Resources:
        DemoTable:
          Type: AWS::DynamoDB::Table
          Properties:
            AttributeDefinitions:
              - AttributeName: itemKey
                AttributeType: S
            KeySchema:
              - AttributeName: itemKey
                KeyType: HASH
            BillingMode: PAY_PER_REQUEST
            TableName: ${self:custom.tableName}

Let's break down the additions and how AWS is going to configure this event-driven job.

#### 1\. s3-trigger

Just like `api`, this is the name of a Lambda that AWS will create for us. Everything specified below specifies how it should be invoked. The source code is located in a new `.js` file that will be added shortly.

#### 2\. s3

This key, in and of itself, declares that the event will be coming from S3. The rest of the specifications declare the _where and how_ of the event signal. For example, `api` has an `events` section that says `httpApi`, which makes sense because it is invoked through API Gateway. In the previous example, those `curl` commands were going through API Gateway.

The `bucket` option gives a name for the S3 bucket that the events will originate from, and it will only signal when an object is created, per the `s3:ObjectCreated:*` rule.

**NOTE:** Serverless Framework will recognize that there should be an S3 bucket once the `.yml` file declares an S3 event invoking the Lambda. There is no need to declare a bucket in the `resources` section, as Serverless has already acknowledged the need for a bucket with event trigger configurations.

#### 3\. custom

Adding a `bucketName` field is for general coding best practice. This name is used in the `bucket` field, which is directly referenced by AWS when creating a new S3 bucket. Its important to save that outside of the Lambda spec because it may be used for a different purpose elsewhere when the `serverless.yml`file gets more complicated.

Source Code
-----------

Make a new file with the name `s3-event.js`

    'use strict';

    module.exports.handler = async (event) => {
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: 'Go Serverless v3.0! Your function executed successfully!',
            input: event,
          },
          null,
          2
        ),
      };
    };

This _extremely simple_ code is meant to execute and return the event (originating from our newly decided S3 source). Back in the `serverless.yml` file, this handler is referenced for the code to execute in `s3-trigger`.

Verify the Invocation
---------------------

Use `serverless deploy` to deploy all of the changes made in this repository. If you want to separate the progress between the DynamoDB stage and the S3 event stage, check out a new branch first and deploy from there after you have committed the changes.

The deployment should be successful, and now there will be another Lambda in the Lambda console and a fresh S3 bucket in the S3 console.

Upload any file to S3 through the prompts. Next, navigate back to the Lambda console and click on the monitoring tab. Click on the _View on CloudWatch_ tab and view the log groups. Since this is a new function, there should be only one log group-- from the invocation that S3 just triggered. Look through the logs and verify that no errors were reported, and there we have it! This system just invoked a Lambda with an S3 event triggered by an upload.

Document generated by Confluence on May 10, 2022 20:30

[Atlassian](http://www.atlassian.com/)
