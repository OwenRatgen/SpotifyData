var canvas = document.getElementById("outImage");
var ctx = canvas.getContext("2d");
var topArtistPic = document.getElementById("TopArtistPic");
var artistName = document.getElementById("topArtistText").innerHTML;

var unreadArtistNamesA = document.getElementById('artistNamesA').getElementsByTagName('li');
var unreadArtistNamesB = document.getElementById('artistNamesB').getElementsByTagName('li');
var artistNamesA = [];
var artistNamesB = [];

var userName = document.getElementById("nameData").innerHTML;
var date = new Date();

for (var i = 0; i < unreadArtistNamesA.length; i++) {
    artistNamesA.push(unreadArtistNamesA[i].innerHTML);
}
for (var i = 0; i < unreadArtistNamesB.length; i++) {
    artistNamesB.push(unreadArtistNamesB[i].innerHTML);
}

function splitString(input) {
    var output = [];
    var currentLine = '';
    var words = input.split(' ');
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      if (currentLine.length + word.length > 15) {
        output.push(currentLine);
        currentLine = '';
      }
      currentLine += word + ' ';
    }
    if (currentLine.length > 0) {
      output.push(currentLine);
    }
    return output;
  }
  

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 280, 400);
    ctx.drawImage(topArtistPic, 8, 9, 264, 249);
    ctx.font = '22px Futura';
    ctx.fillStyle = 'black';
    ctx.fillText("Top Artist: " + artistName, 10, 280);
    ctx.lineWidht = 1;
    ctx.moveTo(10, 285);
    ctx.lineTo(272, 285);
    ctx.stroke();
    ctx.font = '14px Futura';
    ctx.fillText("Top Artists:", 10, 300);
    ctx.font = '8px Futura';
    starting = 315;
    for (var i = 0; i < artistNamesA.length; i++) {
        var thisArtist = splitString(artistNamesA[i]);
        ctx.fillText((i+2)+".", 10, starting);
        for (var j = 0; j < thisArtist.length; j++) {
            ctx.fillText(thisArtist[j], 20, starting);
            starting += 8;
        }
        starting += 3;
        }
     
    starting = 315;
    for (var k = 0; k < artistNamesB.length; k++) {
        var thisArtist = splitString(artistNamesB[k]);
        ctx.fillText((i+k+2)+".", 105, starting);
        for (var j = 0; j < thisArtist.length; j++) {
            if (k+i+1 < 10) {
            ctx.fillText(thisArtist[j], 115, starting);
            }
            else {
            ctx.fillText(thisArtist[j], 118, starting);
            }
            starting += 8;
        }
        starting += 3;
        }

    ctx.font = '10px Futura';
    ctx.fillText("Album by: " + userName, 190, 310);
    ctx.fillText("Released on:", 190, 325);
    ctx.fillText("" + date.toLocaleString('default', { month: 'long'}) + " " + (date.getDay()+1)+ ", " + date.getFullYear(), 190, 335);
    
    var image = document.getElementById('outImage2');
    image.src = canvas.toDataURL('image/jpeg');

