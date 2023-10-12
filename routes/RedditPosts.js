const express = require('express');
const RedditPosts = express.Router();
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT } = process.env;

const db = require('../db/redditDB');

async function getUserDataByRedditId(redditId) {
    try {
      const status = 'ACTIVE';
      const query = 'SELECT access_token AND reddit_name FROM redtab WHERE reddit_id = $1 AND status $2';
      const result = await db.oneOrNone(query, [redditId, status]);
      return result ? result.access_token : null; // Eğer bir sonuç varsa erişim jetonunu döndürün, yoksa null döndürün
    } catch (error) {
      throw error;
    }
  }

RedditPosts.get('/subreddit-top-posts', async (req, res) => {
  const redditId = req.session.redditId;
  const subreddit = req.body.subreddit;
  const userdata = await getUserDataByRedditId(redditId);
  
  const redditClient = new snoowrap({
    userAgent: REDDIT_USER_AGENT,
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    accessToken: userdata.access_token
  });

  async function getTopPosts() {
    const subreddit = await redditClient.getSubreddit();
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

RedditPosts.get('/user-posts', async (req, res) => {
    const redditId = req.session.redditId;
    
    const userdata = await getUserDataByRedditId(redditId);
    
    const redditClient = new snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      accessToken: userdata.access_token
    });
    try {
      const me = await redditClient.getMe();
      const myPosts = await me.getOverview();
      const myOwnPosts = myPosts.filter(post => post.author.name === userdata.reddit_name);
      const postDetails = myOwnPosts.map(post => ({
        id: post.id,
        title: post.title,
        url: post.url,
      }));
  
      res.json(postDetails);
    } catch (error) {
      console.error('Error fetching your posts:', error);
      res.status(500).json({ error: 'Failed to fetch your posts' });
    }
  });


module.exports = RedditPosts;
