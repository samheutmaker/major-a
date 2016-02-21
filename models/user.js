const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// User Model
var userSchema = mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  username: String,
  birthday: String,
  gender: String,
  authentication: {
    email: String,
    password: String
  }
});


// Hash user password
userSchema.methods.hashPassword = function(password) {
  this.authentication.password = bcrypt.hashSync(password, 8);
};
// Compare hashed passwords
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.authentication.password);
};
// Generate Token based on user id and the app secret
userSchema.methods.generateToken = function() {
  return jwt.sign({
    id: this._id
  }, process.env.TOKEN_SECRET || 'CHANGE_ME');
};

// Export user model
module.exports = exports = mongoose.model('User', userSchema);
