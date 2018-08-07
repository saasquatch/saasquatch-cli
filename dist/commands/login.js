'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.takeLoginInfo = takeLoginInfo;

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fileIO = require('./fileIO');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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