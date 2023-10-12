const express = require('express');
const index = express.Router();
const path = require('path');
const axios = require('axios');
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REDIRECT_URL, REDDIT_USER_AGENT } = process.env;

const db = require('../db/redditDB');

index.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'))
  const redditId = req.session.redditId;
});

index.get('/generate-auth-url', async (req, res) => {
  const authUrl = await generateAuthUrl();
  async function generateAuthUrl() {
    const authUrl = snoowrap.getAuthUrl({
      scope: ['identity', 'submit', 'vote'],
      clientId: REDDIT_CLIENT_ID,
      state: 'fe211bebc52eb3da9bef8db6e63104d3',
      redirectUri: REDDIT_REDIRECT_URL,
      permanent: true
    });
    return authUrl;
  }
  res.json({ authUrl });
});

index.post('/generate-auth-url', async (req, res) => {
  try {
    const username = req.body.username;
    req.session.username = req.body.username;
    const password = req.body.password;
    req.session.password = req.body.password;

    const selectQuery = 'SELECT id FROM redtab WHERE username = $1 AND password = $2';
    const existingUser = await db.oneOrNone(selectQuery, [username, password]);

    if (existingUser && existingUser.username == username && existingUser.password == password && existingUser.username !== null && existingUser.password !== null) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error Occured:', error);
    res.status(500).json({ success: false, error: 'Error occured while saving username' });
  }
});

index.get('/signup', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'signup.html'));
});

index.post('/signup-completion', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const selectQuery = 'SELECT id FROM redtab WHERE username = $1 AND password = $2';
    const existingUser = await db.oneOrNone(selectQuery, [username, password]);

    if (existingUser && existingUser.username == username && existingUser.password == password) {
      console.log(existingUser.username, existingUser.password, 'already exists');
      res.json({ success: false });
    } else {
      const insertQuery = 'INSERT INTO redtab (username, password) VALUES ($1,$2) RETURNING id';
      const result = await db.one(insertQuery, [username, password]);
      if (result) {
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.error('Error Occured:', error);
    res.status(500).json({ success: false, error: 'Error occured while saving username' });
  }
});

index.get('/checkSubredditExistence/:subredditName', async (req, res) => {
  const subredditName = req.params.subredditName;
  const redditId = req.session.redditId;
  async function getAccessTokenByRedditId(redditId) {
    try {
      const status = 'ACTIVE';
      const query = 'SELECT access_token FROM redtab WHERE reddit_id = $1 AND status= $2';
      const result = await db.oneOrNone(query, [redditId, status]);
      return result ? result.access_token : null; // If there is a result, return the access token. Otherwise, return null.
    } catch (error) {
      throw error;
    }
  }
  const accessToken = await getAccessTokenByRedditId(redditId);

  const redditClient = new snoowrap({
    userAgent: REDDIT_USER_AGENT,
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    accessToken: accessToken
  });

  async function checkSubredditExistence(subredditName) {
    try {
      const subredditInfo = await redditClient.getSubreddit(subredditName).created_utc.then(console.log);//.created_utc.then(console.log) part of this line is not neccessary. 
      return true;
    } catch (error) {
      console.error('API Error', error);
      return false;
    }
  }
  const subredditExists = await checkSubredditExistence(subredditName);
  res.json({ subredditExists });
  console.log(subredditExists);
});

index.get('/refresh-token', async function (req, res) {
  async function getRefreshTokens() {
    try {
      const query = "SELECT refresh_token, reddit_id, reddit_name, access_token, username, password FROM redtab WHERE status = 'ACTIVE'";
      const results = await db.manyOrNone(query);
      if (!results || results.length === 0) {
        return { refreshArray: [], idArray: [], redditNameArray: [], accessTokenArray: [], usernameArray: [], passwordArray:[]};
      }
      const refreshArray = results.map(row => row.refresh_token);
      const idArray = results.map(row => row.reddit_id);
      const redditNameArray = results.map(row => row.reddit_name);
      const accessTokenArray = results.map(row => row.access_token);
      const usernameArray=results.map(row=>row.username);
      const passwordArray = results.map(row=>row.password);

      return { refreshArray, idArray, redditNameArray, accessTokenArray, usernameArray, passwordArray };
    } catch (error) {
      throw error;
    }
  }
  async function processRefreshTokens() {
    const { refreshArray, idArray, redditNameArray, accessTokenArray, usernameArray, passwordArray } = await getRefreshTokens();
    const status = 'ACTIVE';
  
    const refreshTokenPromises = refreshArray.map(async (refreshToken, index) => {
      const redditId = idArray[index];
      const redditName = redditNameArray[index];
      const accessToken = accessTokenArray[index];
      const username = usernameArray[index];
      const password = passwordArray[index];
  
      try {
        const response = await axios.post('https://www.reddit.com/api/v1/access_token', null, {
          params: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          },
          auth:{
            username: REDDIT_CLIENT_ID,
            password: REDDIT_CLIENT_SECRET
          }
        });
        const newAccessToken = response.data.access_token;
  
        if (newAccessToken) {
          const updateQuery = "UPDATE redtab SET status='EXPIRED' WHERE access_token=$1 AND status='ACTIVE';"; // Update status of the old record
          const insertQuery = "INSERT INTO redtab(reddit_id, reddit_name, access_token, refresh_token, status, username, password ) VALUES ($1, $2, $3, $4, $5, $6, $7);";//insert into new record by changing only access token
          await db.none(updateQuery, [accessToken]);
          await db.none(insertQuery, [redditId, redditName, newAccessToken, refreshToken, status, username, password]);
        }
      } catch (error) {
        console.error('Access token refreshing error:', error);
      }
    });
  
    // Tüm refresh token'larını işleyin ve bekleyin
    await Promise.all(refreshTokenPromises);
  }
  setTimeInterval(processRefreshTokens, 60*60*1000);
});


index.get('/error', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'error.html'));
});

index.get('/userpanel', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'userpanel.html'));
});

index.get('/reddit-posts', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'redditposts.html'));
});

module.exports = index;