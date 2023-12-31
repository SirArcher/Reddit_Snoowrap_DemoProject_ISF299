const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const CreatPost = require('./routes/CreatePost.js');
const redditPosts = require('./routes/RedditPosts.js');
const Index = require('./routes/Index.js');
const pleaseWait = require('./routes/pleaseWait.js');

const app = express();

const secret = crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: secret,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const port = process.env.PORT;
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/create-post', CreatPost);
app.use('/', Index);
app.use('/please-wait',pleaseWait);
app.use('/reddit-posts',redditPosts);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});