import auth0 from 'auth0-js';
import { Environments as Env } from '@/Environments/Environments';

let auth0ClientInstance: auth0.WebAuth | null = null;

export interface Auth0TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

const getAuth0Client = (): auth0.WebAuth => {
  if (!Env.auth0.domain || !Env.auth0.clientId) {
    throw new Error('Auth0 domain and clientId are required. Please check your .env file.');
  }

  if (!auth0ClientInstance) {
    auth0ClientInstance = new auth0.WebAuth({
      domain: Env.auth0.domain,
      clientID: Env.auth0.clientId,
      redirectUri: window.location.origin + '/auth/login/callback',
      responseType: 'token id_token',
      scope: 'openid profile email offline_access',
    });
  }

  return auth0ClientInstance;
};

export const auth0Login = async (email: string, password: string): Promise<Auth0TokenResponse> => {
  if (!Env.auth0.domain || !Env.auth0.clientId) {
    throw new Error('Auth0 domain and clientId are required.');
  }

  const response = await fetch(`https://${Env.auth0.domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      client_id: Env.auth0.clientId,
      username: email,
      password: password,
      realm: 'Username-Password-Authentication',
      scope: 'openid profile email offline_access',
      audience: Env.auth0.audience || `https://${Env.auth0.domain}/api/v2/`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

export const refreshAccessToken = async (refreshToken: string): Promise<Auth0TokenResponse> => {
  if (!Env.auth0.domain || !Env.auth0.clientId) {
    throw new Error('Auth0 domain and clientId are required.');
  }

  const response = await fetch(`https://${Env.auth0.domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: Env.auth0.clientId,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

export const auth0Logout = () => {
  getAuth0Client().logout({
    returnTo: window.location.origin,
  });
};

export const parseHash = (): Promise<auth0.Auth0DecodedHash | null> => {
  return new Promise((resolve, reject) => {
    getAuth0Client().parseHash((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const getUserInfo = (accessToken: string): Promise<auth0.Auth0UserProfile> => {
  return new Promise((resolve, reject) => {
    getAuth0Client().client.userInfo(accessToken, (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(user);
    });
  });
};
