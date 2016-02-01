'use strict';

/**
 * Lambda Function Handler, invoked by AWS Lambda when it's time to run. Go over all the configuration files, and processors. Inovkes {@link Runner}.
 *
 * @constructor
 *
 * @module LambdaDefaultHandler
 *
 * @param {object} event  AWS Lambda uses this parameter to pass in event data to the handler
 * @param {object} context AWS Lambda uses this parameter to provide your handler the runtime information of the Lambda function that is executing
 */
exports.handler = function handler(event, context) {
  var Runner = require('./src/runner');

  context = context || require('./src/context');

  Runner.run()
    .then(function(data) {
      context.succeed(data);
    })
    .fail(function(error) {
      context.fail(error);
    });
};

exports.handler();
