// Set ENV vars
process.env.MONGO_URL = 'string';
process.env.PORT = 8888;
// Require testing software
var chai = require('chai');
var expect = chai.expect;
var chaiHTTP = require('chai-http');
chai.use(chaiHTTP);
// Set Params
var baseURI = 'localhost:8888'
var userId, token;
// Require Test Server
const server = require(__dirname + '/test-server.js');
// Require Router to Test
const mRouter = require(__dirname + '/../index').majorRouter;
// Require Model
const User = require(__dirname + '/../models/user');
const UserAnalytics = require(__dirname + '/../models/user-analytics');

describe('The MajorRouter', () => {
  // Remove all users and analytics from database
  after(() => {
    User.remove({}, (err, data) => {
      if(err) return console.log('There was an error removing all users');

      return console.log('All users removed');
    });
    UserAnalytics.remove({}, (err, data) =>{
      if(err) return console.log('There was an error removing all users');

      return console.log('All tracking removed');
    })
  });

  it('should create a new user and new user analytics with a POST request to /register', (done) => {
    chai.request(baseURI)
    .post('/major/register')
    .send({
      "authentication": {
        "email": "testuser2@test.com",
        "password": "testpassword"
      }
    }).end((err, res) => {
      // Check for user document
      expect(err).to.eql(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      // Check for tracking document
      UserAnalytics.findOne({
        owner_id: res.body.user._id
      }, (err, data) => {
        expect(err).to.eql(null);
        expect(data).to.have.property('joinedOn');
        expect(data.sessions.length).to.eql(1);
        done();
      });
    });
  });
  // Add User to Db
  describe('Requests that require a user in the db', (done) => {
    beforeEach((done) => {
      var newUser = new User();
      newUser.authentication.email = 'sam@gmail.com';
      newUser.hashPassword('password');
      newUser.save((err, data) => {
        userToken = data.generateToken();
        userId = data._id;
        done();
      });
  });
  // Login Route
  it('should return a token and start a new session with a GET request to /login', (done) => {
    chai.request(baseURI)
    .get('/major/login')
    .auth('sam@gmail.com', 'password')
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      done();
    });
  });
});

});
