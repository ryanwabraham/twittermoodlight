const app = require('http').createServer(handler);
const io = require('socket.io').listen(app);
const fs = require('fs');
const twit = require('twit');
const config = require('./config');
const wordBank = require('./public/js/wordbank.json');
const endpoint = 'statuses/sample';
const nodeStatic = require('node-static'); // for serving files
const fileServer = new nodeStatic.Server('./public');
const twitter = new twit(config);
const stream = twitter.stream(endpoint);

// this is the port for our web server
app.listen(9000, function(){
    console.log('Listening on port 9000...');
});

// fulfill client requests
function handler (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}

// to add more emotions
// insert another key in wordbank.json
// add another key to emotion tally
// and a condition in determineMood()

let tweetCount = 0;
let currentMood = 'happy';
let start = new Date();
let tps = 0; // tweets per second
let now;
let emotionMap = {
    "happyWords": 0,
    "romanticWords": 0,
    "sadWords": 0,
    "angryWords": 0,
    "afraidWords": 0
};

const resetEmotionMap = () => {
    emotionMap = {
        "happyWords": 0,
        "romanticWords": 0,
        "sadWords": 0,
        "angryWords": 0,
        "afraidWords": 0
    };
};

const countMatches = (wordSet, tweet) => {
    const words = tweet.text.split(' ');
    let matchCount = 0;

    words.forEach(word => {
        if (wordSet.includes(word)) matchCount += 1;
    });

    return matchCount;
};

const determineMood = (tweet) => {
    for (let emotion in wordBank) {
        emotionMap[emotion] += countMatches(wordBank[emotion], tweet);
    }
};

// alert clients of mood change
const changeMood = (emotion) => {
    io.sockets.emit('moodChange', emotion);
};

// calculate tweets per second every 5s
setInterval(() => {
    now = new Date();
    const newTps = parseInt((1000 * tweetCount) / (now - start), 10);
    // only alert clients if there is a change
    if (newTps !== tps) {
        io.sockets.emit('tps', newTps);
        tps = newTps;
    }
}, 5000);

// check for mood change every 10s
setInterval(() => {
    let newMood = Object.keys(emotionMap).reduce((a, b) => {
        return emotionMap[a] > emotionMap[b] ? a : b;
    });
    newMood = newMood.replace('Words','');

    // only alert clients if there is a change
    if (newMood !== currentMood) {
        changeMood(newMood);
        currentMood = newMood;
    }
    resetEmotionMap();
}, 10000);

// listen for stream connection
stream.on('connect', () => {
    console.log('Streaming from the Twitter API...');
});

// listen for tweets
stream.on('tweet', (tweet) => {
    tweetCount += 1;
    if (tweet.lang === 'en') {
        determineMood(tweet);
    }
});

// listen for errors
stream.on('error', (err) => {
    console.log(err);
});

// listen for incoming connections from clients
io.on('connection', (socket) => {
    // send new clients current mood and tps
    socket.emit('moodChange', currentMood);
    io.sockets.emit('tps', tps);
});
