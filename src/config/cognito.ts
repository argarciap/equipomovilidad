export const cognitoConfig = {
  issuer: 'https://cognito-idp.eu-west-1.amazonaws.com/<USER_POOL_ID>',
  clientId: '<APP_CLIENT_ID>',
  redirectUrl: 'construction://callback',
  scopes: ['openid', 'profile', 'email'],
  additionalParameters: {
    identity_provider: 'OneLogin',
  },
};
