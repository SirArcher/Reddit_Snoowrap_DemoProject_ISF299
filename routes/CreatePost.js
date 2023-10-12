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
});

CreatePost.post('/', async (req, res) => {
  const { subredditName, postTitle, postText, postUrl, postType } = req.body;
  const redditId = req.session.redditId;
  
  async function getAccessTokenByRedditId(redditId) {
    try {
      const query = 'SELECT access_token FROM redtab WHERE reddit_id = $1';
      const result = await db.oneOrNone(query, [redditId]);
      return result ? result.access_token : null; 
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
        sendReplies: true, // If you want to allow replies in your reddit post, make this option is true
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

module.exports = CreatePost;
