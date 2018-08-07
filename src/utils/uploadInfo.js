import inquirer from 'inquirer';
import {fileExist, readFile,appendFile} from './fileIO';
import { writeFile } from 'fs';

export async function takeUploadInfo() {
        let currentProgramId = null;
        const buf = await readFile('./login.json');
        let loginData = JSON.parse(buf.toString());
        currentProgramId = loginData.programId;
    if (currentProgramId === undefined) {
        currentProgramId = await inquirer.prompt({
        type:'input',
        name:'programId',
        message:'programId',
        default: () => {
            if(currentProgramId) {
                return currentProgramId;
            }
        }
    });
    loginData.programId = currentProgramId;
}


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

    return {
        programId: currentProgramId,
        typename: _typename
    };
} catch (e) {
    console.error(e);
}
}


// export async function takeLoginInfo() {
//     const tenant = await inquirer.prompt({
//         type:'input',
//         name:'tenant',
//         message:'Tenant:'
//     });

//     const apiKey = await inquirer.prompt({
//         type:'input',
//         name:'apiKey',
//         message:'apiKey:'
//     });

//     const domain = await inquirer.prompt({
//         type:'input',
//         name:'domain',
//         message:'domain (if not using default):',
//         default: function() {
//             return 'https://staging.referralsaasquatch.com';
//         }
//     });

//     const logInfo = {
//         tenant:tenant.tenant.trim(),
//        apiKey:apiKey.apiKey.trim(),
//        domain: domain.domain.trim()
//     };

//     try {
//         await writeFile('./login.json', JSON.stringify(logInfo));
//     } catch (e) {
//         console.error(e);
//     }
// }