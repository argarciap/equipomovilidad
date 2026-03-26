/**
 * Cognito configuration — placeholder values.
 *
 * Team 2 will replace these with real Cognito User Pool settings
 * once the auth infrastructure is ready. The redirect URL uses the
 * deep-link scheme already configured in linking.ts.
 */
export const cognitoConfig = {
  /** Replace <USER_POOL_ID> with the actual Cognito User Pool ID */
  issuer: 'https://cognito-idp.eu-west-1.amazonaws.com/<USER_POOL_ID>',

  /** Replace <APP_CLIENT_ID> with the actual Cognito App Client ID */
  clientId: '<APP_CLIENT_ID>',

  /** Deep-link callback — matches linking.ts prefix */
  redirectUrl: 'construction://callback',

  scopes: ['openid', 'profile', 'email'],

  additionalParameters: {
    identity_provider: 'OneLogin',
  },
};
