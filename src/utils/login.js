import inquirer from 'inquirer';
import {writeFile} from './fileIO';

export async function takeLoginInfo() {
    const tenant = await inquirer.prompt({
        type:'input',
        name:'tenant',
        message:'Tenant:'
    });

    const apiKey = await inquirer.prompt({
        type:'input',
        name:'apiKey',
        message:'apiKey:'
    });

    const domain = await inquirer.prompt({
        type:'input',
        name:'domain',
        message:'domain (if not using default):',
        default: function() {
            return 'https://staging.referralsaasquatch.com';
        }
    });

    const logInfo = {
        tenant:tenant.tenant.trim(),
       apiKey:apiKey.apiKey.trim(),
       domain: domain.domain.trim()
    };

    try {
        await writeFile('./login.json', JSON.stringify(logInfo));
    } catch (e) {
        console.error(e);
    }
}
