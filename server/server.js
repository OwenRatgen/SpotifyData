const express = require('./my-app/node_modules/@types/express');
const request = require('request');

const app = express();

// Set up application credentials
const clientId = 'client_id';
const clientSecret = 'client_secret';

// Send homepage to the user
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.get('/login', (req, res) => {

  res.redirect(
    'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + clientId +
    '&scope=' + encodeURIComponent('user-top-read') +
    '&redirect_uri=' + encodeURIComponent('http://localhost:3000/callback')
  );
});

// Set up a route to handle the callback from the authorization server
app.get('/callback', (req, res) => {
  // the code in the redirect URL is the user's authorization code
  const code = req.query.code;

  //the above code needs to be exchanged into an access token
  request.post(
    'https://accounts.spotify.com/api/token',
    {
      form: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/callback',
        client_id: clientId,
        client_secret: clientSecret
      },
      json: true
    },
    (error, response, body) => {
      // The access token is included in the response body
      const accessToken = body.access_token;
      console.log(`Access token: ${accessToken}`);

      // You can now use the access token to make API requests on behalf of the user
      // ...
      getTopArtists(accessToken);
      // Redirect the user to the homepage
      res.redirect('/');
    }
  );
});


function getTopArtists(accessToken) {
  request.get(
    'https://api.spotify.com/v1/me/top/artists',
    {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      json: true
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else if (typeof body === 'undefined' || !body.hasOwnProperty('items')) {
        console.log('Error: Invalid response body');
      } else {
        // Print the top artists
        var out = body.items;
        for (var i = 0; i < out.length; i++){
          console.log(out[i].name);
        }
      }
    }
  );
}


app.listen(3000, () => {
  console.log('Listening on port 3000');
});
