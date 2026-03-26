/**
 * Deep link configuration for React Navigation.
 *
 * Maps `construction://callback` to the Dashboard screen
 * inside the Main (BottomTabs) navigator. This prepares
 * the app for future Cognito OAuth redirect handling.
 *
 * Requisitos: 4.8
 */

import type { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
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
