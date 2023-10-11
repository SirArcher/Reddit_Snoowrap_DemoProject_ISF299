const express = require('express');
const index = express.Router();
const path = require('path');
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_REDIRECT_URL } = process.env;

const db = require('../db/redditDB');

index.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'))
});

index.get('/generate-auth-url', async (req, res) => {
  const authUrl = await generateAuthUrl();
  async function generateAuthUrl() {
    const authUrl = snoowrap.getAuthUrl({
      scope: ['identity', 'submit', 'vote'], // İzinlerinizi burada belirtin
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

    const selectQuery = 'SELECT id FROM redtab WHERE username = $1';
    const existingUser = await db.oneOrNone(selectQuery, [username]);

    if (existingUser) {
      res.json({ success: true, username: username });
    } else {
      const insertQuery = 'INSERT INTO redtab (username) VALUES ($1) RETURNING id';
      const result = await db.one(insertQuery, [username]);
      if (result) {
        res.json({ success: true, username: username });
      }
    }
  } catch (error) {
    console.error('Error Occured:', error);
    res.status(500).json({ success: false, error: 'Error occured while saving username' });
  }
});


index.get('/error', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'error.html'))
});

index.get('/userpanel', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'userpanel.html'))
});

module.exports = index;