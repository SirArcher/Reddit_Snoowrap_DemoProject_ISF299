const express = require('express');
const pleaseWait = express.Router();
const path = require('path');
const axios = require('axios');
const snoowrap = require('snoowrap');
const qs = require('querystring');
const dotenv = require('dotenv');

dotenv.config();

const { REDDIT_CLIENT_ID, REDDIT_USER_AGENT, REDDIT_CLIENT_SECRET, REDDIT_REDIRECT_URL } = process.env;

const db = require('../db/redditDB');

pleaseWait.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'PleaseWait.html'));
    req.session.authCode = req.query.code;
});

pleaseWait.get('/process-data', async (req, res) => {
    const authCode = req.session.authCode;
    const username = req.session.username;
    const password = req.session.password;
    async function saveData(redditId, redditName, accessToken, refreshToken, status, username, password) {
        try {
            const insertQuery = `
                    UPDATE redtab 
                    SET reddit_id = $1, reddit_name = $2, access_token = $3, refresh_Token = $4, status = $5 
                    WHERE username = $6 AND password = $7 AND status IS NULL
                    RETURNING id
                `;
            const data = await db.one(insertQuery, [redditId, redditName, accessToken, refreshToken, status, username, password]);
            req.session.redditId = redditId;
            return data.id;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    const status ='ACTIVE';
    async function checkData(username, password, status) {
        try {
            const selectQuery = 'SELECT reddit_id FROM redtab WHERE username = $1 AND password = $2 AND status = $3';
            const existingUser = await db.oneOrNone(selectQuery, [username, password, status]);
            
            if (existingUser && existingUser.reddit_id !== null) {
                req.session.redditId = existingUser.reddit_id;
                return true, req.session.redditId;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Database Error:', error);
            return null;
        }
    }
    const IsExist = await checkData(username, password, status);
    if (IsExist==false) {
        const data = {
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: REDDIT_REDIRECT_URL,
        };
        axios.post('https://www.reddit.com/api/v1/access_token', qs.stringify(data), {
            auth: {
                username: REDDIT_CLIENT_ID,
                password: REDDIT_CLIENT_SECRET,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(async response => {
            const redditClient = new snoowrap({
                userAgent: REDDIT_USER_AGENT,
                clientId: REDDIT_CLIENT_ID,
                clientSecret: REDDIT_CLIENT_SECRET,
                accessToken: response.data.access_token,
            });
            const redditUser = await redditClient.getMe();
            const status = 'ACTIVE';
            const userId = await saveData(
                redditUser.id,
                redditUser.name,
                response.data.access_token,
                response.data.refresh_token,
                status,
                username,
                password
            );
            res.json({ success: true });
        }).catch(error => {
            console.log(error);
            res.json({ success: false, error: error });
        });
    } else if (IsExist) {
        return true;
    }
});

module.exports = pleaseWait;