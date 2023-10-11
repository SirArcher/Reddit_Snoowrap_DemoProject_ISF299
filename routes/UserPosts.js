const express = require('express');
const UserPosts = express.Router();
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT } = process.env;

const db = require('../db/redditDB');

UserPosts.get('/', async (req, res) => {
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
  try {
    const me = await redditClient.getMe();// Oturum açmış kullanıcının bilgilerini al
    const myPosts = await me.getOverview();// Kullanıcının gönderilerini al
    const myOwnPosts = myPosts.filter(post => post.author.name === REDDIT_USERNAME);// Sadece kendi oluşturduğunuz gönderileri filtrele
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

module.exports = UserPosts;
