const mongoose = require('mongoose');
const _ = require('lodash');


const trackingSchema = mongoose.Schema({
  createdOn: Date,
  numberOfTimesViewed: Number,
  lastViewed: Date,
  lastViewedBy: String,
  viewedBy: Array,
  owner_id: String,
  type: String
});


// Create new resource tracker
trackingSchema.methods.createNewResouceTracker = function(resourceId, resourceType) {
  this.owner_id = id;
  this.type = resourceType;
  this.createdOn = new Date();
  this.numberOfTimesViewed = 0;
};

// Track resource
trackingSchema.methods.trackResource = function(userId) {
  this.numberOfTimesViewed++;
  this.lastViewed = new Date();
  this.lastViewedBy = userId;
  this.viewedBy.push(userId);
}

module.exports = exports = mongoose.model('TrackResource', trackingSchema);
