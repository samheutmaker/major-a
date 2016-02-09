const User = require(__dirname + '/../models/user');
const jwt = require('jsonwebtoken');
const userTracking = require(__dirname + '/../lib/analytics/user-tracking');

module.exports = exports = function(pass) {
  return function(req, res, next) {

    var decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.TOKEN_SECRET ||
        'CHANGE_ME');
    } catch (e) {
      if (pass) {
        res.user = "Anonymous";
        next();
      } else {
        return res.status(400).json({
          msg: 'Error'
        });
      }
    }
    User.findOne({
      _id: decoded.id
    }, (err, user) => {
      if (err || (!user && !pass)) {
        return res.status(500).json({
          msg: 'Error'
        });
      }
      if (!user && pass) {
        req.user = "Anonymous";
      } else if (user) {
        req.user = user;
      }
      if (req.user._id) {
        userTracking.everyRequest(req.user._id);
      }
      next();
    });


  }
}
