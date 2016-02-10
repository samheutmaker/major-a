# major-a

Simple user authentication and tracking middleware for Connect/Express.

[The GitHub docs are much better](https://github.com/samheutmaker/major-a/blob/master/README.md)

Major-A is user athentication/authorization, admin, and tracking middleware all rolled into one. It uses bcrypt to hash passwords and JSON web tokens for user authentication. It tracks user activities per session, with a new session beginning every time a user that has been inactive for 5 minutes makes a request. In addition to sessions, Major-A keeps an easily-interpretable running log of every users activity.


NOTE:  **MajorAnalytics can now also track resources that you have defined.** For more information on resource tracking, see [Tracking Resources](#trackingResources)


###Table of Contents



1. [Getting Started](#gettingStarted)
2. [Major Router](#majorRouter)
  * [Register](#register)
  * [Login](#login)
  * [Tracking](#tracking)
3. [Major Auth](#majorAuth)
  * [Optional Parameter](#optional)
4. [Major Admin](#majorAdmin)
  * [major.json](#majorJson)
5. [Major Analytics](#majorAnalytics)
  * [Overview Tracking](#overviewTracking)
  * [Session Tracking](#sessionTracking)
  * [Accessing User Tracking Data](#accessTracking)
  * [Tracking Resources](#trackingResources)
  * [Tracking resource with anonymous users](#withoutAuth)
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
const mTracking = majorA.majorAnalytics;

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
const mTracking = majorA.majorAnalytics;
```
<a name="majorRouter"></a>
##**MajorRouter**

MajorRouter contains three routes: one for registering a new user, one for logging in an existing user, and one that requires admin privileges and returns the tracking profile of the specified user.

###Routes
<a name="register"></a>
####/register

The `/register` route supports the `POST` HTTP verb and is used to register new users. Registration requires as email and a password. Data must be passed as JSON in the body of the request in an object whose key is 'authentication' like so:

```.json
{
"authentication": {
  "email" : "example@example.com",
  "password" : "example"
  }
}
```
This route creates a new user in the database and returns an authorization token in an object. The token is accessible through the 'token' key. This token should be saved on the client side and sent in the header of every request as the value of the key 'token'. This token represents the users credentials and is valid as long as the user has made a request in the last five minutes. Once the token has been invalidated, the user will have to sign back in.

<a name="login"></a>
####/login

The `/login` route supports the `GET` HTTP verb and is used for logging in existing users. The email and password of the user must sent as a Base64 encoded string in the header of the request using Basic HTTP. The email and password MUST be separated by a colon BEFORE being encoded and the word 'Basic' with a space after it should prepend the encoded string. The following is an example of preparing a username and password for logging in.
```.js
// user email and password
var email = 'example@example.com';
var password = 'password';
// Concatenate username and password, separated with a colon
var authString = email + ':' + password;
// Encode string in Base64
authString = btoa(authString);

// This is the final string that should be included in the header
var finalAuthString = 'Basic ' + authString;
```
This route returns an authorization token in an object. The token is accessible through the 'token' key. This token should be saved on the client side and sent in the headers of every request as the value of the key 'token'. This token represents the users credentials and is valid as long as the user has made a request in the last five minutes. Once the token has been invalidated, the user will have to sign back in.

<a name="tracking"></a>
####/tracking/:id
The `/tracking/:id` route supports the `GET` HTTP verb and requires administrator privileges to access. The route returns the tracking information of the user whose _id corresponds to `:id` in the route.
An example AJAX request to this point that will return the tracking info for a user with an _id of `12345678910` looks like this:
```.js

$.ajax.get('http://localhost:8888/tracking/12345678910', function(data) {
 // Log tracking data
 console.log(data);
});
````

<a name="majorAuth"></a>
##**MajorAuth**

The majorAuth middleware is used to grant or deny access to protected routes based on whether or not the user has an authorization token. mAuth is a function that must called in your middlware stack. It takes an optional paramater to allows non logged-in user to access the path, but this is primarily for [resource tracking](#trackResources). Protecting a route is as easy as including majorAuth in your route middleware:

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
app.post('/someprotetedroute', mAuth(), (req, res) {
  // This will only run if the request the passes the authentication check
  // the user object is accessible through req.user
  // Do protected stuff here
})
```

If the user making the request does not have an authorization token, a 401 Unauthorized will be returned and no further middleware will be executed.

NOTE: If you are not using majorAnalytics resource tracking, you can skip the next sections

<a name="optional"></a>

###mAuth Optional Parameter
MajorAuth takes an optional boolean parameter, like `mAuth(true)` or `mAuth(false)`. This optional value only needs to be included on routes that retreive resources. A `true` value will allows users that are not logged in to still access the resource, the analytics for the resource they access are just measured differently.

For more info about resource tracking, see [Resource Tracking](#trackResources).

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

The majorAdmin middleware is used to grant or deny access to administrator routes based on whether or not the users email matches any of the in the major.json``` file. Making a route only accessible to administrators is as easy as:

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
app.post('/someprotetedroute', mAdmin, (req, res) {
  // This will only run if the request the passes the authentication check
  // the user object is accessible through req.user
  // Do protected stuff here
})
```

If the user making the request does not have administrator privileges, a 401 Unauthorized will be returned and no further middleware will be executed.

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
####Accessing user tracking information through API
A user with administrator privileges can access the tracking information of any user through the `/tracking/:id` route in the majorRouter package where `:id` is the id of the user whose data you wish to receive. For more information about the majorRouter tracking route see [Tracking](#tracking)

<a name="trackingResources"></a>
####Resource Tracking

**NOTE: Resource tracking by default only works for resources whose access routes require mAuth or mAdmin. To use resource tracking on routes that do not require mAdmin or mAuth, see [Using resource tracking without mAuth or mAdmin](#withoutAuth)**


MajorAnalytics provides an API for tracking resources. Resources can be anything that has a mongoose model and is stored in a MongoDB Instance. Upon the creation of a new resource document, you must pass the _id of the document and the type of resource as a string to the `majorAnalytics.createTracker` function like so:
```.js
const express = require('express');
// Require Json Parser to handle POST
const jsonParser = require('body-parser').json();
// Require Event model
const Event = require(__dirname + '/../models/event.js');
// Require MajorA
const majorA = require('major-a');
// Require MajorA Analytics
const mTracking = majorA.majorAnalytics;
// Require MajorA Auth
const mAuth = majorA.majorAuth;
// Require MajorA Admin
const mAdmin = majorA.majorAdmin;


// Create new Express Router and export
const eventRouter = module.exports = exports = express.Router();

//Create new event
eventRouter.post('/new', mAdmin, jsonParser, (req, res) => {
	// Create new event
	var newEvent = new Event(req.body);
	// Save params
	newEvent.name = req.body.name;
	newEvent.description = req.body.description;
	newEvent.date = req.body.date;
	newEvent.postedOn = new Date();
	newEvent.owner_id = req.user._id;
	// Save new event
	newEvent.save((err, event) => {
		// Error or no data
		if(err || !event) {
			return res.status(500).json({
				msg: 'Error creating event'
			});
		}
		// Create New Tracker
		mTracking.createTracker(event._id, 'event');
		// Return new event data
		res.status(200).json({
			msg: 'Successfully Created',
			event: event
		});
	})
});
```
In this example, `event._id` is passed the first parameter and the string `event` is passed as the second. The `Event` model is separate from MajorA and has been required in from `/../models/event.js`. This will create a new tracking document and store it in the `trackresources` collection of your Mongo instance.

After the document has been created, you must track every request made to the document. Pass the `._id` of the event requested and the `_id` of the user making the request to the `majorAnalytics.track` function. Here is an example of tracking an event resource when a user makes a request for it.

```.js
const express = require('express');
// Require Json Parser to handle POST
const jsonParser = require('body-parser').json();
// Require Event model
const Event = require(__dirname + '/../models/event.js');
// Require MajorA
const majorA = require('major-a');
// Require MajorA Analytics
const mTracking = majorA.majorAnalytics;
// Require MajorA Auth
const mAuth = majorA.majorAuth;
// Require MajorA Admin
const mAdmin = majorA.majorAdmin;


// Create new Express Router and export
const eventRouter = module.exports = exports = express.Router();

// Get single event
eventRouter.get('/detail/:id', mAuth(), (req, res) => {
	// Find event
	Event.findOne({_id: req.params.id}, (err, event) => {
		// Err finding event
		if(err) {
			return res.status(500).json({
				msg: 'There was an error retrieving'
			});
		}
		// No Event found
		if(!event) {
			return res.status(200).json({
				msg: 'No event found'
			});
		}

		// Track request
		 mTracking.track(event._id, req.user._id);
		 // Return event
		 res.status(200).json({
		 	event: event
		 });
	});
})
```
We pass `event._id` and `req.user._id` to `mTracking.track` to record the request. `mTrack` updated the resource tracking document modifies the event document whose `_id` corresponds to the `event._id` that we passed as the first parameter.
<a name="withoutAuth"></a>
#####Using resource tracking without mAuth or mAdmin

In order to use resource tracking on routes that do not require authorization, you must still include `mAuth` and pass a `true` parameter to `mAuth`. This will allow non-logged in users to the access the path, the analytics will just be measured differently.

For more information about mAuth, see [majorAuth](#majorAuth)

<a name="contributors"></a>
###Contributors
####samheutmaker@gmail.com  
