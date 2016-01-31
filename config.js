/**
 * @module config
 *
 * @description Configuration object that configures how the system behaves
 *
 * @property {string} configs The configs relative directory (default value: ./configs)
 * @property {string} processors The processors relative directory (default value: ./src/processors)
 * @property {number} concurrency How many items should it run concurrently (default value: 5)
 *
 * @type {Object}
 */
module.exports = {
    "configs": process.env.DIR_CONFIGS || "./configs",
    "processors": process.env.DIR_PROCESSORS || "./src/processors",
    "concurrency": parseInt(process.env.CONCURRENCY) || 5
};