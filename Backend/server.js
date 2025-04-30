const express = require('express');
const app = express();
const path = require('path');
const cron = require('./services/cronService');
const cors = require('cors');
const request = require('request');
const PORT =  3000;
app.use(express.json());
app.use(express.static('public'));


const connectDB = require('./config/db');
connectDB();

// cors
app.use(cors());

app.get('/api/files', (req, res) => {
  request(
    { url: 'https://innshare.herokuapp.com/api/files' },
    (error, response, body) => {
      res.send(body);
    }
  );
});

//template engine:
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');


//Routes:
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'))
app.use('/files/download', require('./routes/download'));
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})
