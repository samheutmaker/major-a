const User = require(__dirname + '/../models/user');
const jwt = require('jsonwebtoken');
const userTracking = require(__dirname + '/../lib/analytics/user-tracking');

module.exports = exports = function(req, res, next) {
  return function(pass) {

    var decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.TOKEN_SECRET ||
        'CHANGE_ME');
    } catch (e) {
      return res.status(400).json({
        msg: 'Error'
      });
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
      userTracking.everyRequest(req.user._id);
      next();
    });


  }
}
