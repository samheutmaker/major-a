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
trackingSchema.methods.createNew = function(resourceId, resourceType) {
  this.owner_id = resourceId;
  this.type = resourceType;
  this.createdOn = new Date();
  this.numberOfTimesViewed = 0;
  this.save((err, data) => {
  })
};

// Track resource
trackingSchema.methods.track = function(userId) {
  this.numberOfTimesViewed++;
  this.lastViewed = new Date();
  this.lastViewedBy = userId;
  this.viewedBy.push(userId.toString());
  this.save((err, data) => {
  });
}

module.exports = exports = mongoose.model('TrackResource', trackingSchema);
