 var express = require('express');
 var app = express(); // create our app w/ express
 var morgan = require('morgan'); // log requests to the console (express4)
 var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
 var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
 var pg = require('pg');
 var cors = require('cors');


app.use(cors());

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

app.get('/clientes', function (request, response) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		client.query('SELECT * FROM Cliente', function(err, result) {
			done();
			if (err){ 
				console.error(err); response.send("Error " + err);
				response.status(400).end(); 
			}else{ 
				//response.render('pages/db', {results: result.rows} ); 
				response.contentType('application/json');
                response.send(JSON.stringify(result.rows));
                response.status(200).end();
			}
		});
	});
});

app.get('/comidas', function (request, response) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		client.query('SELECT * FROM Comida join (SELECT nom_restaurante FROM Restaurante where id_usuario=id_restaurante)', function(err, result) {
			done();
			if (err){ 
				console.error(err); response.send("Error " + err);
				response.status(400).end(); 
			}else{ 
				//response.render('pages/db', {results: result.rows} ); 
				response.contentType('application/json');
                response.send(JSON.stringify(result.rows));
                response.status(200).end();
			}
		});
	});
});

