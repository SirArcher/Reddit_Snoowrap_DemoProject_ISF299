const express = require('express');
const login = express.Router();
const snoowrap = require('snoowrap');
const path = require('path');
const dotenv = require('dotenv');
const db = require('../db/redditDB');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD, REDDIT_USER_AGENT } = process.env;

// Create a snoowrap client
const redditClient = new snoowrap({
  userAgent: REDDIT_USER_AGENT,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  username: REDDIT_USERNAME,
  password: REDDIT_PASSWORD,
});

login.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
});



login.get('/api/checkSubredditExistence/:subredditName', async (req, res) => {
  const subredditName = req.params.subredditName;
  async function checkSubredditExistence(subredditName) {
    try {
      const subredditInfo = await redditClient.getSubreddit(subredditName).created_utc.then(console.log);//.created_utc.then(console.log) part of this line is not neccessary. 
      // Reddit API başarıyla çalıştı, subreddit var olarak kabul edebiliriz
      return true;
    } catch (error) {
      console.error('API Error',error);
      return false;
    }
  }
  const subredditExists = await checkSubredditExistence(subredditName);
  res.json({ subredditExists });
  console.log(subredditExists);
});

module.exports = login;