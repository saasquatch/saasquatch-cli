// @ts-check

import { h, render, Component, Color } from "ink";
import Spinner from "ink-spinner";
import base64 from "base-64";

import { List, ListItem } from "./components/checkbox-list";
import {findTranslatableAssets, downloadSingleAsset} from "./i18n";


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
    try {
      const {
        tenantThemeData,
        programMap,
        programData,
        listItem
      } = await findTranslatableAssets(this.props.options);

      if (listItem.length === 0) {
        console.log("\nNo available translatable asset found.");
        process.exit(1);
        return;
      }

      this.setState({
        tenantThemeData,
        programMap,
        programList: programData.data.programs,
        itemList: listItem
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
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
        selectedItem: list,
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
          selectedItem={this.state.selectedItem}
          programList={this.state.programList}
          programMap={this.state.programMap}
          tenantThemeData={this.state.tenantThemeData}
          handleAllDone={this.handleAllDone}
          options={this.props.options}
        />
      );
    } else if (this.state.itemList) {
      return (
        <ListFile
          itemList={this.state.itemList}
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
      {props.itemList.map(l => <ListItem value={l}>{l.name}</ListItem>)}
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
    const status = this.props.selectedItem.reduce(
      (prev, item) => ({
        ...prev,
        [item]: false
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
    try{
      await downloadSingleAsset(this.props);
    }catch(e){
      // Hard bail out if any asset fails
      console.error(e);
      process.exit(1);
    }
    this.props.handleDownloadDone(name);
  }

  componentDidMount() {
    this.download();
  }

  render() {
    return (
      <div>
        {" "}
        <Spinner green /> Downloading {this.props.name}...{" "}
      </div>
    );
  }
}

const FinishCheckmark = ({ name }) => (
  <div>
    {" "}
    {name} <Color green>✔ source downloaded </Color>
  </div>
);

export default program => {
  let download = program.command("download");

  download
    .description("download an translation")
    .option("-k,--apiKey <apiKey>", "required - authToken") //the apiKey, use authToken to avoid naming collision
    .option("-t,--tenant <tenant>", "required - which tenant")
    .option(
      "-f,--filepath [filepath]",
      "optional - the file path. Defaults to the current working directory."
    )
    .option(
      "-d,--domainname [domainname]",
      "optional - domain. May be useful if you're using a proxy."
    ) //naming collision with domain, use domain name instead
    .action(options => {
      if (
        !options.apiKey ||
        !options.tenant
      ) {
        console.log("Missing parameter");
        return;
      }
      const newOptions = {
        auth: base64.encode(":" + options.apiKey),
        ...options,
        domainname: options.domainname || "https://app.referralsaasquatch.com",
        filepath: options.filepath || process.cwd()
      };
      render(<DownloadAssets options={newOptions} />);
    });

  return download;
};
