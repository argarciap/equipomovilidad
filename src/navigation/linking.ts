import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<Record<string, unknown>> = {
  prefixes: ['construction://'],
  config: {
    screens: {
      Main: {
        screens: {
          Dashboard: 'callback',
        },
      },
    },
  },
};
