import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";
import fetch from "node-fetch";
import fragmentMatcher from "./fragmentMatcher";

const Query = ({ domain, tenant, authToken }) => {
  return {
    getClient() {
      const uri = domain + "/api/v1/" + tenant + "/graphql";
      //console.log(uri);
      const headers = {
        Authorization: "Basic " + authToken //base64
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
        query: gql`
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
                    messsageLinkOpenGraph {
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
        query: gql`
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
                      messageLinkOpenGraph {
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
        mutation: gql`
          mutation($jobInput: JobInput!) {
            createJob(jobInput: $jobInput) {
              id
            }
          }
          `,
          variables: {
            jobInput
          }
      })
    },

    getExportJob(jobId) {
      return this.getClient().query({
        query: gql`
          query($jobId: ID!) {
            job(id:$jobId){
              downloadUrl
            }
          }
        `,
        variables: {
          jobId
        }
      })
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

export default Query;
