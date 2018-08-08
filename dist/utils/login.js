'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.login = login;

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _fileIO = require('./fileIO');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//save login info in env
async function login() {
    if (!(0, _fileIO.fileExist)('./.env')) {
        (0, _fileIO.createEnvFile)();
    }
    _dotenv2.default.config();

    if (!(0, _fileIO.fileExist)('./login.json')) {
        await takeLoginInfo();
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
    try {
        const loginInfoBuf = await (0, _fileIO.readFile)('./login.json');
        const loginInfo = _extends({}, JSON.parse(loginInfoBuf.toString()), {
            filePath: _filePath });
        return loginInfo;
    } catch (e) {
        console.error(e);
    }
}

async function takeLoginInfo() {
    const tenant = await _inquirer2.default.prompt({
        type: 'input',
        name: 'tenant',
        message: 'Tenant:'
    });

    const apiKey = await _inquirer2.default.prompt({
        type: 'input',
        name: 'apiKey',
        message: 'apiKey:'
    });

    const domain = await _inquirer2.default.prompt({
        type: 'input',
        name: 'domain',
        message: 'domain (if not using default):',
        default: function () {
            return 'https://staging.referralsaasquatch.com';
        }
    });

    const logInfo = {
        tenant: tenant.tenant.trim(),
        apiKey: apiKey.apiKey.trim(),
        domain: domain.domain.trim()
    };

    try {
        await (0, _fileIO.writeFile)('./login.json', JSON.stringify(logInfo));
    } catch (e) {
        console.error(e);
    }
}