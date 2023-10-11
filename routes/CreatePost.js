const express = require('express');
const CreatePost = express.Router();
const snoowrap = require('snoowrap');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT } = process.env;

const db = require('../db/redditDB');

CreatePost.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'createpost.html'))
  const redditId = req.session.redditId;
  console.log(redditId);
});

CreatePost.post('/', async (req, res) => {
  const { subredditName, postTitle, postText, postUrl, postType } = req.body;
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

  async function createLinkPost(subredditName, postTitle, postUrl) {
    try {
      const subreddit = await redditClient.getSubreddit(subredditName);
      const post = await subreddit.submitLink({
        title: postTitle,
        url: postUrl,
      });

      console.log('Link post created successfully.');
      return {
        postUrl: post.url,
        postId: post.id,
      };
    } catch (error) {
      console.error('Error creating link post:', error);
    }
  }

  async function createTextPost(subredditName, postTitle, postText) {
    try {
      const subreddit = await redditClient.getSubreddit(subredditName);
      const post = await subreddit.submitSelfpost({
        title: postTitle,
        text: postText,
        sendReplies: true, // Yanıtlara izin vermek isterseniz true olarak ayarlayın
      });

      console.log('Text-only post created successfully');

      return post;
    } catch (error) {
      console.error('Error on creating text-only post:', error);
    }
  }
  try {
    let result;

    if (postType === 'link') {
      result = await createLinkPost(subredditName, postTitle, postUrl);
    } else if (postType === 'text') {
      result = await createTextPost(subredditName, postTitle, postText);
    } else {
      throw new Error('Invalid post type.');
    }

    res.json(result);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Error on post creation' });
  }
});

CreatePost.get('/api/checkSubredditExistence/:subredditName', async (req, res) => {
  const subredditName = req.params.subredditName;
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

module.exports = CreatePost;
