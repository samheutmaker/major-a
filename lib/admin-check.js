var authCheck = require(__dirname + '/check-token');
var compose = require(__dirname + '/connect-compose');


module.exports = exports = function(adminList) {
  return function() {
    // Check if user is an admin
    const adminCheck = function(req, res, next) {
      // Track is the user is on the admin list
      var isAdmin = false;
      // Compare admin list to req.user
      adminList.forEach(function(currentUser, userIndex) {
        if (req.user.authentication.email === currentUser) {
          isAdmin = true;
        }
      });
      // If the user is admin, call the next middleware
      if (isAdmin) {
        next();
      } else {
        // Otherwise return error
        return res.status(401).json({
          msg: 'Error Authenticating'
        })
      }
    };
    // Exports composed authCheck and adminCheck
    return compose([authCheck(), adminCheck]);

  }
}
