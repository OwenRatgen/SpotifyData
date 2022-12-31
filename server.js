var express = require('express');
var request = require('request');
var querystring = require('querystring');
var path = require('path');
const pug = require('pug');

const artist_count = 15;
const song_count = 15;
const genre_count = 5;

const artists = [];
const songs = [];
const uncompleteGenres = [];
const genres = [];
const genreFreq = [];
var basicScore = 0;
const names = [];

var term = "short_term";


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.set('view engine', 'pug');
app.set('views', './public');

var client_id = 'c4f0958cbf0741fcaa7dc824e1aca38a'; // Your client id
var client_secret = '872bdd743dcc4feda732e4f4deb5150c'; // Your secret
var redirect_uri = 'http://localhost:3000/callback';



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
        //console.log(`Access token: ${accessToken}`);
        getName(accessToken);
        getTopArtists(accessToken);
        getTopSongs(accessToken);
        checkArtists(100).then(() => {
          getTopGenres(accessToken);
        });
        checkAll(100).then(() => {
          res.redirect('/done');
        });
      });
});

async function checkAll(ms) {
  while (artists.length == 0 || songs.length == 0 || uncompleteGenres.length == 0 || names.length == 0) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function checkArtists(ms) {
  while (artists.length == 0) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}



app.get('/done', (req, res) => {
  //TODO: Change this to render a react page instead of a pug page then no refresh needed
  res.render('done', {artists: artists, songs: songs, genres: genres, genreFreq: genreFreq, score: basicScore, name: names[0]});
});


function getName(accessToken) {
  var name = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      json: true
  };
  request.get(name, function(error, response, body) {
    if (error) {
      console.log(error);
    } else if (typeof body === 'undefined' || !body.hasOwnProperty('display_name')) {
      console.log('Error: Invalid response body');
      console.log(body);
    } else {
      // Print the name
      names.push(body.display_name)
      console.log(`Name: ${name}`);
    }
  });
}

function getTopArtists(accessToken) {
    var topArtists = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        qs: { 
            limit: 100, //the number of artists we're using to calculate popscore and genres
              time_range: term
            },
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
            //console.log("Artists:");
            for (var i = 0; i < out.length; i++){
                //console.log(out[i].name);
                if (i < artist_count) {
                  artists.push(out[i].name);
                }
                uncompleteGenres.push(out[i].genres);
                basicScore += out[i].popularity;
            }
            basicScore = basicScore / uncompleteGenres.length;
            basicScore = Math.round(basicScore);
        }
    });
  }

function getTopSongs(accessToken) {
  var topSongs = {
      url: 'https://api.spotify.com/v1/me/top/tracks',
      qs: { limit: song_count,
            time_range: term
          },
      headers: {
          'Authorization': 'Bearer ' + accessToken
      },
      json: true
  };

  request.get(topSongs, function(error, response, body) {
      if (error) {
          console.log(error);
      } else if (typeof body === 'undefined' || !body.hasOwnProperty('items')) {
          console.log('Error: Invalid response body');
          console.log(body);
      } else {
          // Print the top artists
          var out = body.items;
          //console.log("Songs:");
          for (var i = 0; i < out.length; i++){
              //console.log(out[i].name);
              songs.push(out[i].name);
          }
      }
  });
}

function getTopGenres(accessToken) {
  
  //Make a hashmap that counts the number of times each genre appears
  var genreMap = new Map();
  for (var i = 0; i < uncompleteGenres.length; i++) {
    for (var j = 0; j < uncompleteGenres[i].length; j++) {
      if (genreMap.has(uncompleteGenres[i][j])) {
        genreMap.set(uncompleteGenres[i][j], genreMap.get(uncompleteGenres[i][j]) + 1);
      } else {
        genreMap.set(uncompleteGenres[i][j], 1);
      }
    }
  }
  
  //Sort the genres by number of times they appear and list the top genre_count genres
  var sortedGenres = new Map([...genreMap.entries()].sort((a, b) => b[1] - a[1]));
  var i = 0;
  for (var [key, value] of sortedGenres) {
    if (i < genre_count) {
      //console.log(key)
      genres.push(key);
      genreFreq.push(value);
      i++;
    } else {
      break;
    }
  }
  //capitalize the first letter of each word in each genre
  for (var i = 0; i < genres.length; i++) {
    genres[i] = genres[i].replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}
}


// Establishes connection between code and web server
app.listen(3000, () => {
    console.log('Listening on port 3000');
  });