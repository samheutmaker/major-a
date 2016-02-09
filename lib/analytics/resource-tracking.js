const ResourceAnalytics = require(__dirname +
  '/../../models/resource-analytics');
const handleDbSaveError = require(__dirname + '/../errors/handle-db-save-error');


// Creates and readies a new resource tracker document -- SEE models/resource-analytics.js
var createNewTracker = function(resourceId, resourceType) {
  // New Tracker
  var newTracker = new ResourceAnalytics();
  // Call constructor
  newTracker.createNew(resourceId, resourceType);
  // Save
  newTracker.save((err, newTracker) => {
    if (err) handleDbSaveError(err);
  });
};

// Tracks a resource -- SEE models/resource-analytics.js
var trackResource = function(resourceId, userId) {
  ResourceAnalytics.findOne({
    owner_id: resourceId
  }, (err, resourceTracker) => {
    if (err || !resourceTracker) return handleDbSaveError(err);
    resourceTracker.trackLoggedIn(userId);
  });
};

var trackAnon = function(resourceId) {
  ResourceAnalytics.findOne({
    owner_id: resourceId
  }, (err, resourceTracker) => {
    if (err || !resourceTracker) return handleDbSaveError(err);
    resourceTracker.trackAnon();
  });
}


module.exports = exports = {
  createTracker: createNewTracker,
  trackLoggedIn: trackResource,
  trackAnon: trackAnon
};
