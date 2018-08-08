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

var _checkboxList = require('../components/checkbox-list');

var _i18n = require('../utils/i18n');

var _prompt = require('../utils/prompt');

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_readline2.default.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

class DownloadAssets extends _ink.Component {
  constructor(props) {
    super(props);

    this.state = {
      assetList: null,
      selectedAssetList: [],
      submitted: false,
      downloadDone: false
    };

    this.handleListSubmission = this.handleListSubmission.bind(this);
    this.handleAllDone = this.handleAllDone.bind(this);
  }

  async downloadData() {
    try {
      const assetList = await (0, _i18n.getTranslatableAssets)(this.props.options);

      if (assetList.length === 0) {
        console.log('\nNo available translatable asset found.');
        process.exit();
        return;
      }

      this.setState({
        assetList: assetList
      });
    } catch (e) {
      console.error(e);
      process.exit();
      return;
    }
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
    if (list.length > 0) {
      this.setState({
        selectedAssetList: list,
        submitted: true
      });
    } else {
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
      return (0, _ink.h)(Downloading, {
        dir: this.props.options.filepath,
        selectedAssetList: this.state.selectedAssetList,
        handleAllDone: this.handleAllDone
      });
    } else if (this.state.assetList) {
      return (0, _ink.h)(ListFile, {
        assetList: this.state.assetList,
        onListSubmitted: this.handleListSubmission
      });
    } else {
      return (0, _ink.h)(
        'div',
        null,
        (0, _ink.h)(_inkSpinner2.default, { green: true }),
        ' Generating list of translatable assets'
      );
    }
  }
}

const ListFile = props => (0, _ink.h)(
  'div',
  null,
  (0, _ink.h)('br', null),
  'Use arrow keys to move between options. Use space to select and enter to submit.',
  (0, _ink.h)('br', null),
  (0, _ink.h)(
    _checkboxList.List,
    { onSubmit: list => props.onListSubmitted(list) },
    props.assetList.map(l => (0, _ink.h)(
      _checkboxList.ListItem,
      { value: l },
      l.name
    ))
  )
);

class Downloading extends _ink.Component {
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
      status[name] = true;
      const allFileChecked = Object.keys(status).reduce((acc, cur) => acc && status[cur]);
      return {
        eachFileDone: status,
        allDone: allFileChecked
      };
    });
  }

  componentWillMount() {
    // set the list of download status track for each file
    const status = this.props.selectedAssetList.reduce((prev, item) => _extends({}, prev, {
      [item.name]: false
    }), {});
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
    const downloadList = this.props.selectedAssetList.map(assetItem => {
      if (this.state.eachFileDone[assetItem.name]) {
        return (0, _ink.h)(FinishCheckmark, { name: assetItem.name });
      } else {
        return (0, _ink.h)(DownloadEachAsset, {
          dir: this.props.dir,
          assetData: assetItem,
          handleDownloadDone: this.handleDownloadDone
        });
      }
    });
    return (0, _ink.h)(
      'span',
      null,
      downloadList
    );
  }
}

class DownloadEachAsset extends _ink.Component {
  constructor(props) {
    super(props);

    this.state = {
      done: false
    };
  }

  async download() {
    try {
      await (0, _i18n.writingEachAsset)(this.props);
    } catch (e) {
      // Hard bail out if any asset fails
      console.error(e);
      process.exit(0);
    }
    this.props.handleDownloadDone(this.props.assetData.name);
  }

  componentDidMount() {
    this.download();
  }

  render() {
    return (0, _ink.h)(
      'div',
      null,
      ' ',
      (0, _ink.h)(_inkSpinner2.default, { green: true }),
      ' Downloading ',
      this.props.assetData.name,
      '...',
      ' '
    );
  }
}

const FinishCheckmark = ({ name }) => (0, _ink.h)(
  'div',
  null,
  ' ',
  name,
  ' ',
  (0, _ink.h)(
    _ink.Color,
    { green: true },
    '\u2714 source downloaded '
  )
);

exports.default = program => {
  let download = program.command('downloadTranslations');

  download.description('download an translation').action(async options => {
    _dotenv2.default.config();
    const downloadInfo = await (0, _prompt.takeDownloadInfo)();
    const newOptions = _extends({
      auth: _base2.default.encode(':' + process.env.APIKEY)
    }, options, {
      tenant: process.env.TENANT,
      domain: process.env.HOST,
      filepath: downloadInfo.filePath
    });
    (0, _ink.render)((0, _ink.h)(DownloadAssets, { options: newOptions }));
  });

  return download;
};