// @ts-check

import { h, render, Component, Color } from 'ink';
import Spinner from 'ink-spinner';
import base64 from 'base-64';
import { getValidFilelist, uploadFile } from './i18n';

const currentValidTypes = [
  'TenantTheme',
  'ProgramEmailConfig',
  'ProgramWidgetConfig',
  'ProgramLinkConfig'
];

class UploadAssets extends Component {
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
    const validFiles = await getValidFilelist(this.props.options);
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
      return (
        <UploadingFiles
          handleUploadAllDone={this.handleUploadAllDone}
          filelist={this.state.validFilelist}
          options={this.props.options}
        />
      );
    } else if (this.state.loading === 'true') {
      //in the process of reading file
      return (
        <div>
          {' '}
          <Spinner green /> Searching for valid translation files...{' '}
        </div>
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
      const allFileChecked = Object.keys(status).reduce(
        (acc, cur) => acc && status[cur]
      );
      return {
        eachFileDone: status,
        allDone: allFileChecked
      };
    });
  }

  render() {
    const uploadComponentList = this.props.filelist.map(path => {
      if (this.state.eachFileDone[path]) {
        return (
          <div>
            {' '}
            <Color green> ✔ </Color> Uploaded {path}{' '}
          </div>
        );
      } else {
        return (
          <UploadingEachFile
            path={path}
            options={this.props.options}
            handleSingleUploadDone={this.handleSingleUploadDone}
          />
        );
      }
    });
    return <div>{uploadComponentList}</div>;
  }
}

class UploadingEachFile extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { path, options } = this.props;
    let uploadDone = false;
    uploadDone = await uploadFile({ path, options });
    if (uploadDone) {
      this.props.handleSingleUploadDone(path);
    }
  }
  render() {
    return (
      <div>
        {'  '}
        <Spinner green />
        {'  '} Uploading {this.props.path}{' '}
      </div>
    );
  }
}

export default program => {
  let upload = program.command('uploadTranslations');

  upload
    .description('upload translations')
    .option('-k,--apiKey  <apiKey>', 'required - authToken')
    .option('-t,--tenant <tenant>', 'required - which tenant')
    .option(
      '-p, --typename <typename>',
      'required - valid typenames: TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig'
    )
    .option(
      '-i, --programId [programId]',
      'optional - Program Id is required for ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig'
    )
    .option(
      '-f,--filepath [filepath]',
      'optional - the file path. Defaults to the current working directory.'
    )
    .option(
      '-d,--_domain [_domain]',
      'optional - domain. May be useful if you are using a proxy.'
    ) //naming collision with domain, use _domain instead
    .action(options => {
      if (
        !options.apiKey ||
        !options.tenant ||
        !options.filepath ||
        !options.typename
      ) {
        console.log('Missing parameter');
        return;
      }

      if (!currentValidTypes.includes(options.typename)) {
        console.log(
          'Invalid typename, must be one of TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig.'
        );
        process.exit();
      }
      if (options.typename !== 'TenantTheme' && !options.programId) {
        console.log(
          'Program Id required for ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig.'
        );
        return;
      }
      const newOptions = {
        auth: base64.encode(':' + options.apiKey),
        ...options,
        domain: options._domain || 'https://app.referralsaasquatch.com',
        filepath: options.filepath || process.cwd()
      };
      render(<UploadAssets options={newOptions} />);
    });

  return upload;
};
