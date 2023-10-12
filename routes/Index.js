const express = require('express');
const index = express.Router();
const path = require('path');
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID,REDDIT_CLIENT_SECRET, REDDIT_REDIRECT_URL, REDDIT_USER_AGENT } = process.env;

const db = require('../db/redditDB');

index.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'))
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

  async function getAccessTokenByRedditId(redditId) {
    try {
      const query = 'SELECT access_token FROM redtab WHERE reddit_id = $1';
      const result = await db.oneOrNone(query, [redditId]);
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