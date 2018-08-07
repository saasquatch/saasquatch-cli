'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fileIO = require('../utils/fileIO');

exports.default = program => {
    let logout = program.command('logout');

    logout.description('log out').action(async options => {
        if ((0, _fileIO.fileExist)('./login.json')) {
            try {
                await (0, _fileIO.removeFile)('./login.json');
            } catch (e) {
                console.error(e);
            }
        }
    });

    return logout;
};