// @ts-check

import { h, render, Component, Color } from 'ink';
import { List, ListItem } from './components/checkbox-list';
import Spinner from 'ink-spinner';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import Query from './query/query';
import base64 from 'base-64';
import mkdirp from 'mkdirp';
import util from 'util';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const fs_writeFile = util.promisify(fs.writeFile);

class DownloadAssets extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tenantThemeData: null,
      programList: null,
      programMap: null,
      itemList: null,
      selectedItem: [],
      submitted: false,
      downloadDone: false
    };

    this.handleListSubmission = this.handleListSubmission.bind(this);
    this.handleAllDone = this.handleAllDone.bind(this);
  }

  async downloadData() {
    let assets, programData;
    let listItem = [];
    let progMap = {};
    let { domainname, tenant, auth } = this.props.options;

    //get Tenant Theme
    try {
      assets = await Query({
        domain: domainname,
        tenant: tenant,
        authToken: auth
      }).getAssets();

      assets.data.translatableAssets.forEach(asset => {
        const typename = asset.__typename;
        if (typename === 'TenantTheme') {
          this.setState({
            tenantThemeData: asset
          });
          listItem.push('TenantTheme');
        }
      });
    } catch (e) { 
      console.error(e);
    }

    try {
      programData = await Query({
        domain: domainname,
        tenant: tenant,
        authToken: auth
      }).listPrograms();
    } catch (e) {
      console.error(e);
    }

    programData.data.programs.data.forEach(program => {
      const programName = program.name.trim();
      listItem.push(programName);
      progMap[programName] = program.id;
    });

    if(listItem.length === 0) {
      console.log('\nNo available translatable asset found.');
      process.exit();
    }

    this.setState({
      programList: programData.data.programs,
      programMap: progMap,
      itemList: listItem
    });
  }

  componentWillMount() {
    this.downloadData();
  }

  componentWillUpdate() {
    if (this.state.downloadDone) {
      process.exit();
    }
  }

  handleListSubmission(list) {
    if(list.length > 0) {
    this.setState({
      selectedItem: list,
      submitted: true 
    }); 
  } else  {
    process.exit();
  }
  }

  handleAllDone() {
    this.setState({
      downloadDone: true
    });
  }

  render() {
    if (this.state.submitted) {
      return (
        <Downloading
          selectedItem={this.state.selectedItem}
          programList={this.state.programList}
          programMap={this.state.programMap}
          tenantThemeData={this.state.tenantThemeData}
          handleAllDone={this.handleAllDone}
          options={this.props.options}
        />
      );
    } else {
      if (this.state.itemList) {
        return (
          <ListFile
            itemList={this.state.itemList}
            onListSubmitted={this.handleListSubmission}
          />
        );
      }
    }
  }
}

class ListFile extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <br></br>  
          Use arrow keys to move between options. Use space to select and enter to submit.<br></br>  
        <List onSubmit={list => this.props.onListSubmitted(list)}>  
          {this.props.itemList.map(l => <ListItem>{l}</ListItem>)}
        </List> 
      </div>
    );
  }
}

class Downloading extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eachFileDone: {},
      allDone: false
    };

    this.handleDownloadDone = this.handleDownloadDone.bind(this);
  }

  handleDownloadDone(name) {
    this.setState(prevState => {
      let status = prevState.eachFileDone;
      if (status[name] !== undefined) {
        status[name] = true;
        let allFileChecked = true;
        Object.keys(status).forEach(k => {
          allFileChecked = allFileChecked && status[k];
        });
        return {
          eachFileDone: status,
          allDone: allFileChecked
        };
      }
    });
  }

  componentWillMount() {
    // set the list of download status track for each file
    this.dir = this.props.options.filepath;
    let status = {};
    this.props.selectedItem.map(item => {
      status[item] = false;
    });
    this.setState({
      eachFileDone: status
    });
  }

  componentDidUpdate() {
    if (this.state.allDone) {
      this.props.handleAllDone();
    }
  }

  render() {
    const downloadList = this.props.selectedItem.map(item => {
      if (this.state.eachFileDone[item]) {
        return <FinishCheckmark name={item} />;
      } else {
        return (
          <DownloadEachFile
            dir={this.dir}
            name={item}
            programMap={this.props.programMap}
            tenantThemeData={this.props.tenantThemeData}
            handleDownloadDone={this.handleDownloadDone}
            options={this.props.options}
          />
        );
      }
    });
    return <span>{downloadList}</span>;
  }
}

class DownloadEachFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      done: false
    };
  }

  async download() {
    const { domainname, tenant, auth } = this.props.options;
    let programData = null;

    if (this.props.name === 'TenantTheme') {
      const path = this.props.dir + '/TenantTheme';
      mkdirp.sync(path);
      //write default - in root asset folder
      await this.writeFile({
        data: JSON.stringify(this.props.tenantThemeData.variables),
        dir: this.props.dir,
        name: 'TenantTheme'
      });
      //write translations - in 'TenantTheme' folder
      const translations = this.props.tenantThemeData.translationInfo
        .translations;
      for (let i = 0; i < translations.length; i++) {
        await this.writeFile({
          data: JSON.stringify(translations[i].content),
          dir: path,
          name: translations[i].locale
        });
      }
      //handle tenantTheme done
      this.props.handleDownloadDone(this.props.name);
    } else {
      //per program
      const programId = this.props.programMap[this.props.name];
      try {
        const receivedData = await Query({
          domain: domainname,
          tenant: tenant,
          authToken: auth
        }).getProgramData(programId);
        programData = receivedData.data.program;
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
      const programRootPath = this.props.dir + '/' + this.props.name;
      mkdirp.sync(programRootPath);
      //put default in root folder of each program
      const assets = programData.translatableAssets;
      for (var i = 0; i < assets.length; i++) {
        const assetData = assets[i];
        const path = programRootPath + '/' + assetData.__typename;
        mkdirp.sync(path);
        //write default
        if (assetData.__typename === 'ProgramLinkConfig') {
          await this.writeFile({
            data: JSON.stringify(assetData.messaging),
            dir: path,
            name: 'default'
          });
          const transPath = path + '/default';
          this.writeTranslation(transPath, assetData);
        } else {
          await this.writeFile({
            data: JSON.stringify(assetData.values),
            dir: path,
            name: assetData.key
          });
          //write translations
          const transPath = path + '/' + assetData.key;
          await this.writeTranslation(transPath, assetData);
        }
    }
  }
    this.props.handleDownloadDone(this.props.name);
  }

   writeTranslation(transPath, assetData) {
    const translations = assetData.translationInfo.translations;
    mkdirp.sync(transPath);
    for (let i = 0; i < translations.length; i++) {
        this.writeFile({
        data: JSON.stringify(translations[i].content),
        dir: transPath,
        name: translations[i].locale
      });
    }
  }

  writeFile({ data, dir, name }) {
    const filePath =
      path.normalize(
        path.format({
          root: '/ignored',
          dir: dir,
          base: name
        })
      ) + '.json';

    return fs_writeFile(filePath, data, { encoding: 'utf8' });
  }

  componentDidMount() {
    this.download();
  }

  render() {
    return (
      <div>
        {' '}
        <Spinner green />  Downloading {this.props.name}{' '}
      </div>
    );
  }
}

class FinishCheckmark extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>{' '}
        <Color green>✔ </Color> {this.props.name} translations downloaded
        {' '}</div>
    );
  }
}

export default program => {
  let download = program.command('download');

  download
    .description('download an translation')
    .option('-d,--domainname <domainname>', 'required - domain') //naming collision with domain, use domain name instead
    .option('-k,--apiKey <apiKey>', 'required - authToken') //the apiKey, use authToken to avoid naming collision
    .option('-t,--tenant <tenant>', 'required - which tenant')
    .option('-f,--filepath <filepath>', 'required - the file path')
    .action(options => {
      if (!options.domainname || !options.apiKey || !options.tenant || !options.filepath) {
        console.log('Missing parameter');
        return;
    }
      const newOptions = {
        auth: base64.encode(':' + options.apiKey),
        ...options
      };
      render(<DownloadAssets options={newOptions} />);
    });

  return download;
};
