saasquatch-cli
==============

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6df4a79bc613438c800260ef90666cdd)](https://www.codacy.com/app/torbensky/saasquatch-cli?utm_source=github.com&utm_medium=referral&utm_content=saasquatch/saasquatch-cli&utm_campaign=badger)
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

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
