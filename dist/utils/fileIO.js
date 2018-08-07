'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//promisified file IO

const readFile = _util2.default.promisify(_fs2.default.readFile);
const writeFile = _util2.default.promisify(_fs2.default.writeFile);
const removeFile = _util2.default.promisify(_fs2.default.unlink);
const fileExist = _fs2.default.existsSync;
const appendFile = _util2.default.promisify(_fs2.default.appendFile);

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    removeFile: removeFile,
    appendFile: appendFile,
    fileExist: fileExist
};