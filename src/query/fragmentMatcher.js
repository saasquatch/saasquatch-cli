// file: `config/apollo/fragmentMatcher.js`
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

/* run the following and get INTERFACE / UNION types - TODO - it would be nice to generate these as a build step (getting correct environment?)
- see https://github.com/apollographql/apollo-client/blob/master/docs/source/recipes/fragment-matching.md
- and https://github.com/apollographql/apollo-client/issues/1555#issuecomment-295834774
__schema {
    types {
      kind
      name
      possibleTypes {
        name
      }
    }
  }
} */

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          kind: 'INTERFACE',
          name: 'TranslatableAsset',
          possibleTypes: [
            {
              name: 'ProgramEmailConfig'
            },
            {
              name: 'ProgramWidgetConfig'
            },
            {
              name: 'TenantTheme'
            }
          ]
        },
        {
          kind: 'INTERFACE',
          name: 'IsPredefinedReward',
          possibleTypes: [
            {
              name: 'ProgramRewardConfig'
            }
          ]
        },
        {
          kind: 'INTERFACE',
          name: 'ProgramTrigger',
          possibleTypes: [
            {
              name: 'AfterUserCreatedOrUpdatedTrigger'
            },
            {
              name: 'ScheduledProgramTrigger'
            }
          ]
        } // this is an example, put your INTERFACE and UNION kinds here!
      ]
    }
  }
});

export default fragmentMatcher;
