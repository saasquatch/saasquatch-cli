import inquirer from 'inquirer';
import dotenv from 'dotenv';
import {writeFile,readFile, fileExist, createEnvFile} from './fileIO';

//save login info in env
export async function login() {
    if(!fileExist('./.env')) {
        createEnvFile();
    }
    dotenv.config();

    if(!fileExist('./login.json')){
        await takeLoginInfo();
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
      try {
        const loginInfoBuf = await readFile('./login.json');
        const loginInfo = {...JSON.parse(loginInfoBuf.toString()),
            filePath:_filePath};
        return loginInfo;
      } catch (e) {
          console.error(e);
      }
}

async function takeLoginInfo() {  
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
