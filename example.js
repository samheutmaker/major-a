// This server is for example purposes only
// Major A should be run from the node_modules folder
const express = require('express');
const mongoose = require('mongoose');

// Create Express App
const app = express();
// Set PORT
const PORT = process.env.port || 8888;
// Connect to DB
mongoose.connect(
  'YOUR_MONGO_DB_STRING');
// Require majorA router
const majorA = require(__dirname + '/index').majorARouter;
const authCheck = require(__dirname + '/index').majorAAuth;
const adminCheck = require(__dirname + '/index').majorAAdmin;
// Set Major A Routes
app.use('/auth', majorA);
// Start Server
app.get('/hit', adminCheck, (req, res) => {
  res.json(req.user);
});

app.listen(PORT, () => {
  console.log('Live on PORT ' + PORT);
});
