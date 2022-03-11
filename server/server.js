const axios = require('axios');
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const randomRouter = require('./routes/random.router');

/** ---------- MIDDLEWARE ---------- **/
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // needed for angular requests
app.use(express.static('build'));



app.get('/random', (req, res) => {
    axios.get(`http://api.giphy.com/v1/randomid?api_key=${process.env.GIPHY_API_KEY}`)
        .then(response => res.send(response.data))
        .catch(error => {
            console.log('Error is', error);
            res.sendStatus(500);
        });
})

/** ---------- ROUTES ---------- **/
app.use('/random', randomRouter);

/** ---------- START SERVER ---------- **/
app.listen(port, function () {
    console.log('Listening on port: ', port);
});