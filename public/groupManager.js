const createGroupButton = document.getElementById('groupmake');
const joinGroupButton = document.getElementById("groupjoin");
const errorText = document.getElementById("GroupError")

const userID = document.getElementById('userID').innerHTML;


createGroupButton.addEventListener('click', async () => {
  // Make the POST request to the /createGroup endpoint
  var groupName = document.getElementById('group-name').value;
  
  try {
    options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ groupName: groupName, userID: userID })
    }
        const response = await fetch('/createGroup', options);
        const data = await response.json();
        console.log(data.message);
        errorText.innerHTML = data.message;
  } catch (err) {
      console.error(err);
      errorText.innerHTML = err;
  }
});

joinGroupButton.addEventListener('click', async () => {
    var groupName = document.getElementById('group-name').value;

    try {
        options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ groupName: groupName, userID: userID })
        }
            const response = await fetch('/joinGroup', options);
            const data = await response.json();
            console.log(data.message);
            errorText.innerHTML = data.message;
      } catch (err) {
          console.error(err);
          errorText.innerHTML = err;
      }

});