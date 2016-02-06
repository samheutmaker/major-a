# major-a

Simple user authentication and tracking middleware for Connect/Express.

Major-A is user athentication/authorization, admin, and tracking middleware all rolled into one. It uses bcrypt to hash passwords and JSON web tokens for user authentication. It tracks user actvities per session, with a new session beginning everytime a user that has been inactive for 5 minutes makes a request. In addition to sessions, Major-A keeps an easily-interpretable running log of every users activity. See Tracking and Sessions for more info on tracking and sessions. See Administration for info on setting up admin.

Getting Started:
```
$ npm install --save major-a
```

```.js
const m = require('major-a');

// Create majorA Utilities
const mRouter  = m.majorRouter;
const mAuth   = m.majorAuth;
const mAdmin  = m.majorAdmin; 
```
NOTE: You must connect to your MongoDB instance before you require Major-A
```.js
// Require mongoose
const mongoose = require('mongoose');
// Connect to MONGO DB
mongoose.connect('YOUR_MONGO_DB_STRING');

// Now you can require Major-A
const m = require('major-a');

// Create majorA Utilities
const mRouter  = m.majorRouter;
const mAuth   = m.majorAuth;
const mAdmin  = m.majorAdmin; 
```

***MajorRouter***

MajorRouter contains three routes: one for registering a new user, one for logging in an existing user, and one that requires admin privilages and returns the tracking profile of the specified user.

**/register**

The /register route is used to register new users. Registration requires as email and a password. Data must be passed as JSON in the body of the request in an object whose key is 'authentication' like so:

```.json
{
"authentication": {
  "email" : "example@example.com",
  "password" : "exmaple"
  }
}
```
This route creates a new user in the database and returns an authorization token in an object. The token is accessible through the 'token' key. This token should be saved on the client side and sent in the header of every request as the value of the key 'token'. This token represents the users credentials and is valid as long as the user has made a request in the last five minutes. Once the token has been invalidated, the user will have to sign back in. 


**/login**

The /login route is used for logging in existing users. The email and password of the user must sent as a Base64 encoded string in the header of the request using Basic HTTP. The email and password MUST be seperated by a colon BEFORE being encoded and the word 'Basic' with a space after it should preprend the encoded string. The following is an exmaple of preparing a username and password for logging in.
```.js
// user email and password
var email = 'example@example.com';
var password = 'password';
// Concatenate username and password, seperated with a colon
var authString = email + ':' + password;
// Encode string in Base64
authString = btoa(authString);

// This is the final string that should be included in the header
var finalAuthString = 'Basic ' + authString; 
```
This route returns an authorization token in an object. The token is accessible through the 'token' key. This token should be saved on the client side and sent in the headers of every request as the value of the key 'token'. This token represents the users credentials and is valid as long as the user has made a request in the last five minutes. Once the token has been invalidated, the user will have to sign back in. 

***MajorAuth***

The majorAuth middleware is used to grant or deny access to protected routes based on whether or not the user has an authorization token. Protecting a route is as easy as including mAuth in your route middleware:

```.js

const express = require('express');
const mongoose = require('mongoose');
// Create express app
const app = express();
// Connect to MONGO DB
mongoose.connect('YOUR_MONGO_DB_STRING');
// require Major-A
const m = require('major-a');
// Create majorA Utilities
const mRouter  = m.majorRouter;
const mAuth   = m.majorAuth;
const mAdmin  = m.majorAdmin; 

// Protected Route
app.post('/someprotetedroute', mAuth, (req, res) {
  // This will only run if the request the passes the authentication check
  // the user object is accessible through req.user
  // Do protected stuff here
})


