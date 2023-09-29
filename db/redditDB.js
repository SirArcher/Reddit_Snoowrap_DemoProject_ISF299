const dotenv = require('dotenv');
const pgp = require('pg-promise')( /* options */ )
dotenv.config();

const RedditDbUrl = process.env.REDDIT_DB 
const redditdb = pgp(RedditDbUrl)
module.exports = redditdb; 
