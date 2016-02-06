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
const majorA = require(__dirname + '/index');
// Set Major A Routes
app.use('/auth', majorA);
// Start Server
app.listen(PORT, () => {
  console.log('Live on PORT ' + PORT);
});
