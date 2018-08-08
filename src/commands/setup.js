import {createEnvFile} from '../utils/fileIO';

export default program => {
    let setup = program.command('setup');
  
    setup
      .description('setup env')
      .action (  options => {
        createEnvFile();
      });
    return setup;
    }
  