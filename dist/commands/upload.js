'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // @ts-check

var _ink = require('ink');

var _inkSpinner = require('ink-spinner');

var _inkSpinner2 = _interopRequireDefault(_inkSpinner);

var _base = require('base-64');

var _base2 = _interopRequireDefault(_base);

var _i18n = require('../utils/i18n');

var _prompt = require('../utils/prompt');

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Allows for interactive keyboard stuff with Ink
_readline2.default.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const currentValidTypes = ['TenantTheme', 'ProgramEmailConfig', 'ProgramWidgetConfig', 'ProgramLinkConfig'];

class UploadAssets extends _ink.Component {
  constructor(props) {
    super(props);

    this.state = {
      validFilelist: [],
      loading: 'initial',
      allDone: false
    };
    this.handleUploadAllDone = this.handleUploadAllDone.bind(this);
  }

  handleUploadAllDone() {
    this.setState({
      allDone: true
    });
  }

  async componentDidMount() {
    //get valid files for this tenant
    this.setState({ loading: 'true' });
    const validFiles = await (0, _i18n.getValidFilelist)(this.props.options);
    if (validFiles.length === 0) {
      console.log('\nNo valid translation file found.');
      process.exit();
    }
    this.setState({
      loading: 'false',
      validFilelist: validFiles
    });
  }

  componentWillUpdate() {
    if (this.state.allDone) {
      process.exit();
    }
  }

  render() {
    if (this.state.loading === 'false') {
      return (0, _ink.h)(UploadingFiles, {
        handleUploadAllDone: this.handleUploadAllDone,
        filelist: this.state.validFilelist,
        options: this.props.options
      });
    } else if (this.state.loading === 'true') {
      //in the process of reading file
      return (0, _ink.h)(
        'div',
        null,
        ' ',
        (0, _ink.h)(_inkSpinner2.default, { green: true }),
        ' Searching for valid translation files...',
        ' '
      );
    }
  }
}

class UploadingFiles extends _ink.Component {
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
      const allFileChecked = Object.keys(status).reduce((acc, cur) => acc && status[cur]);
      return {
        eachFileDone: status,
        allDone: allFileChecked
      };
    });
  }

  render() {
    const uploadComponentList = this.props.filelist.map(path => {
      if (this.state.eachFileDone[path]) {
        return (0, _ink.h)(
          'div',
          null,
          ' ',
          (0, _ink.h)(
            _ink.Color,
            { green: true },
            ' \u2714 '
          ),
          ' Uploaded ',
          path,
          ' '
        );
      } else {
        return (0, _ink.h)(UploadingEachFile, {
          path: path,
          options: this.props.options,
          handleSingleUploadDone: this.handleSingleUploadDone
        });
      }
    });
    return (0, _ink.h)(
      'div',
      null,
      uploadComponentList
    );
  }
}

class UploadingEachFile extends _ink.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { path, options } = this.props;
    let uploadDone = false;
    uploadDone = await (0, _i18n.uploadFile)({ path, options });
    if (uploadDone) {
      this.props.handleSingleUploadDone(path);
    }
  }
  render() {
    return (0, _ink.h)(
      'div',
      null,
      '  ',
      (0, _ink.h)(_inkSpinner2.default, { green: true }),
      '  ',
      ' Uploading ',
      this.props.path,
      ' '
    );
  }
}

exports.default = program => {
  let upload = program.command('uploadTranslations');

  upload.description('upload translations').action(async options => {
    _dotenv2.default.config();
    try {
      const uploadInfo = await (0, _prompt.takeUploadInfo)();
      console.log(uploadInfo.typename);
      if (uploadInfo.typename !== 'TenantTheme' && !process.env.SAASQUATCH_PROGRAM_ID) {
        console.log('Program Id required for email, widget, messaging.');
        return;
      }
      const newOptions = _extends({
        auth: _base2.default.encode(':' + process.env.APIKEY)
      }, options, {
        domain: process.env.HOST,
        filepath: uploadInfo.filePath,
        typename: uploadInfo.typename
      });
      (0, _ink.render)((0, _ink.h)(UploadAssets, { options: newOptions }));
    } catch (e) {
      console.error(e);
    }
  });

  return upload;
};