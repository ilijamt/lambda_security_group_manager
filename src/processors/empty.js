"use strict";

var util = require('util'),
    Processor = require('../processor.js');

/**
 * @classdesc An empty processor that extends from {@link Processor}
 * @class
 * @since 1.0.0
 *
 * @author Ilija Matoski <ilijamt@gmail.com>
 *
 * @augments Processor
 *
 * @param opts {Object} Processor parameters
 *
 * @constructor
 */
var EmptyProcessor = function EmptyProcessor(opts) {
    Processor.apply(this, [opts]);

    /**
     * The name of the Processor
     *
     * @type {string}
     */
    this.name = "EmptyProcessor";
};

util.inherits(EmptyProcessor, Processor);

module.exports = EmptyProcessor;