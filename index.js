 var express = require('express');
 var app = express(); // create our app w/ express
 var morgan = require('morgan'); // log requests to the console (express4)
 var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
 var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

 app.use(bodyParser.json());
 app.use(express.static(__dirname + "/public"));

app.set('port', (process.env.PORT || 5000));



app.get('/', function(request, response) {
	response.contentType('application/json');
    response.send(JSON.stringify("{titulo:'prueba'}"));
    response.status(200).end();
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


