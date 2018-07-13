const { ApolloClient } = require("apollo-client");
const { ApolloLink } = require("apollo-link");
const { HttpLink } = require("apollo-link-http");
const { InMemoryCache } = require("apollo-cache-inmemory");
const gql = require("graphql-tag");
const fetch = require('node-fetch');
const fragmentMatcher = require('./fragmentMatcher');

//read from cli
// const domain = "https://staging.referralsaasquatch.com";
// const tenantAlias = "test_a5fr50mxaeltn";

// const authToken = "TEST_KHDCw9Ll4JJxa0OL1zKCVMouIbtF1BMX"; // username:password encoded in base64

const Query = ({
  domain,
  tenant,
  authToken
}) => {
  return {
    getClient() {
      const uri = domain + "/api/v1/" + tenant + "/graphql";
      const headers = {
        Authorization: 'Basic ' + authToken //base64
      };
      const client = new ApolloClient({
        link: new HttpLink({ uri, headers, fetch }),
        cache: new InMemoryCache({ fragmentMatcher })
      });
      return client;
    },

    uploadAssets(translationInstanceInput) {
      return this.getClient().mutate({
        mutation: gql`
          mutation ($translationInstanceInput: TranslationInstanceInput!) {
            upsertTranslationInstance(translationInstanceInput:$translationInstanceInput) {
              id
            }
          }
         `, variables: {
          translationInstanceInput
        }
      });
    },

    listPrograms() {
      return this.getClient().query({
        query: gql`
          query {
            programs {
              data {
                name
                id
              }
            } 
          }
        `
      });
    },

    getProgramData(programId) {
      return this.getClient().query({
        query: gql`
          query($programId: ID!) {
            program(id: $programId){
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
                  messages{
                    shareMedium
                    config
                  }
                  messengerLinkOpenGraph{
                    title
                    description
                    image
                    source
                  }
                  shareLinkOpenGraph{
                    title
                    description
                    image
                    source
                  }
                }
              }
            }
          }
        }`, variables: {
          programId
        }
      });
    },

    getAssets() {
      return this.getClient().query({
        query: gql`
          query {
            translatableAssets {
              __typename
              translationInfo {
                id
                translatableAssetKey
                translations{
                  id
                  locale
                  content
                }
              }
              ...on TenantTheme {
                id
                variables
              }
              ...on ProgramEmailConfig {
                key
                values
              }
              ...on ProgramLinkConfig {
                messaging{
                  messages {
                    shareMedium
                  }
                }
              }
              ...on ProgramWidgetConfig {
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

module.exports = Query;