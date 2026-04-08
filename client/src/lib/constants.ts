export const MSAL_SCOPES = {
  API: [`api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`],
  LOGIN: ['User.Read', 'openid', 'profile'],
}
