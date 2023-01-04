var canvas = document.getElementById("outImage");
var ctx = canvas.getContext("2d");
var topArtistPic = document.getElementById("TopArtistPic");
var imgTemp = new Image();
var artistName = document.getElementById("topArtistText").innerHTML;
imgTemp.src = 'Template.png';

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
  

imgTemp.onload = function() {
    var imageAspectRatio = imgTemp.width / imgTemp.height;
    var canvasAspectRatio = canvas.width / canvas.height;

    // Determine the width and height of the image to draw on the canvas
    var imageWidth, imageHeight;
    if (imageAspectRatio > canvasAspectRatio) {
      // The image is wider than the canvas, so we need to adjust the width of the image to match the width of the canvas
      imageWidth = canvas.width;
      imageHeight = imageWidth / imageAspectRatio;
    } else {
      // The image is taller than the canvas, so we need to adjust the height of the image to match the height of the canvas
      imageHeight = canvas.height;
      imageWidth = imageHeight * imageAspectRatio;
    }

    // Calculate the position of the image on the canvas
    var x = (canvas.width - imageWidth) / 2;
    var y = (canvas.height - imageHeight) / 2;

    //ctx.drawImage(imgTemp, x, y, imageWidth, imageHeight);
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, imageWidth, imageHeight);
    ctx.drawImage(topArtistPic, 18, 9, canvas.width*0.88, canvas.width*0.83);
    ctx.font = '22px Futura';
    ctx.fillStyle = 'black';
    ctx.fillText("Top Artist: " + artistName, 20, 280);
    ctx.lineWidht = 1;
    ctx.moveTo(20, 285);
    ctx.lineTo(282, 285);
    ctx.stroke();
    ctx.font = '14px Futura';
    ctx.fillText("Top Artists:", 20, 300);
    ctx.font = '8px Futura';
    starting = 315;
    for (var i = 0; i < artistNamesA.length; i++) {
        var thisArtist = splitString(artistNamesA[i]);
        ctx.fillText((i+2)+".", 20, starting);
        for (var j = 0; j < thisArtist.length; j++) {
            ctx.fillText(thisArtist[j], 30, starting);
            starting += 8;
        }
        starting += 3;
        }
     
    starting = 315;
    for (var k = 0; k < artistNamesB.length; k++) {
        var thisArtist = splitString(artistNamesB[k]);
        ctx.fillText((i+k+2)+".", 115, starting);
        for (var j = 0; j < thisArtist.length; j++) {
            if (k+i+1 < 10) {
            ctx.fillText(thisArtist[j], 125, starting);
            }
            else {
            ctx.fillText(thisArtist[j], 128, starting);
            }
            starting += 8;
        }
        starting += 3;
        }

    ctx.font = '10px Futura';
    ctx.fillText("Album by: " + userName, 200, 310);
    ctx.fillText("Released on:", 200, 325);
    ctx.fillText("" + date.toLocaleString('default', { month: 'long'}) + " " + (date.getDay()+1)+ ", " + date.getFullYear(), 200, 335);
  };



