// @ts-check

import { h, render, Component, Color } from 'ink';
import Spinner from 'ink-spinner';
import base64 from 'base-64';
import { getValidFilelist, uploadFile } from '../utils/i18n';
import { login } from '../utils/login';
import { takeUploadInfo } from '../utils/uploadInfo';


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
    // .option(
    //   '-p, --typename <typename>',
    //   'required - valid typenames: TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig'
    // )
    // .option(
    //   '-i, --programId [programId]',
    //   'optional - Program Id is required for ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig'
    // )
    .option(
      '-f,--filepath [filepath]',
      'optional - the file path. Defaults to the current working directory.'
    )
    // .option(
    //   '-d,--_domain [_domain]',
    //   'optional - domain. May be useful if you are using a proxy.'
    // ) //naming collision with domain, use _domain instead
    .action ( async options => {
      // if (
      //   !options.apiKey ||
      //   !options.tenant ||
      //   !options.filepath ||
      //   !options.typename
      // ) {
      //   console.log('Missing parameter');
      //   return;
      // }
      try {
        const uploadInfo = await takeUploadInfo();

        if (uploadInfo.typename !== 'TenantTheme' && !uploadInfo.programId) {
          console.log(
            'Program Id required for email, widget, messaging.'
          );
          return;
        }
        const newOptions = {
          auth: base64.encode(':' + process.env.APIKEY),
          ...options,
          domain: process.env.DOMAIN,
          filepath: uploadInfo.filePath || process.cwd()
        };
        render(<UploadAssets options={newOptions} />);
      } catch (e) {
        console.error(e);
      }
      
     
    });

  return upload;
};
