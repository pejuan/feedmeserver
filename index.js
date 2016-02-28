 var express = require('express');
 var app = express(); // create our app w/ express
 var morgan = require('morgan'); // log requests to the console (express4)
 var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
 var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
 var pg = require('pg');
 var cors = require('cors');

var corsOptions = {
  origin: 'https://feedmeclient.herokuapp.com/'
};

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

 app.get('/clientes', function(request, response) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         client.query('SELECT * FROM Cliente', function(err, result) {
             done();
             if (err) {
                 console.error(err);
                 response.send("Error " + err);
                 response.status(400).end();
             } else {
                 //response.render('pages/db', {results: result.rows} ); 
                 response.contentType('application/json');
                 response.send(JSON.stringify(result.rows));
                 response.status(200).end();
             }
         });
     });
 });

 app.get('/comidas', function(request, response) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         client.query('SELECT C.id_comida,C.nombre,C.precio,C.descripcion,C.categoria,C.foto,C.veces_ordenada,C.id_restaurante,R.nom_restaurante FROM Comida C join Restaurante R on C.id_restaurante=R.id_usuario', function(err, result) {
             done();
             if (err) {
                 console.error(err);
                 response.send("Error " + err);
                 response.status(400).end();
             } else {
                 //response.render('pages/db', {results: result.rows} ); 
                 response.contentType('application/json');
                 response.send(JSON.stringify(result.rows));
                 response.status(200).end();
             }
         });
     });
 });
 app.post('/order',cors() ,function(request, response) {

     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'INSERT INTO ', table: 'Orden', columns: ['id_cliente', 'id_restaurante','estado'] };

         sql.values = ['11341025', "\'"+request.body.idRestaurant+"\'","\'N\'"];
   		
         client.query(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")", function(err, result) {
             done();
             if (err) {
                 response.send("Error primer query" + err);
                 response.status(400).end();
             } else {
                console.log(result);
                 //response.render('pages/db', {results: result.rows} ); 
                 for (var j = 0; j < request.body.foods.length; j++) {
                     sql.values = ["\'"+response.body.id_orden+"\'", "\'"+request.body.foods[j].idFood +"\'"];
                     sql.columns = ["id_orden", "id_comida"];
                     sql.table = "Comida_pertenece_orden";
                     client.query(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")", function(err, result) {
                         done();
                         if (err) {
                            console.error(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")");
                             console.error(err);
                             response.send("Error segundo query" + err);
                             response.status(400).end();
                         } else {
                             //response.render('pages/db', {results: result.rows} ); 
                             response.contentType('application/json');
                             response.send(JSON.stringify(result.rows));
                             response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                             response.status(200).end();
                         }
                     });
                 }
             }

         });


     });
 });
