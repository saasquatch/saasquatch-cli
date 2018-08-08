'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.takeUploadInfo = takeUploadInfo;
exports.takeDownloadInfo = takeDownloadInfo;

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fileIO = require('./fileIO');

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function takeUploadInfo() {
    const typename = await _inquirer2.default.prompt({
        type: 'list',
        name: 'typename',
        message: 'Asset type:',
        choices: ['Email', 'Widget', 'Messaging', 'Tenant Theme']
    });

    try {
        await (0, _fs.writeFile)('./login.json', JSON.stringify(loginData));

        let _typename = null;
        switch (typename) {
            case 'Email':
                _typename = 'ProgramEmailConfig';
                break;
            case 'Widget':
                _typename = 'ProgramWidgetConfig';
                break;
            case 'Messaging':
                _typename = 'ProgramLinkConfig';
                break;
            case 'Tenant Theme':
                _typename = 'TenantTheme';
                break;
            default:
                break;
        }

        const filePath = await _inquirer2.default.prompt({
            type: 'input',
            name: 'filePath',
            message: 'file path',
            default: () => {
                return 'default: current directory';
            }
        });
        const _filePath = filePath === 'default: current directory' ? process.pwd() : filePath;

        return {
            filePath: _filePath,
            typename: _typename
        };
    } catch (e) {
        console.error(e);
    }
}

async function takeDownloadInfo() {
    try {
        const filePath = await _inquirer2.default.prompt({
            type: 'input',
            name: 'filePath',
            message: 'file path',
            default: () => {
                return 'default: current directory';
            }
        });
        const _filePath = filePath === 'default: current directory' ? process.pwd() : filePath;

        return {
            filePath: _filePath
        };
    } catch (e) {
        console.error(e);
    }
}