const express = require('express');
const app = express();
const mongoose = require('mongoose');
//Connect to Mongo Instance
mongoose.connect(process.env.MONGO_URL)
// Require majorRouter
const majorRouter = require(__dirname + '/../index').majorRouter;

// Mount Router and listen
app.use('/major', majorRouter).listen(process.env.PORT, () => {
  console.log('Test server live on ' + process.env.PORT);
});
