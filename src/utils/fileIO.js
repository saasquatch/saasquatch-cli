//promisified file IO

import fs from 'fs';
import util from 'util';


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const removeFile = util.promisify(fs.unlink);
const fileExist = fs.existsSync;
const appendFile = util.promisify(fs.appendFile);
const createEnvFile = () => {
    fs.createReadStream('.env.example')
    .pipe(fs.createWriteStream('.env'));
}
module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    removeFile: removeFile,
    appendFile: appendFile,
    fileExist: fileExist,
    createEnvFile: createEnvFile
}
