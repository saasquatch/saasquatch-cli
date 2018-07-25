//promisified file IO

import fs from 'fs';
import util from 'util';


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const fileExist = fs.existsSync;

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    fileExist: fileExist
}
