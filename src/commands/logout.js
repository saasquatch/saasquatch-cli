import {removeFile, fileExist} from '../utils/fileIO';

export default program => {
    let logout = program.command('logout');
  
    logout
      .description('log out')
      .action( async options => {
        if(fileExist('./login.json')) {
            try {
                await removeFile('./login.json');
            } catch(e) {
                console.error(e);
            }
        }});
    
        return logout;
}