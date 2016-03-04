// For Logging
const colors = require('colors');
const logNote = 'MAJOR-A -- '.white;

// Get Admin Settings
const fs = require('fs');
try {
  const settings = fs.readFileSync(__dirname + '/../../major.json').toString();
  var adminList = JSON.parse(settings).admin;

  if (!Array.isArray(adminList) || adminList.length === 0) {
    console.log(logNote + 'NO ADMINISTATORS SET'.red);
  } else {
    adminList.forEach(function(currentAdmin, adminIndex) {
      console.log(logNote + (currentAdmin + ' added to admin list').green);
    })
  }
} catch (e) {
  console.log(logNote + 'COUNLD NOT FIND MAJOR.JSON, NO ADMINISTATORS SET'.red);
  var adminList = [];
}

// Get Dependencies
const express = require('express');
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');
const basicHTTP = require(__dirname + '/lib/basic-http');
const authCheck = require(__dirname + '/lib/check-token');
const adminCheck = require(__dirname + '/lib/admin-check')(adminList);
const resourceTracking = require(__dirname + '/lib/analytics/resource-tracking');

// Models
const User = require(__dirname + '/models/user');
const UserAnalytics = require(__dirname + '/models/user-analytics');

// Tracking
const userTracking = require(__dirname + '/lib/analytics/user-tracking');

// Create Router
var majorA = module.exports = exports = express.Router();

module.exports = {
  majorRouter: majorA,
  majorAuth: authCheck,
  majorAdmin: adminCheck(),
  majorAnalytics: resourceTracking
};

//========== ROUTES ==========//

// Returns analytics for signed in user
majorA.get('/tracking/:id', adminCheck(), (req, res) => {
  if (!req.params.id) {
    req.params.id = req.user._id
  }
  UserAnalytics.find({
    owner_id: req.params.id
  }, (err, data) => {
    res.json(data);
  })
});


// Create new User
majorA.post('/register', jsonParser, (req, res) => {
  req.body.email = req.body.authentication.email;
  req.body.password = req.body.authentication.password;
  // Check email and password length
  if (!((req.body.email || "").length && (req.body.password || "").length >
      7)) {
    return res.status(400).json({
      msg: 'Email or password not long enough'
    })
  }
  // Check if user is already in database
  User.findOne({
    'authentication.email': req.body.email
  }, (err, user) => {
    // Check for DB Error
    if (err) {
      return res.status(500).json({
        msg: 'DB Error'
      })
    }
    // Check if user is populated (exists)
    if (user) {
      return res.status(500).json({
        msg: 'User already Exists'
      })
    }
    // Create new user
    var newUser = new User();
    newUser.authentication.email = req.body.email;
    newUser.hashPassword(req.body.password);
    newUser.birthday   = (req.body.birthday) ? Date.parse(req.body.birthday) : null;
    newUser.gender     = (req.body.gender) ? req.body.gender : null;
    newUser.username   = (req.body.username) ? req.body.username : null;
    newUser.name.first = (req.body.name.first) ? req.body.name.first : null;
    newUser.name.last  = (req.body.name.first) ? req.body.name.first : null;
    newUser.save((err, user) => {
      if (err || !user) {
        return res.status(500).json({
          msg: 'Error creating user'
        });
      }

      // Create analytics for new user
      userTracking.createNew(user._id);

      // Send Response
      res.status(200).json({
        token: user.generateToken(),
        user: user
      })
    });
  });
});


// User Login
majorA.get('/login', basicHTTP, (req, res) => {
  // Check DB for user
  User.findOne({
    'authentication.email': req.basicHTTP.email
  }, (err, user) => {
    // Check for error
    if (err) {
      return res.status(401).json({
        msg: 'Error finding user'
      })
    }
    // Check for null user
    if (!user) {
      return res.status(401).json({
        msg: 'User does not exist'
      })
    }
    // Compare user password
    if (!user.comparePassword(req.basicHTTP.password)) {
      return res.status(401).json({
        msg: 'Invalid username or password'
      })
    }
    // Track User Login
    userTracking.everyLogin(user._id);
    // Authenticate User, respond with token and user data
    res.status(200).json({
      user: user,
      token: user.generateToken()
    });

  })
});
