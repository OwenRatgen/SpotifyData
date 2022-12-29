var express = require('express');
var request = require('request');
var querystring = require('querystring');
var path = require('path');
const pug = require('pug');

const artist_count = 15;


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', './public');

var client_id = 'c4f0958cbf0741fcaa7dc824e1aca38a'; // Your client id
var client_secret = '872bdd743dcc4feda732e4f4deb5150c'; // Your secret
var redirect_uri = 'http://localhost:3000/callback';

const artists = [];

// Send homepage to the user
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// Have the user login to their spotify account
app.get('/login', function(req, res) {

    var scope = 'user-top-read';
    // Query string is used to retrieve information from a database
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri
    }));
});

app.get('/callback', (req, res) => {

    // User's authorization code
    var code = req.query.code;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        var accessToken = body.access_token;
        console.log(`Access token: ${accessToken}`);
        getTopArtists(accessToken);
        res.redirect('/done');
      });
});


app.get('/done', (req, res) => {
  // Change this to render a react page instead of a pug page then no refresh needed
    if (artists.length == 0){
        res.redirect('/done');
    }
    else{
    res.render('done', {artists: artists});
    }
});



function getTopArtists(accessToken) {
    var topArtists = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        qs: { limit: artist_count },
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };
  
    request.get(topArtists, function(error, response, body) {
        if (error) {
            console.log(error);
        } else if (typeof body === 'undefined' || !body.hasOwnProperty('items')) {
            console.log('Error: Invalid response body');
            console.log(body);
        } else {
            // Print the top artists
            var out = body.items;
            for (var i = 0; i < out.length; i++){
                console.log(out[i].name);
                artists.push(out[i].name);
            }
        }
    });
}


// Establishes connection between code and web server
app.listen(3000, () => {
    console.log('Listening on port 3000');
  });