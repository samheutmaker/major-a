const mongoose = require('mongoose');

// How long tokens are good for
const jwtExpiration = 300000;

// The detail of each active session per user
var sessionSchema = mongoose.Schema({
  owner_id: String, // The id of whose session this is
  timeLoggedIn: Date, // Time Token Generated
  timeLoggedOut: Date, // Time of last request
  totalTimeActive: Number, // Number of seconds active
  numberOfRequestsMade: Number,
  sessionIsActive: Boolean
});

// Create Session model
var sessionModel = mongoose.model('SessionModel', sessionSchema);

// Overview of user interaction
var userAnalyticsSchema = mongoose.Schema({
  owner_id: String, // The id of the owner
  joinedOn: Date, // The date joined
  numberOfTimesLoggedIn: Number, // The total number of times logged in
  numberOfRequestsMade: Number, // The total number of requests made
  completeTimeSpentActive: Number, // The total amount of time spent with valid token
  currentSessionId: String, // Id of the current session
  timeOfLastRequest: Date, // The time of the last request
  sessions: [sessionSchema]
});

// For first login
userAnalyticsSchema.methods.firstLogin = function(id) {
  this.owner_id = id;
  this.joinedOn = new Date();
  this.numberOfTimesLoggedIn = 0;
  this.completeTimeSpentActive = 0;
  this.numberOfRequestsMade = 1;
  this.timeOfLastRequest = new Date();
  this.save();
  this.startNewSession();
  this.everyLogin();
};
// For each login
userAnalyticsSchema.methods.everyLogin = function() {
  this.numberOfTimesLoggedIn++;
  this.save();
  this.everyRequest();
};

// For Every Request Made
userAnalyticsSchema.methods.everyRequest = function() {
  var currentTime = new Date();
  // Check time since last request
  var timeSince = Date.parse(currentTime) - Date.parse(this.timeOfLastRequest);
  // More than 5 minutes
  if (timeSince > jwtExpiration) {
    // End Session
    this.endSession(this.timeOfLastRequest);
  } else {
    // Iterate through all the sessions
    this.sessions.forEach((currentSession, sessionIndex) => {
      if (currentSession.sessionIsActive && currentSession._id == this.currentSessionId) {
        // Add this request to total for session
        currentSession.numberOfRequestsMade++;
      }
    });
  }
  // Set the time of the last request to the current time
  this.timeOfLastRequest = currentTime;
  // Add this request to total
  this.numberOfRequestsMade++;
  // Save Changes
  this.save();
};

// Start start a new session
userAnalyticsSchema.methods.startNewSession = function() {
  console.log('New Session Started');

  // Create new session document
  var newSession = {
      owner_id: this.owner_id,
      timeLoggedIn: new Date(),
      numberOfRequestsMade: 1,
      sessionIsActive: true
    }
    // Save Changes
  this.sessions.push(new sessionModel(newSession));
  // Store new session id for later reference
  this.currentSessionId = this.sessions[this.sessions.length - 1]._id;
};

// End an existing session
userAnalyticsSchema.methods.endSession = function(timeOfLastRequest) {
  console.log('Session Ended');
  // Iterate through each session
  this.sessions.forEach((currentSession, sessionIndex) => {
    // If the session is active and the Ids match
    if (currentSession.sessionIsActive) {
      // End the session
      currentSession.sessionIsActive = false;
      // Set time of the last request
      currentSession.timeLoggedOut = timeOfLastRequest;
      // Set the total time active
      currentSession.totalTimeActive = Date.parse(currentSession.timeLoggedOut) -
        Date.parse(currentSession.timeLoggedIn);
      // This this sessions duration to the total for the user
      this.completeTimeSpentActive += currentSession.totalTimeActive;
      // Begin a new Session
      this.startNewSession();
      // Save Changes
      this.save();
    }
  });
};

// Exports Model
module.exports = exports = mongoose.model('UserAnalytics',
  userAnalyticsSchema);
