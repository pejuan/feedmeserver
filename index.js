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

app.options('/order', cors());

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
 app.get('/orders', function(request,response){
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         client.query('SELECT O.id_orden, O.id_cliente, O.id_restaurante, O.estado FROM Orden O', function(err, result){
            done();
            if (err){
               console.error(err);
               response.send(err);
               response.status(400).end();
            }else{
               response.contentType('application/json');
               response.send(JSON.stringify(result.rows));
               response.status(200).end();
            }
         });
     });
 });
 app.get('/comida_pertenece_orden', function(request,response){
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query('SELECT * FROM comida_pertenece_orden', function(err, result){
              done();
              if(err){
                console.error(err);
                response.send(err);
                response.status(400).end();
              }else{
                response.contentType('application/json');
                response.send(JSON.stringify(result.rows));
                response.status(200).end();
              }
            });
        });  
 });

 app.get('/comidas_cliente', function(request, response) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         client.query("SELECT C.nombre, C.precio,O.Tiempo, O.id_orden FROM Comida C join comida_pertenece_orden O on O.id_comida = C.id_comida",function(err, result){
           done();
           if(err){
             console.error(err);
             response.send("Error type " + err );
             response.status(400).end();
           }else{
             response.contentType('application/json');
             response.send(JSON.stringify(result.rows));
             response.status(200).end();
           }
         });
     });
 });
 app.post('/restaurante',function(request, response) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'INSERT INTO', table: 'Restaurante', columns: ['id_usuario', 'contrasena', 'nom_restaurante']}
         //var user = params[:id_usuario];
         //var pass = params[:contrasena];
         //var name = params[:nom_restaurante];
         client.query(sql.query + sql.table + " (" + sql.columns.join(',')+ ") "+ "VALUES ("+request.body.id_usuario+","+request.body.contrasena+","+request.body.nom_restaurante)
     });
 });
 
 
 
 app.post('/order',function(request, response) {

     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'INSERT INTO ', table: 'Orden', columns: ['id_orden', 'id_restaurante','estado','id_cliente'] };

         sql.values = ['DEFAULT', "\'"+request.body.idRestaurant+"\'","\'N\'","'xavier.munguia@unitec.edu'"];
   		
         client.query(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")" + "RETURNING id_orden" , function(err, result) {
             done();
             if (err) {
                 response.send("Error primer query" + err);
                 console.log(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")" + "RETURNING id_orden");
                 response.status(400).end();
             } else {
                response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                //response.render('pages/db', {results: result.rows};
                response.status(201).end();
                //console.log(result.rows[0].id_orden);
                 //response.render('pages/db', {results: result.rows} );
                 //console.log(result.rows.id_orden);                  
                 for (var j = 0; j < request.body.foods.length; j++) {
                     sql.values = ["\'"+result.rows[0].id_orden+"\'", "\'"+request.body.foods[j].idFood +"\'"];
                     sql.columns = ["id_orden", "id_comida"];
                     sql.table = "Comida_pertenece_orden";
                     client.query(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")", function(err2, result) {
                         done();
                         if(j == 0){
                            console.log("entra " + j);
                             if (err2) {
                                console.error(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")");
                                 console.error(err);
                                 response.send("Error segundo query" + err);
                                 response.status(400).end();
                             } else {
                                 //response.render('pages/db', {results: result.rows} );
                                 
                                     console.log("success" + j);
                                     response.contentType('application/json');
                                     //response.send(JSON.stringify(result.rows));
                                     //response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                                     
                                     //response.send(JSON.stringify(result.rows));
                            }
                         }
                     });
                 }

             }

         });


     });

 });

