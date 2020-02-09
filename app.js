const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors')

var breeds = require('./routes/breeds'); 
var app = express();
app.use(cors())
 

app.set('port', process.env.PORT || 4000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/breeds', breeds.list);
app.post('/breeds/add', breeds.add);
app.get('/breeds/feedData', breeds.feedData);


app.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});