const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');

var breeds = require('./routes/breeds'); 
var routes = require('./routes');
var app = express();

app.set('port', process.env.PORT || 4000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get('/breeds', breeds.list);
//app.get('/breeds/add', breeds.add);
app.post('/breeds/add', breeds.save);
app.get('/breeds/delete/:id', breeds.delete);
app.delete('/breeds/delete/:id', breeds.delete);
app.get('/breeds/edit/:id', breeds.edit);
app.post('/breeds/edit/:id', breeds.update);

app.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});