Auto managing your AWS security groups with Lambda
==================================================

Configuration
-------------

### Environment

* **DIR_DEFS**: If set it will override the defined definitions directory
* **EXT_DEFS**: If set it will override the defined extension for definitions
* **DIR_PROCESSORS**: If set it will override the defined processors directory
* **EXT_PROCESSORS**: If set it will override the defined processors for definitions
* **CONCURRENCY**: If set it will override how many task can it run at one time
* **AMAZON_API_VERSION**: If set it will override the default version of the Amazon API
* **AMAZON_REGION**: If set it will override the default region of the Amazon API

### Lambda

You need to create a file called **lambda.json**, that has the following data

```json
{
    "region": "<AWS REGION>",
    "handler": "index.handler",
    "role": "arn:aws:iam::<ID>:role/<ROLE_NAME>",
    "functionName": "<FUNCTION_NAME>",
    "timeout": <LAMBDA FUNCTION TIMEOUT IN SECONDS>,
    "memorySize": <LAMDA MAXIMUM MEMORY IN MB>,
    "runtime": "nodejs"
}
```

A configuration example

```json
{
    "region": "eu-west-1",
    "handler": "index.handler",
    "role": "arn:aws:iam::123456789012:role/my_lambda_role",
    "functionName": "my_lambda_function",
    "timeout": 60,
    "memorySize": 128,
    "runtime": "nodejs"
}
```

#### Required permisions

The following are the required permissions for the lambda function in question.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1452604809000",
      "Effect": "Allow",
      "Action": [
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:DescribeSecurityGroups",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupIngress"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```