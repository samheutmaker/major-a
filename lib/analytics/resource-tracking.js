
const ResourceAnalytics = require(__dirname + '/../../models/resource-analytics');
const handleDbSaveError = require(__dirname + '/../handle-db-save-error');


// Creates and readies a new resource tracker document -- SEE models/resource-analytics.js
var createNewTracker = function(resourceId, resourceType) {
  // New Tracker
  var newTracker = new ResourceAnalytics();
  // Call constructor
  newTracker.createNew(resourceId, resourceType);
  // Save
  newTracker.save((err, newTracker) => {
    if(err) handleDbSaveError(err);
  });
};

// Tracks a resource -- SEE models/resource-analytics.js
var trackResource = function(resourceId, userId) {
  ResourceAnalytics.findOne({id: resourceId}, (err, resourceTracker) => {
    if(err || !resourceTracker) handleDbSaveError(err);
    resourceTracker.track(userId);
  });
};


module.exports = exports = {
  createTracker: createNewTracker,
  track: trackResource
};
