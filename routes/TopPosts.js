const express = require('express');
const TopPosts = express.Router();
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT } = process.env;

const db = require('../db/redditDB');

TopPosts.get('/', async (req, res) => {
  const redditId = req.session.redditId;
  
  async function getAccessTokenByRedditId(redditId) {
    try {
      const query = 'SELECT access_token FROM redtab WHERE reddit_id = $1';
      const result = await db.oneOrNone(query, [redditId]);
      return result ? result.access_token : null; // Eğer bir sonuç varsa erişim jetonunu döndürün, yoksa null döndürün
    } catch (error) {
      throw error;
    }
  }
  const accessToken = await getAccessTokenByRedditId(redditId);
  
  // Create a snoowrap client
  const redditClient = new snoowrap({
    userAgent: REDDIT_USER_AGENT,
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    accessToken: accessToken
  });

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
