"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apolloClient = require("apollo-client");

var _apolloLinkHttp = require("apollo-link-http");

var _apolloCacheInmemory = require("apollo-cache-inmemory");

var _graphqlTag = require("graphql-tag");

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

var _nodeFetch = require("node-fetch");

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _fragmentMatcher = require("./fragmentMatcher");

var _fragmentMatcher2 = _interopRequireDefault(_fragmentMatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Query = ({ domain, tenant, authToken }) => {
  return {
    getClient() {
      const uri = domain + "/api/v1/" + tenant + "/graphql";
      console.log(uri);
      const headers = {
        Authorization: "Basic " + authToken //base64
      };
      const client = new _apolloClient.ApolloClient({
        link: new _apolloLinkHttp.HttpLink({ uri, headers, fetch: _nodeFetch2.default }),
        cache: new _apolloCacheInmemory.InMemoryCache({ fragmentMatcher: _fragmentMatcher2.default })
      });
      return client;
    },

    uploadAssets(translationInstanceInput) {
      return this.getClient().mutate({
        mutation: _graphqlTag2.default`
          mutation($translationInstanceInput: TranslationInstanceInput!) {
            upsertTranslationInstance(
              translationInstanceInput: $translationInstanceInput
            ) {
              id
            }
          }
        `,
        variables: {
          translationInstanceInput
        }
      });
    },

    getSingleProgramData(programId) {
      return this.getClient().query({
        query: _graphqlTag2.default`
          query($programId: ID!) {
            program(id: $programId) {
              name
              translatableAssets {
                translationInfo {
                  locales
                  translations {
                    locale
                    content
                  }
                }
                __typename
                ... on ProgramEmailConfig {
                  key
                  values
                }
                ... on ProgramWidgetConfig {
                  key
                  values
                }
                ... on ProgramLinkConfig {
                  messaging {
                    messages {
                      shareMedium
                      config
                    }
                    messengerLinkOpenGraph {
                      title
                      description
                      image
                      source
                    }
                    shareLinkOpenGraph {
                      title
                      description
                      image
                      source
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          programId
        }
      });
    },

    listProgramAssetData() {
      return this.getClient().query({
        query: _graphqlTag2.default`
          query {
            programs {
              data {
                id
                name
                translatableAssets {
                  translationInfo {
                    translatableAssetKey
                    translations {
                      id
                      locale
                      translatableAssetKey
                      content
                    }
                    locales
                  }
                  __typename
                  ... on ProgramEmailConfig {
                    key
                    values
                  }
                  ... on ProgramWidgetConfig {
                    key
                    values
                  }
                  ... on ProgramLinkConfig {
                    messaging {
                      messages {
                        shareMedium
                        config
                      }
                      messengerLinkOpenGraph {
                        title
                        description
                        image
                        source
                      }
                      shareLinkOpenGraph {
                        title
                        description
                        image
                        source
                      }
                    }
                  }
                }
              }
            }
          }
        `
      });
    },

    createExportJob(jobInput) {
      return this.getClient().query({
        mutation: _graphqlTag2.default`
          mutation($jobInput: JobInput!) {
            createJob(jobInput: $jobInput) {
              id
            }
          }
          `,
        variables: {
          jobInput
        }
      });
    },

    getExportJob(jobId) {
      return this.getClient().query({
        query: _graphqlTag2.default`
          query($jobId: ID!) {
            job(id:$jobId){
              downloadUrl
            }
          }
        `,
        variables: {
          jobId
        }
      });
    },

    getAssets() {
      return this.getClient().query({
        query: _graphqlTag2.default`
          query {
            translatableAssets {
              __typename
              translationInfo {
                id
                translatableAssetKey
                translations {
                  id
                  locale
                  content
                }
              }
              ... on TenantTheme {
                id
                variables
              }
              ... on ProgramEmailConfig {
                key
                values
              }
              ... on ProgramLinkConfig {
                messaging {
                  messages {
                    shareMedium
                  }
                }
              }
              ... on ProgramWidgetConfig {
                key
                values
              }
            }
          }
        `
      });
    }
  };
};

exports.default = Query;