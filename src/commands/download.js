// @ts-check

import { h, render, Component, Color } from 'ink';
import Spinner from 'ink-spinner';
import base64 from 'base-64';
import {readFile, fileExist} from './fileIO';
import {takeLoginInfo} from './login';
import { List, ListItem } from './components/checkbox-list';
import { getTranslatableAssets, writingEachAsset } from './i18n';

class DownloadAssets extends Component {
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
      const assetList = await getTranslatableAssets(this.props.options);

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
      return (
        <Downloading
          dir={this.props.options.filepath}
          selectedAssetList={this.state.selectedAssetList}
          handleAllDone={this.handleAllDone}
        />
      );
    } else if (this.state.assetList) {
      return (
        <ListFile
          assetList={this.state.assetList}
          onListSubmitted={this.handleListSubmission}
        />
      );
    } else {
      return (
        <div>
          <Spinner green /> Generating list of translatable assets
        </div>
      );
    }
  }
}

const ListFile = props => (
  <div>
    <br />
    Use arrow keys to move between options. Use space to select and enter to
    submit.<br />
    <List onSubmit={list => props.onListSubmitted(list)}>
      {props.assetList.map(l => <ListItem value={l}>{l.name}</ListItem>)}
    </List>
  </div>
);

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
      status[name] = true;
      const allFileChecked = Object.keys(status).reduce(
        (acc, cur) => acc && status[cur]
      );
      return {
        eachFileDone: status,
        allDone: allFileChecked
      };
    });
  }

  componentWillMount() {
    // set the list of download status track for each file
    const status = this.props.selectedAssetList.reduce(
      (prev, item) => ({
        ...prev,
        [item.name]: false
      }),
      {}
    );
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
        return <FinishCheckmark name={assetItem.name} />;
      } else {
        return (
          <DownloadEachAsset
            dir={this.props.dir}
            assetData={assetItem}
            handleDownloadDone={this.handleDownloadDone}
          />
        );
      }
    });
    return <span>{downloadList}</span>;
  }
}

class DownloadEachAsset extends Component {
  constructor(props) {
    super(props);

    this.state = {
      done: false
    };
  }

  async download() {
    try {
      await writingEachAsset(this.props);
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
    return (
      <div>
        {' '}
        <Spinner green /> Downloading {this.props.assetData.name}...{' '}
      </div>
    );
  }
}

const FinishCheckmark = ({ name }) => (
  <div>
    {' '}
    {name} <Color green>✔ source downloaded </Color>
  </div>
);

export default program => {
  let download = program.command('downloadTranslations');

  download
    .description('download an translation')
    // .option('-k,--apiKey <apiKey>', 'required - authToken') //the apiKey
    // .option('-t,--tenant <tenant>', 'required - which tenant')
    .option(
      '-f,--filepath [filepath]',
      'optional - the file path. Defaults to the current working directory.'
    )
    // .option(
    //   '-d,--_domain [_domain]',
    //   'optional - domain. May be useful if you are using a proxy.') //naming collision with domain, use _domain instead
    .action( async options => {
      // if (!options.apiKey || !options.tenant) {
      //   console.log('Missing parameter');
      //   return;
      // }
      if(!fileExist('./login.json')){
        await takeLoginInfo();
      }
      try {
        const loginInfoBuf = await readFile('./login.json');
        const loginInfo = JSON.parse(loginInfoBuf.toString());
        const newOptions = {
          auth: base64.encode(':' + loginInfo.apiKey),
          ...options,
          domain: loginInfo.domain,
          filepath: options.filepath || process.cwd()
        };
        render(<DownloadAssets options={newOptions} />);
      } catch (e) {
        console.error(e);
      }
      
    });

  return download;
};
