const groupNamesTemp = document.getElementById('groups').getElementsByTagName('li');
const groupNames = [];
const createGroupButton = document.getElementById('groupmake');

const userID = document.getElementById('userID').innerHTML;

for (var i = 0; i < groupNamesTemp.length; i++) {
    groupNames.push(groupNamesTemp[i].innerHTML);
}


createGroupButton.addEventListener('click', async () => {
  // Make the POST request to the /createGroup endpoint
  const groupName = document.getElementById('group-name').value;
  console.log(groupName);
  try {
    options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ groupName: groupName, userID: userID })
    }
      const response = await fetch('/createGroup', options);
      const data = await response.json();
      console.log(data.message);
  } catch (err) {
      console.error(err);
  }
});