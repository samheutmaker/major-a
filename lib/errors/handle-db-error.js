module.exports = exports = function(err, res) {
  return res.status(500).json({
    msg: 'There was a DB Error',
    err: err
  });
};
