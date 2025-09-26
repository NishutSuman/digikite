const { OAuth2Client } = require('google-auth-library');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    });
  }

  async verifyGoogleToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      // Extract user information
      const userInfo = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
        locale: payload.locale
      };

      logger.info('Google token verified successfully', {
        userId: payload.sub,
        email: payload.email
      });

      return userInfo;
    } catch (error) {
      logger.error('Google token verification failed', {
        error: error.message,
        token: token ? 'present' : 'missing'
      });

      throw new Error('Invalid Google token');
    }
  }

  async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await this.client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error('Google token exchange failed', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  async getGoogleUserInfo(accessToken) {
    try {
      const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await userInfoResponse.json();
      return userInfo;
    } catch (error) {
      logger.error('Failed to get Google user info', error);
      throw new Error('Failed to retrieve user information');
    }
  }

  generateGoogleAuthUrl(redirectUri) {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];

      const url = this.client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        redirect_uri: redirectUri,
        prompt: 'select_account'
      });

      return url;
    } catch (error) {
      logger.error('Failed to generate Google auth URL', error);
      throw new Error('Failed to generate authentication URL');
    }
  }
}

module.exports = new GoogleAuthService();