const express = require('express');
const CreatePost = express.Router();
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

    console.log('Metin gönderisi başarıyla oluşturuldu.');

    return post;
  } catch (error) {
    console.error('Metin gönderisi oluşturma hatası:', error);
  }
}

CreatePost.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'createpost.html'))
});

CreatePost.post('/', async (req, res) => {
  const { subredditName, postTitle, postText, postUrl, postType } = req.body;

  try {
    let result;

    if (postType === 'link') {
      result = await createLinkPost(subredditName, postTitle, postUrl);
    } else if (postType === 'text') {
      result = await createTextPost(subredditName, postTitle, postText);
    } else {
      throw new Error('Geçersiz post türü.');
    }

    res.json(result);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Paylaşım oluşturma hatası' });
  }
});

module.exports = CreatePost;
