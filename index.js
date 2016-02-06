const express = require('express');
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');
const basicHTTP = require(__dirname + '/lib/basic-http');
const authCheck = require(__dirname + '/lib/check-token');

// Models
const User = require(__dirname + '/models/user');
const UserAnalytics = require(__dirname + '/models/user-analytics');

// Tracking
const userTracking = require(__dirname + '/lib/analytics/user-tracking');

// Create Router
var authRouter = module.exports = exports = express.Router();


//========== ROUTES ==========// 


// See analytics for signed in user
authRouter.get('/tracking', authCheck, (req, res) => {
  UserAnalytics.find({
    owner_id: res.user._id
  }, (err, data) => {
    res.json(data);
  })
});


// Create new User
authRouter.post('/register', jsonParser, (req, res) => {
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
authRouter.get('/login', basicHTTP, (req, res) => {
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