# major-a

Simple user authentication and tracking middleware for Connect/Express.

Major-A is user athentication/authorization, admin, and tracking middleware all rolled into one. It uses bcrypt to hash passwords and JSON web tokens for user authentication. It tracks user actvities per session, with a new session beginning everytime a user that has been inactive for 5 minutes makes a request. In addition to sessions, Major-A keeps an easily-interpretable running log of every users activity. 
###Table of Contents



1. [Getting Started](#gettingStarted)
2. [Major Router](#majorRouter)
  * [Register](#register)
  * [Login](#login)
  * [Tracking](#tracking) 
3. [Major Auth](#majorAuth)
4. [Major Admin](#majorAdmin)
  * [major.json](#majorJson)
5. [Major Analytics](#majorAnalytics)
  * [Overview Tracking](#overviewTracking)
  * [Session Tracking](#sessionTracking)
  * [Accessing Tracking Data](#accessTracking)
6. [Contributors](#contributors)


<a name="gettingStarted"></a>
###Getting Started:
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
<a name="majorRouter"></a>
##**MajorRouter**

MajorRouter contains three routes: one for registering a new user, one for logging in an existing user, and one that requires admin privilages and returns the tracking profile of the specified user.

###Routes
<a name="register"></a>
####/register

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

<a name="login"></a>
####/login

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

<a name="majorAuth"></a>
##**MajorAuth**

The majorAuth middleware is used to grant or deny access to protected routes based on whether or not the user has an authorization token. Protecting a route is as easy as including majorAuth in your route middleware:

###Getting Started:
NOTE: majorAuth should always be the first middle registered. DO NOT INCLUDE BOTH majorAdmin and majorAuth as middleware for the same route. majorAdmin takes care of checkin the token. Including both majorAdmin and majorAuth would result in a two token checks which can screw up the tracking package. 
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
```

If the user making the request does not have an authorization token, a 401 Unauthorized will be returned and no further middleware will be executed.

<a name="majorAdmin"></a>
##**MajorAdmin**

###Getting Started
Major-A supports authentication for administrators through the use of a major.json file placed in the root directory of your project. You can add administrators to your project placing their email address in an array with the key ```administrators```.

<a name="majorJson"></a>
######major.json
```.json
{
  "administrators" : [ "admin@exmaple.com", "admin2@exmaple.com"]
}
```

The majorAdmin middleware is used to grant or deny access to administrator routes based on whether or not the users email matches any of the in the major.json``` file. Making a route only accessable to administrators is as easy as:

NOTE: majorAdmin should always be the first middle registered. DO NOT INCLUDE BOTH majorAdmin and majorAuth as middleware for the same route. majorAdmin takes care of checkin the token. Including both majorAdmin and majorAuth would result in a two token checks which can screw up the tracking package. 
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
```

If the user making the request does not have administator privilages, a 401 Unauthorized will be returned and no further middleware will be executed.

<a name="majorAnalytics"></a>
##**majorAnalytics**

###Getting Started

MajorAnalytics is Major-A's built in analytics package. It will automatically create a `useranalytics` collection in your database and store records in it. It is broken into two parts: overview and sessions. All sessions belong to an overview and all overviews have exactly one owner, which is the user whose information the overview contains. A new session begins when the user logs in, and end after the user has not made a request for 5 minutes. The logout time for the session is then recorded as the time of the last request made during the session. MajorAnalytics tracks every request made by all LOGGED IN users and generates the following information for each user.

<a name="overviewTracking"></a>
######The overview contains:

Record | As 
--- | --- 
The date/time the user joined | `Date` 
How many time the user has logged in | `Number` 
The total number of requests made by the user | `Number` 
The complete amount of time spent active by user | `Time, milliseconds` 
The date/time of the users most recent request | `Date` 

<a name="sessionTracking"></a>
######Each session contains
Record | As 
--- | --- 
The date/time the beginning of this session | `Date` 
The date/time of the last request made during this session | `Number` 
The number of requests made by the user during this session | `Number` 
The duration of this session | `Time, milliseconds` 

This information is stored in the user 

MajorAnalytics currently only supports tracking for logged in users. If someone submits an issue requesting tracking for non logged in users, I will make it a priority to add it. 

<a name="accessTracking"></a>
####Accessing tracking information through api
A user with administrator privelages can access the tracking information of any user through the `/tracking/:id` route in the majorRouter package where `:id` is the id of the user whose data you wish to recieve

<a name="contributors"></a>
###Contributors
####samheutmaker@gmail.com  


