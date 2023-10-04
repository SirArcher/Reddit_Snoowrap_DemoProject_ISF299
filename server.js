const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const CreatPost = require('./routes/CreatePost.js');
const userPosts= require('./routes/UserPosts.js');
const TopPosts = require('./routes/TopPosts.js');
const LoginIndex = require('./routes/LoginIndex.js');

const app = express();
const port = process.env.PORT;
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));


app.use(bodyParser.urlencoded({ extended: false }));
app.use('/my-posts', userPosts);
app.use('/create-post', CreatPost);
app.use('/top-posts',TopPosts);
app.use('/', LoginIndex);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});