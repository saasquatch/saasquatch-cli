saasquatch-cli
==============

[![npm version](https://badge.fury.io/js/saasquatch-cli.svg)](http://badge.fury.io/js/saasquatch-cli)
[![Build Status](https://travis-ci.org/saasquatch/saasquatch-cli.svg?branch=master)](https://travis-ci.org/saasquatch/saasquatch-cli)

A command line interface to the Referral SaaSquatch API.


## Installing

Install via npm (requires node.js).

```bash
$ npm install -g saasquatch-cli
```


## Usage

The tool can be accessed with the `squatch` command on the command line:

```bash
$ squatch --help
```

### squatch publish

Publish a custom theme. Uses the HEAD of the configured repository.

```bash
$ squatch publish -t test_alu125hh1si9w -k TEST_BHASKh5125Las5hL125oh3VbLmPxUSs
```

**Options**

```
-t, --tenant [tenant]  required - which tenant to use
-k, --apiKey [apiKey]  required - which API key to use (for corresponding tenant)
```

### squatch upload

Upload translations for TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig.

```bash
$ squatch upload -d https://staging.referralsaasquatch.com -t test_alu125hh1si9w -k TEST_BHASKh5125Las5hL125oh3VbLmPxUSs -f ./assets -i 5b3e91cbe4b04b486fc9e474 -p ProgramWidgetConfig
```

**Options**
```
-d, --domainname [domainname] required - server domain
-t, --tenant [tenant]  required - which tenant to use
-k, --apiKey [apiKey]  required - which API key to use (for corresponding tenant)
-f, --filepath [filepath] required - path of files to be uploaded
-p, --typename [typename] required - type of assets to be uploaded, one of TenantTheme, ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig
-i, --programId [programId] optional - program id is required for ProgramEmailConfig, ProgramLinkConfig, ProgramWidgetConfig
```

Translation files must be json files named with locale codes according to ISO, for example, de_DE.json, fr_FR.json.
Translation files must be put in folders with structure as below:

```
    /[root assets folder]
        - /Program
            - /[Typename]
                - /[Key]
                    - [translation json file]
        - /TenantTheme
            - [translation json file]
```

#### Example
```
/assets
    - /Basic Referral Program
        - /ProgramEmailConfig
            - /referralStarted
                - de_DE.json
                - fr_FR.json
            - /rewardLimitReached
                - ja_JP.json
            - /referredRewardReceived
                - zh_CN.json
        - /ProgramLinkConfig
            - /default
        - /ProgramWidgetConfig
            - /referrerWidget
                - de_DE.json
                - fr_FR.json
            - /referredWidget
                - fr_FR.json
    - /TenantTheme
        - de_DE.json
        - fr_FR.json
```

### squatch download
Download translations 

```bash
$ squatch upload -d https://staging.referralsaasquatch.com -t test_alu125hh1si9w -k TEST_BHASKh5125Las5hL125oh3VbLmPxUSs -f ./assets
```

**Options**

```
-d, --domainname [domainname] required - server domain
-t, --tenant [tenant]  required - which tenant to use
-k, --apiKey [apiKey]  required - which API key to use (for corresponding tenant)
-f, --filepath [filepath] required - path where downloaded files to be saved
```

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
