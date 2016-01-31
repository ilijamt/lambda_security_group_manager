Auto managing your AWS security groups with Lambda
==================================================

Configuration
-------------

### Environment

* **DIR_CONFIGS**: If set it will override the defined configs directory
* **DIR_PROCESSORS**: If set it will override the defined processors directory
* **CONCURRENCY**: If set it will override how many task can it run at one time

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