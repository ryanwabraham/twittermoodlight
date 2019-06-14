// including libraries and api config
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    twit = require('twit'),
    config = require('./config'),
    wordBank = require('./public/js/wordbank.json'),
    endpoint = 'statuses/sample',
    static = require('node-static'), // for serving files
    tweetCount = 0,
    currentMood = '',
    now, start = new Date(),
    tps = 0; // tweets per second

// to add more emotions, insert another key in wordbank.json
// add another key to emtion tally
// and a condition in determineMood()

var emotionTally = {
    happy: 0,
    romantic: 0,
    sad: 0,
    angry: 0,
    afraid: 0
}

// this will make all the files in the public folder accessible from the web
var fileServer = new static.Server('./public');

// if the URL of the socket server is opened in a browser
function handler (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}

// this is the port for our web server
app.listen(9000, function(){
    console.log('Listening on port 9000...');
});

// instantiate twitter client
var twitter = new twit(config);

// subscribe to the stream of tweets from desired endpoint
var stream = twitter.stream(endpoint);

// listen for stream connection
stream.on('connect', (params) => {
    console.log('Streaming from the Twitter API...');
});

// listen for tweets
stream.on('tweet', (tweet) => {
    tweetCount++;
    if (tweet.lang === 'en') {
        determineMood(tweet);
    } else {
        return;
    }
});

// listen for errors
stream.on('error', (err) => {
    console.log('error!', err);
});

// determine mood
function determineMood(tweet) {
    if (wordBank.happyWords.some((v) => { return tweet.text.toLowerCase().indexOf(v) !== -1; })) {
        emotionTally.happy++;
    } else if (wordBank.romanticWords.some((v) => { return tweet.text.toLowerCase().indexOf(v) !== -1; })) {
        emotionTally.romantic++;
    } else if (wordBank.sadWords.some((v) => { return tweet.text.toLowerCase().indexOf(v) !== -1; })) {
        emotionTally.sad++;
    } else if (wordBank.angryWords.some((v) => { return tweet.text.toLowerCase().indexOf(v) !== -1; })) {
        emotionTally.angry++;
    } else if (wordBank.afraidWords.some((v) => { return tweet.text.toLowerCase().indexOf(v) !== -1; })) {
        emotionTally.afraid++;
    } else {
        return;
    }
}

// reset emotion tally
function resetEmotionTally() {
    emotionTally = {
        happy: 0,
        romantic: 0,
        sad: 0,
        angry: 0,
        afraid: 0
    }
}

// alert clients of mood change
function changeMood(emotion) {
    // console.log('mood change!');
    io.sockets.emit('moodChange', emotion);
}

// calculate tweets per second
setInterval(function() {
    now = new Date();
    newTps = parseInt(1000 * tweetCount / (now - start), 10);
    // only alert clients if there is a change
    if (newTps !== tps) {
        io.sockets.emit('tps', newTps);
        tps = newTps;
    }
}, 1000);

// check for mood change
setInterval(function() {
    // console.log(Object.keys(emotionTally).map(function ( key ) { return emotionTally[key]; }));
    var newMood = Object.keys(emotionTally).reduce((a, b) => { return emotionTally[a] > emotionTally[b] ? a : b });
    // only alert clients if there is a change
    if (newMood !== currentMood) {
        changeMood(newMood);
        currentMood = newMood;
    }
    resetEmotionTally();
}, 30000)

// listen for incoming connections from clients
io.on('connection', (socket) => {
    console.log("User Connected");
    // send new clients current mood and tps
    socket.emit('moodChange', currentMood);
    io.sockets.emit('tps', tps);

    // when the client disconnects...
    socket.on('disconnect', function() {
        console.log("User Disconnected");
    });
});
