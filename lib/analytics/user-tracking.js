
// Bring in user analytics model
const UserAnalytics = require(__dirname + '/../../models/user-analytics');


// Creates a new tracking object -- SEE models/user-analytics.js
var createNew = function(id){
  newUserTracker = new UserAnalytics();
  newUserTracker.firstLogin(id);
  newUserTracker.save((err, userTracker) => {
    if(err) return console.log(err);
  });
};

// Tracks user activity -- SEE models/user-analytics.js
var everyLogin = function(id){
  UserAnalytics.findOne({owner_id: id}, (err, userTrackingData) => {
    if(err) return console.log(err);
    userTrackingData.everyLogin();
  });
};

var everyRequest = function(id){
  UserAnalytics.findOne({owner_id: id}, (err, userTrackingData) => {
    if(err) return console.log(err);
    if(!err && !userTrackingData) console.log('Neither');
    userTrackingData.everyRequest();
  });
}

// Ends user active session -- SEE models/user-analytics.js
var endSession = function(id) {
  UserAnalytics.findOne({owner_id: id}, (err, userTrackingData) => {
    if(err) return console.log(err);
    userTrackingData.endSession();
  });
};

module.exports = exports = {
  createNew: createNew,
  everyLogin: everyLogin,
  endSession: endSession,
  everyRequest: everyRequest
};
