saasquatch-cli
==============

[![npm version](https://badge.fury.io/js/saasquatch-cli.svg)](http://badge.fury.io/js/saasquatch-cli)

A command line interface to the Referral SaaSquatch API.


## Installing

Install via npm (requires node.js).

```bash
npm install -g saasquatch-cli
```


## Usage

The tool can be accessed with the `squatch` command on the command line:

```bash
squatch --help
```

### `squatch publish`

Publish a custom theme. Uses the HEAD of the configured repository.

```bash
$ squatch publish -t test_alu125hh1si9w -k TEST_BHASKh5125Las5hL125oh3VbLmPxUSs
```

**Options**

-t, --tenant [tenant]  required - which tenant to use
-k, --apiKey [apiKey]  required - which API key to use (for corresponding tenant)

### `squatch serve`

:exclamation: **alpha**

Start local server, with Handlebars and LESS compilation and LiveReload.

```bash
$ squatch serve
[10:28:54] Server started http://0.0.0.0:8080
[10:28:54] LiveReload started on port 35729
```

#### Why is this alpha?

The serve command uses Handlebars.js, contrasting with the Handlebars.java library used in Referral SaaSquatch.

This means that the serve command will allow you to do things that Handlebars.js supports, but that are not supported in Handlebars.java.

Please see the [Handlebars.java documentation](https://github.com/jknack/handlebars.java) for an overview of the supported features.

For an example of a theme written to support Handlebars.java, please see our [Time Credit Theme](https://github.com/saasquatch/time-credit-theme).
