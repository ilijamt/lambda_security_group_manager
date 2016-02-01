'use strict';

/**
 * AWS Lambda function context dummy object
 *
 * {@link http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html}
 *
 * @constructor
 */
function Context() {}

/**
 * Indicates the Lambda function execution and all callbacks completed successfully. Here's the general syntax:
 *
 * @param {?object} result is an optional parameter and it can be used to provide the result of the function execution
 */
Context.prototype.succeed = function succeed(result) {
  console.log('context#succeed', result);
};

/**
 * Indicates the Lambda function execution and all callbacks completed unsuccessfully, resulting in a handled exception.
 *
 * @param {?error} error is an optional parameter that you can use to provide the result of the Lambda function execution
 */
Context.prototype.fail = function fail(error) {
  console.log('context#fail', error);
};

/**
 * Causes the Lambda function execution to terminate.
 *
 * @param {?error} error is an optional parameter that you can use to provide the result of the Lambda function execution
 * @param {?object} result is an optional parameter and it can be used to provide the result of the function execution
 */
Context.prototype.done = function fail(error, result) {
  console.log('context#done', error, result);
};

module.exports = new Context();
