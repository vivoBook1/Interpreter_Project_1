const assert = require('assert');
const {test} = require('./test-util.js');

module.exports = eva => {

    // Math functions:

    test(eva, `(+ 1 6)`, 7);
    test(eva, `(+ (* 2 3) 7)`, 13);

    // Comparison:

    test(eva, `(> 1 5)`, false);
    test(eva, `(< 2 5)`, true);
    test(eva, `(== 5 5)`, true);

}