const express = require('express');
const TopPosts = express.Router();
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD, REDDIT_USER_AGENT } = process.env;

const redditClient = new snoowrap({
  userAgent: REDDIT_USER_AGENT,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  username: REDDIT_USERNAME,
  password: REDDIT_PASSWORD,
});


TopPosts.get('/', async (req, res) => {
  async function getTopPosts() {
    const subreddit = await redditClient.getSubreddit('wiredpeople');
    const topPosts = await subreddit.getTop({ limit: 5 });
    console.log(topPosts);
    const postInfo = topPosts.map(post => ({
      title: post.title,
      permalink: post.permalink,
    }));
    res.json({ postInfo });
  }
  
  getTopPosts();
});




module.exports = TopPosts;
