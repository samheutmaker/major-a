const express = require('express');
const mongoose = require('mongoose');

// Create Express App
const app = express();
// Set PORT
const PORT = process.env.port || 8888;
// Connect to DB
mongoose.connect(
  'mongodb://samheutmaker:kingpin13@apollo.modulusmongo.net:27017/yvuxe4vU');
// Require majorA router
const majorA = require(__dirname + '/index').majorARouter;
const authCheck = require(__dirname + '/index').majorAAuth;
// Set Major A Routes
app.use('/auth', majorA);
// Start Server
app.get('/hit', authCheck, (req, res) => {
  res.json(req.user);
});

app.listen(PORT, () => {
  console.log('Live on PORT ' + PORT);
});
