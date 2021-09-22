# Mood - Help your    friends with their moods
## What is Mood?

The goal of mood project is to develop an application that can find an emotion of a person, and eliminate the negative state of mind by suggestive measures. As a starting point to solve this problem, we developed an application that can help a user to suggest a playlist to anybody in the app who are unhappy.

Research has shown that social networking activity is a good source to gauge a person’s state of mind. Mood of a user is often reflected in his/her social content, like tweets, blogs, article, status updates, etc. Timely analysis of a user’s social media can be used to improve the feelings, and even save a person’s life in an extreme case! Hence it becomes important to regularly analyze the social-media health of our friends and family to take timely action.
 
Our aim is to provide a platform for the users to help other users who are having a negative state of mind through social media and to also a build a better social relationship/bonding with others. We were truly inspired by the <a href="https://www.ibm.com/watson/services/tone-analyzer/">IBM watson tone analyzer</a> and have leveraged its <a href="https://github.com/watson-developer-cloud/node-sdk">node SDK</a>.

The key to our project is to build a social media app that can help the users in suggesting songs based on the mood of the other person from spotify that could make the other person happy and could also lead to a path of tackling depression.
## Desktop 
![alt text](https://github.com/nikhil-isaac/mood/blob/master/assets/screenshots/home.png)
![alt text](https://github.com/nikhil-isaac/mood/blob/master/assets/screenshots/home-1.png)
## Mobile
![alt text](https://github.com/nikhil-isaac/mood/blob/master/assets/screenshots/mobile.jpeg)

## How does it work?

The mood project is built using the express framework. Some of the important components are :

1. Mood is an app that help continuously gauge the emotions of their followers and also other user’s followers too.
2. A user can use it just like any other social media application.
3. The users can give the username as their twitter username and give their own password, once they register to the app, their data from twitter will be loaded to the app.
4. The user can then click add followers button to load their followers data from twitter to the app.
5. Once they load the followers, the users now can click the button to synchronize to get the latest tweets from their followers twitter accounts along with their current emotion that was analyzed using the IBM watson tone analyzer on the most recent tweet.
6. This way a user can know when a user is unhappy and could suggest a playlist from spotify.
7.The user can click the button “Suggest a playlist from spotify” and it will open a query page where a user can search for a playlist (example query: happy) and a list of playlist will appear that matches the query and the user can send that playlist along with a message to their followers or other user’s followers to.
8. In addition to sending a playlist from spotify, a user can also send a message to the person who is unhappy that can change the mood of that person.

## Architecture:
![alt text](https://github.com/nikhil-isaac/mood/blob/master/assets/architecture.jpg)

1. User  can view the playlists that was send by other users in their mood dashboard.
2. The users can listen to the spotify playlist songs in the spotify web player.
3. They can also view the messages that was sent as a post on the mood dashboard by other users, and can also send a reply message that will be posted on the mood dashboard.

The mood project is built using the express framework. 

Tech Stack:

1. Express:
2. Mongoose:
3. MongoDB
4. Passport:
5. Twitter Node Client
6. Watson Developer Cloud - Tone Analyzer
7. Spotify Web Api Node

## Presentation:


<a href="https://github.com/nikhil-isaac/mood/blob/master/assets/IBMHackChallenge%20-%20Mood.pdf">Click Here</a>

## Video:


<a href="https://drive.google.com/file/d/1-FB8h1NhCUbaei1eNabLwSmAOkULOcji/view?usp=sharing">Click Here</a>

 ## Document:
 
 <a href="https://github.com/nikhil-isaac/mood/blob/master/assets/Mood-Document.docx">Click Here</a>
