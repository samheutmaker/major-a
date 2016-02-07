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
const mRouter = require(__dirname + '/index').majorRouter;
const mAuth = require(__dirname + '/index').majorAuth;
const mAdmin = require(__dirname + '/index').majorAdmin;
// Set Major A Routes
app.use('/auth', mRouter);

// Start Server
app.listen(PORT, () => {
  console.log('Live on PORT ' + PORT);
});
