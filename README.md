# major-a

Simple user authentication and tracking middleware for Connect/Express.

Major-A is user athentication/athorization, admin, and tracking middleware all rolled into one. It uses bcrypt to hash passwords and JSON web tokens for user authorization. It tracks user actvities per session, with a new session beginning everytime a user that has been inactive for 5 minutes makes a request. In addition to sessions, Major-A keeps an easily-interpretable running log of every users activity. See Tracking and Sessions for more info on tracking and sessions. See Administration for info on setting up admin.

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
NOTE: You must connect to your MongoDB before you require Major-A
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

**MajorRouter**

MajorRouter contains three routes: one for registering a new user, one for logging in an existing user, and one that requires admin privilages and returns the tracking profile of the specified user.

