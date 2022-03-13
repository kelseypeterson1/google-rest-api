const axios = require('axios');
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const googleRouter = require('./routes/google.router');
const { google } = require('googleapis');
const request = require('request');
const cors = require('cors');
const urlParse = require('url-parse');
const queryParse = require('query-string');

/** ---------- MIDDLEWARE ---------- **/
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // needed for angular requests
app.use(express.static('build'));
app.use(cors());

// --------------- GOOGLE API ---------------

app.get('/api/google', (req, res) => {
    // axios.get(`http://api.giphy.com/v1/randomid?api_key=${process.env.GIPHY_API_KEY}`)
    const oauth2Client = new google.auth.OAuth2(
        //client id
        `${process.env.REST_CLIENT_API_KEY}`,
        //client secret
        `${process.env.REST_API_KEY}`,
        //link to redirect to
        "http://localhost:5000/steps"
    )
    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read profile email openid"]

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify({
            callbackUrl: req.body.callbackUrl,
            userID: req.body.userid
        })
    })

    request(url, (err, response, body) => {
        console.log('error:', err);
        console.log('statusCode:', response && response.statusCode);
        res.send({ url });
    })
})

app.get('/steps', async (req, res) => {
    const queryUrl = new urlParse(req.url);
    const code = queryParse.parse(queryUrl.query).code;
    const oauth2Client = new google.auth.OAuth2(
        //client id
        `${process.env.REST_CLIENT_API_KEY}`,
        //client secret
        `${process.env.REST_API_KEY}`,
        //link to redirect to
        "http://localhost:5000/steps"
    )

    const tokens = await oauth2Client.getToken(code);
    // console.log(tokens)
    res.send('HELLO');

    let stepArray = [];

    try {
        const result = await axios({
            method: 'POST',
            headers: {
                authorization: 'Bearer ' + tokens.tokens.access_token
            },
            'Content-Type': 'application/json',
            url:  `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            data: {
                aggregateBy: [
                    {
                        dataTypeName: 'com.google.step_count.delta',
                        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
                    }
                ],
                bucketByTime: {durationMillis: 86400000},
                startTimeMillis: 1646105560790,
                endTimeMillis: 1647206660790,
            }
        })
        // console.log(result)
        stepArray = result.data.bucket
    } catch (err) {
        console.log(err)
    }
    try {
        for(const dataSet of stepArray) {
            // console.log(dataSet);
            for(const points of dataSet.dataset){
                // console.log(points)
                for(const steps of points.point){
                    console.log(steps.value)
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
})

/** ---------- ROUTES ---------- **/
app.use('/api/google', googleRouter);


/** ---------- START SERVER ---------- **/
app.listen(port, function () {
    console.log('Listening on port: ', port);
});


