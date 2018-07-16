// @ts-check

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const { h, render, Component, Color } = require('ink');
const Spinner = require('ink-spinner');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const Query = require('./query/query');
const base64 = require('base-64');
const glob = require('glob');
const LocaleCode = require('locale-code');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const currentValidTypes = ['TenantTheme', 'ProgramEmailConfig', 'ProgramWidgetConfig', 'ProgramLinkConfig'];

class UploadAssets extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputData: {},
      validKeys: [],
      filelist: [],
      allDone: false
    };
    this.handleUploadAllDone = this.handleUploadAllDone.bind(this);
    this.setFileList = this.setFileList.bind(this);
  }

  handleUploadAllDone() {
    this.setState({
      allDone: true
    });
  }

  setFileList(list) {
    if (list.length === 0) {
      console.log('\nNo valid translation file found.');
      process.exit();
    }
    this.setState({
      filelist: list
    });
  }

  async setValidKeys() {
    let { domainname, tenant, auth, typename, programId } = this.props.options;
    let assets = null;
    let keys = [];

    if (typename === 'TenantTheme') {
      keys.push('TenantTheme');
    } else if (typename === 'ProgramLinkConfig') {
      keys.push('default');
    } else {
      if (programId === undefined) {
        console.log('Program ID required for ProgramEmailConfig, ProgramWidgetConfig, ProgramLinkConfig');
        process.exit();
      }

      try {
        const receivedData = await Query({
          domain: domainname,
          tenant: tenant,
          authToken: auth
        }).getProgramData(programId);
        if (receivedData.data.program) {
          assets = receivedData.data.program.translatableAssets;
        } else {
          console.log('Program with id ' + programId + ' not found in current tenant.');
          process.exit(0);
        }
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
      assets.forEach(asset => {
        if (asset.__typename === typename && !keys.includes(asset.key)) {
          keys = [...keys, asset.key];
        }
      });
    }
    this.setState({
      validKeys: keys
    });
  }

  componentWillMount() {
    //get valid assetKeys for this tenant
    this.setValidKeys();
  }

  componentWillUpdate() {
    if (this.state.allDone) {
      process.exit();
    }
  }

  render() {
    if (this.state.filelist.length > 0) {
      return h(UploadingFiles, {
        handleUploadAllDone: this.handleUploadAllDone,
        filelist: this.state.filelist,
        options: this.props.options
      });
    } else {
      //in the process of reading file
      if (this.state.validKeys.length > 0) {
        return h(ReadingFile, {
          options: this.props.options,
          validKeys: this.state.validKeys,
          setFileList: this.setFileList
        });
      }
    }
  }
}

//check if the filename matches the locale format
function validateLocale(dir) {
  let locale = getNameFromPath(dir);
  const temp = locale.split('_');
  if (temp.length > 1) {
    locale = temp[0] + '-' + temp[1];
  }
  return LocaleCode.validate(locale.split('.')[0]);
}

function getNameFromPath(path) {
  const names1 = path.split('\\');
  const names2 = names1[names1.length - 1].split('/');

  return names2[names2.length - 1];
}

function getKeyFromPath(path) {
  const names1 = path.split('\\');
  if (names1.length > 1) {
    return names1[names1.length - 2];
  } else {
    const names2 = path.split('/');
    return names2[names2.length - 2];
  }
}

class Checkmark extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return h(
      'div',
      null,
      ' ',
      h(
        Color,
        { green: true },
        ' \u2714 '
      ),
      ' Uploaded ',
      this.props.name,
      ' '
    );
  }
}

//Validate and get a list of paths of all files to be uploaded
class ReadingFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      noFile: false
    };
  }

  //put valid keys into a pattern string for directory traversal and validation
  getValidKeyPattern(validKeys) {
    //valid key patterns
    let pattern = '@(';
    validKeys.forEach(key => {
      pattern = pattern + key + '|';
    });
    return pattern.substring(0, pattern.length - 1) + ')';
  }

  getValidFilelist(filelist, validKeys) {
    return filelist.filter(filename => {
      let name = filename.split('/');
      if (!validateLocale(name[name.length - 1])) {
        console.log(filename + ' : invalid locale code');
      }
      return validKeys.includes(name[name.length - 2]) && validateLocale(name[name.length - 1]);
    });
  }

  componentDidMount() {
    const validKeys = this.props.validKeys;
    const validKeyPattern = this.getValidKeyPattern(validKeys);
    let pattern = null;
    if (fs.lstatSync(this.props.options.filepath).isDirectory()) {
      pattern = this.props.options.filepath + '/**/' + validKeyPattern + '/*.json';
    } else {
      pattern = this.props.options.filepath;
    }
    glob(pattern, { mark: true }, (err, files) => {
      if (err) {
        console.error(err);
        process.exit();
      }
      const validfiles = this.getValidFilelist(files, validKeys);
      if (validfiles.length === 0) {
        this.setState({ noFile: true });
      }
      this.props.setFileList(validfiles);
    });
  }

  render() {
    if (this.state.noFile) {
      return;
    } else {
      return;
      h(
        'div',
        null,
        ' ',
        h(Spinner, { green: true }),
        ' Reading',
        ' '
      );
    }
  }
}

class UploadingFiles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eachFileDone: {},
      allDone: false
    };

    this.handleSingleUploadDone = this.handleSingleUploadDone.bind(this);
  }

  componentWillMount() {
    let temp = {};
    this.props.filelist.forEach(path => {
      temp[path] = false;
    });
    this.setState({
      eachFileDone: temp
    });
  }

  componentDidUpdate() {
    if (this.state.allDone) {
      this.props.handleUploadAllDone();
    }
  }

  handleSingleUploadDone(name) {
    this.setState(prevState => {
      let status = prevState.eachFileDone;
      status[name] = true;
      let allFileChecked = true;
      Object.keys(status).forEach(k => {
        allFileChecked = allFileChecked && status[k];
      });
      return {
        eachFileDone: status,
        allDone: allFileChecked
      };
    });
  }

  render() {
    const uploadComponentList = this.props.filelist.map(path => {
      if (this.state.eachFileDone[path]) {
        return h(
          'div',
          null,
          ' ',
          h(
            Color,
            { green: true },
            ' \u2714 '
          ),
          ' Uploaded ',
          path,
          ' '
        );
      } else {
        return h(UploadingEachFile, {
          path: path,
          options: this.props.options,
          handleSingleUploadDone: this.handleSingleUploadDone
        });
      }
    });
    return h(
      'div',
      null,
      uploadComponentList
    );
  }
}

function standardizeLocale(filename) {
  const str = filename.split('.');
  let localeStr = str[0].split('-');
  if (localeStr.length > 1) {
    return localeStr[0] + '_' + localeStr[1];
  } else {
    return localeStr[0];
  }
}
function generateAssetKey({ typename, path, programId }) {
  const map = {
    ProgramEmailConfig: 'e',
    ProgramWidgetConfig: 'w',
    ProgramLinkConfig: 'l'
  };
  const filename = getNameFromPath(path);
  const key = getKeyFromPath(path);
  const locale = standardizeLocale(filename);
  if (typename === 'TenantTheme') {
    return 'TenantTheme' + '/' + locale;
  } else {
    return 'p/' + programId + '/' + map[typename] + '/' + key + '/' + locale;
  }
}

class UploadingEachFile extends Component {
  constructor(props) {
    super(props);
  }

  uploadFile(path) {
    fs.open(path, 'r', (err, fd) => {
      if (err) {
        return console.error(err);
        process.exit();
      }
      fs.readFile(path, 'utf8', async (err, data) => {
        if (err) {
          return console.error(err);
          process.exit();
        }

        let {
          domainname,
          tenant,
          auth,
          programId,
          typename
        } = this.props.options;
        const transId = generateAssetKey({
          typename: typename,
          path: this.props.path,
          programId: programId
        });
        const translationInstanceInput = {
          id: transId,
          content: JSON.parse(data)
        };
        try {
          await Query({
            domain: domainname,
            tenant: tenant,
            authToken: auth
          }).uploadAssets(translationInstanceInput);
          this.props.handleSingleUploadDone(this.props.path);
        } catch (e) {
          console.error(e);
          process.exit();
        }
      });
    });
  }

  componentDidMount() {
    this.uploadFile(this.props.path);
  }

  render() {
    return h(
      'div',
      null,
      '  ',
      h(Spinner, { green: true }),
      '  ',
      ' Uploading ',
      this.props.path,
      ' '
    );
  }
}

module.exports = program => {
  let upload = program.command('upload');

  upload.description('upload translations').option('-d,--domainname <domainname>', 'required - domain') //naming collision with domain, use domainname instead
  .option('-k,--apiKey  <apiKey>', 'required - authToken').option('-t,--tenant <tenant>', 'required - which tenant').option('-f,--filepath <filepath>', 'required - the file path').option('-p, --typename <typename>', 'required - valid typenames: TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig').option('-i, --programId [programId]', 'optional - Program Id is required for ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig').action(options => {
    if (!options.domainname || !options.apiKey || !options.tenant || !options.filepath || !options.typename) {
      console.log('Missing parameter');
      return;
    }

    if (!currentValidTypes.includes(options.typename)) {
      console.log('Invalid typename, must be one of TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig.');
      process.exit();
    }
    if (options.typename !== 'TenantTheme' && !options.programId) {
      console.log('Program Id required for ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig.');
      return;
    }
    const newOptions = _extends({
      auth: base64.encode(':' + options.apiKey)
    }, options);
    render(h(UploadAssets, { options: newOptions }));
  });

  return upload;
};