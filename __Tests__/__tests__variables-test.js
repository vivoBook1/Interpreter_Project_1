const assert = require('assert');
const testUtil = require('./test-util.js');

module.exports = eva => {
// Variables Decelaration:

assert.strictEqual(eva.eval(['var', 'x', 7]), 7);
assert.strictEqual(eva.eval(['var', 'y', 10]), 10);
assert.strictEqual(eva.eval(['var', 'bo', 'true']), true);

// Variable access:

assert.strictEqual(eva.eval('x'), 7);
assert.strictEqual(eva.eval('y'), 10);
assert.strictEqual(eva.eval('VERSION'), '0.1');

// Variable update

assert.strictEqual(eva.eval(
    ['begin',

        ['var', 'data', 10],

        ['begin',

            ['set', 'data', 100],
            
        ],

        'data'  
    ]),        
100);
};