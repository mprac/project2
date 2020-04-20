# Project 2

Web Programming with Python and JavaScript

# Project 2 | Description

The project is made up of 2 html files where 1 is a template used to demonstrate templating, 3 scss files that are processed into one css file plus bootstrap, 1 javascript file, and the main application.py. 

The html layout.html holds all the stylesheets and javascript from my personal files plus bootsraps framework. The file contains all the applications content which is the header, the footer section or bottom nav for messaging input, and the modals used to join the chat and switch between channels. The index.html file holds the chat section in the body of the application indicated by {% block body %}.

The 3 scss files used consist of 1 file _ux.scss holding the applications color theme , the other _custom.scss holding all the custom styling and style.scss importing the other 2 to be processed into style.css. 

The index.js holds all the application logic that works with application.py. When the application connects, I check if the local storage is set to username and if true the modal to join will hide and user will be able to chat else the modal to join will show for user to input a username. Once user has joined all their data is stored in localstorage after being checked against the joinedUsers set to avoid duplicates and to approve username matches applications recommendations. Once user joins they will automatically get assigned to the general channel. User can then chat in general or create a new channel using the same input field to send messages but by pressing on the + button. Once a user creates a channel they will automatically switch to that channel. The channel switching in the application uses localstorage which gets reassigned once a channel is created or clicked on from the channel list. The app uses the load data socket to update all the data in the app by calling on the functions and sending in the new data. Because the channel is in localstorage when a user closes the browser and returns the application will remember which channel the user is in. 

For my personal touch I chose to allow the user to delete any message associated with their name. There are 2 message outputs that generate, the user who sent the message and the message received by other users. The message the user generated has a set attribute javascript method which assigns to it the index of the message that was stored on the servers channels list as an html id. Once a user clicks that button or x as seen on the application I extract the index assigned to the id and send it back to the application which then deletes the dictionary from the list containing the message with that specific index number. 

Once a user is done they will press the exit button which deletes their name from the joinedUsers list and clears all local storage prior to redirecting the page and checking if localstorage username is set or not. 

