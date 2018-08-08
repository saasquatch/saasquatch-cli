import inquirer from 'inquirer';
import {fileExist, readFile,appendFile} from './fileIO';
import { writeFile } from 'fs';

export async function takeUploadInfo() {
    const typename = await inquirer.prompt({
        type:'list',
        name:'typename',
        message:'Asset type:',
        choices:[
            'Email',
            'Widget',
            'Messaging',
            'Tenant Theme'
        ]
    });

    try {
        await writeFile('./login.json', JSON.stringify(loginData));
           
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

    const filePath = await inquirer.prompt({
        type:'input',
        name:'filePath',
        message:'file path',
        default: ()=> {
            return ('default: current directory');
        }
    });
    const _filePath = (filePath === 'default: current directory') ? process.pwd() : filePath;

    return {
        filePath: _filePath,
        typename: _typename
    };
} catch (e) {
    console.error(e);
}
}

export async function takeDownloadInfo() {
    try {
        const filePath = await inquirer.prompt({
            type:'input',
            name:'filePath',
            message:'file path',
            default: ()=> {
                return ('default: current directory');
            }
        });
        const _filePath = (filePath === 'default: current directory') ? process.pwd() : filePath;

        return {
            filePath: _filePath
        };
} catch (e) {
    console.error(e);
}
}