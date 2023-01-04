var express = require('express');
var request = require('request');
var querystring = require('querystring');
var path = require('path');
const pug = require('pug');

const artist_count = 15;
const rec_artist_count = 10;
const song_count = 15;
const genre_count = 5;

var artists = [];
var FullArtists = [];
var songs = [];
var uncompleteGenres = [];
var genres = [];
var genreFreq = [];
var basicScore = 0;
var varietyScore = 0;
const names = [];
var outRecArtists = [];
var topArtistPicURL = [];

var needUpdate = true;

var term = "medium_term";


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.set('view engine', 'pug');
app.set('views', './public');

var client_id = 'c4f0958cbf0741fcaa7dc824e1aca38a'; // Your client id
var client_secret = '872bdd743dcc4feda732e4f4deb5150c'; // Your secret
var redirect_uri = 'http://localhost:3000/callback';

const standardDeviation = (arr, usePopulation = false) => {
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  return Math.sqrt(
    arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
      (arr.length - (usePopulation ? 0 : 1))
  );
};

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
    console.log("IN CALLBACK " + term + " " + needUpdate);
    if(needUpdate){
      artists = [];
      FullArtists = [];
      songs = [];
      uncompleteGenres = [];
      genres = [];
      genreFreq = [];
      basicScore = 0;
      varietyScore = 0;
      outRecArtists = [];
      topArtistPicURL = [];
      needUpdate = false;
    }
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
        
        if (names.length == 0){
          getName(accessToken);
        }
        if (artists.length == 0 ){
          getTopArtists(accessToken);
        }
        if (songs.length == 0){
          getTopSongs(accessToken);
        }
        checkArtists(100).then(() => {
          if(genres.length != genre_count){
            getTopGenres(accessToken);
          }
          if (outRecArtists.length == 0){
            recommendArtists(accessToken);
          }
          if (topArtistPicURL.length == 0){
            getTopArtistPicture(accessToken);
          }
        });
        checkAll(100).then(() => {
          res.redirect('/done');
        });
      });
});

async function checkAll(ms) {
  while (artists.length == 0 || songs.length == 0 || uncompleteGenres.length == 0 || names.length == 0 || outRecArtists.length == 0 || topArtistPicURL.length == 0) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function checkArtists(ms) {
  while (artists.length == 0) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}



app.get('/done', (req, res) => {
  res.render('done', {artists: artists, songs: songs, genres: genres, genreFreq: genreFreq, score: basicScore, name: names[0], recArtists: outRecArtists, topArtistPicURL: topArtistPicURL[0], varietyScore: varietyScore});
});

app.get('/short', (req, res) => {
  if (term == "short_term") {
    needUpdate = false;
  }
  else{
    needUpdate = true;
    term = "short_term";
  }
  res.redirect('/login');
});


app.get('/medium', (req, res) => {
  if (term == "medium_term") {
    needUpdate = false;
  }
  else{
    needUpdate = true;
    term = "medium_term";
  }
  res.redirect('/login');
});

app.get('/long', (req, res) => {
  if (term == "long_term") {
    needUpdate = false;
  }
  else{
    needUpdate = true;
    term = "long_term";
  }
  res.redirect('/login');
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
            for (var i = 0; i < out.length; i++){
                if (i < artist_count) {
                  artists.push(out[i].name);
                  FullArtists.push(out[i]);
                   // you can get "more accurate" artist recommendations by filling FullArtists 
                   //with more than artist_count artists but it increases load time by ~120%
                }
                uncompleteGenres.push(out[i].genres);
                basicScore += out[i].popularity;
            }
            basicScore = basicScore / uncompleteGenres.length;
            basicScore = Math.round(basicScore);
        }
    });
}

function getTopArtistPicture(accessToken) {
    const topID = FullArtists[0].id;
    var optionsArtistPic = {
        url: `https://api.spotify.com/v1/artists/${topID}/`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        json: true
    };
    request.get(optionsArtistPic, function(error, response, body) {
      if (error) {
          console.log(error);
      } else if (typeof body === 'undefined') {
          console.log('Error: Invalid response body');
          console.log(body);
      } else {
          // Print the top artists
          topArtistPicURL.push(body.images[0].url);
      }
  });
}

async function getArtistRecommendationsHelper(artistId, accessToken) {
  const options = {
    url: `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(options, function(error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
      } else if (!body.hasOwnProperty('artists')) {
        console.log('Error: Invalid response body');
        console.log(body);
        reject(new Error('Invalid response body'));
      } else {
        // return an array of the top 10 recommended artists
        var num_recs_per_artist = 10;
        var out = body.artists;
        var recs = [];
        for (var i = 0; i < num_recs_per_artist; i++) {
          recs.push(out[i].name);
        }
        resolve(recs);
      }
    });
  });
}


async function recommendArtists(accessToken) {
  // use the complete artists array, weight the recommendations by len - index/len (so the first artist is weighted more)
  var recArtists = {}

  for (var i = 0; i < FullArtists.length; i++) {
    var artist = FullArtists[i];
    var id = artist.id;
    // await the result of the helper function
    var recs = await getArtistRecommendationsHelper(id, accessToken);

    if (recs == null) {
      continue;
    }

    for (var j = 0; j < recs.length; j++) {
      var rec = recs[j];
      if (rec in recArtists) {
        recArtists[rec] += (FullArtists.length - i) / FullArtists.length;
      } else {
        recArtists[rec] = (FullArtists.length - i) / FullArtists.length;
      }
    }
  }

  // sort the hashmap by value
  var sortedRecs = Object.keys(recArtists).sort(function(a,b){return recArtists[b]-recArtists[a]});
  
  // return the top rec_artist_count
  for (var i = 0; i < rec_artist_count; i++) {
    if (!(sortedRecs[i] in FullArtists)) {
      outRecArtists.push(sortedRecs[i]);
    }
  }
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
          for (var i = 0; i < out.length; i++){
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

  var freqs = [];
  var i = 0;
  for (var [key, value] of sortedGenres) {
    if (i < 10) {
       // change this value to change the number of genres used to calculate the variety score
       freqs.push(value);
    }
    else{
      break;
    }
    i++;
  }
  varietyScore += standardDeviation(freqs);
  varietyScore *= 5; // scale the variety score to be roughly between 0 and 100
  varietyScore = Math.round(varietyScore); //round it to the nearest integer
  i = 0;
  for (var [key, value] of sortedGenres) {
    if (i < genre_count) {
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