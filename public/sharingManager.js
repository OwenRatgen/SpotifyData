document.getElementById("SnapShare").addEventListener("click", shareImageSnap);
document.getElementById("SMSShare").addEventListener("click", shareImageSMS);
document.getElementById("FBShare").addEventListener("click", shareImageFB);
document.getElementById("InstaShare").addEventListener("click", shareImageInsta);

img = document.getElementById("outImage2").src;

function shareImageSnap() {
    window.location.href = "snapchat://app?blob=" + encodeURIComponent(img);
}

function shareImageSMS() {

    window.location.href = "sms:?body=" + encodeURIComponent(img);
}

function shareImageFB() {
    window.location.href = "fb-messenger://share/?link=" + encodeURIComponent(img);
}

function shareImageInsta() {
    window.location.href = "instagram://app?blob=" + encodeURIComponent(img);
}