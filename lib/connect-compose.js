
// For combining middleware. Takes an array of functions as a parameter
const compose = module.exports = exports = function combineMiddleware(mids) {
  return mids.reduce(function(a, b) {
    return function(req, res, next) {
      a(req, res, function(err) {
        if (err) {
          return next(err);
        }
        b(req, res, next);
      });
    };
  });
}
