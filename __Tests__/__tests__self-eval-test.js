const assert = require('assert');
const testUtil = require('./test-util.js');

module.exports = eva => {
//assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"Hello"'), 'Hello');
};
