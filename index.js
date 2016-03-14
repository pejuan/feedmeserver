 var express = require('express');
 var app = express(); // create our app w/ express
 var morgan = require('morgan'); // log requests to the console (express4)
 var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
 var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
 var pg = require('pg');
 var cors = require('cors');
 var async = require('async');


 app.use(cors());

 app.use(bodyParser.json());
 app.use(express.static(__dirname + "/www"));

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
                 response.header("Access-Control-Allow-Origin: http://localhost:8100");
                 response.send("Error " + err);
                 response.status(400).end();
             } else {
                 //response.render('pages/db', {results: result.rows} ); 
                 response.header("Access-Control-Allow-Origin: http://localhost:8100");
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
 app.post('/comida_create',function(request, response) {
     pg.connect(process.env.DATABASE_URL,function(err, client, done) {
         var sql = { query: 'INSERT INTO ', table: 'Comida', columns: ['id_comida','nombre','precio','descripcion','categoria','foto','veces_ordenada','id_restaurante']};
         //sql.values = ['DEFAULT', "\'"+request.body.name+"\'",request.body.price,"\'"request.body.descript+"\'","\'"request.body.category+"\'","\'"request.body.foto+"\'",0,'usuario1'];
            sql.values = ['DEFAULT',"'Quesoburguesa'",23,"'Rica'","'A'","'none.png'",0,"'usuario1'"];
             client.query(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")",function(err,result){
                 console.log(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")");
                 done();
                 if (err) {
                     console.log(err);
                     response.send(err);
                     response.status(400).end();
                 }else{
                     response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                     //response.render('pages/db', {results: result.rows};
                     response.status(201).end();
                     console.log("Done");
                     response.contentType('application/json');
                 }
             }); 
     });
 });

 app.get('/comidas_cliente', function(request, response) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         client.query("SELECT C.nombre, C.precio, O.id_orden, R.tiempo FROM Comida C join comida_pertenece_orden O on O.id_comida = C.id_comida join Orden R on R.id_orden=O.id_orden",function(err, result){
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
 /*app.post('/restaurante',function(request, response) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'INSERT INTO', table: 'Restaurante', columns: ['id_usuario', 'contrasena', 'nom_restaurante']}
         //var user = params[:id_usuario];
         //var pass = params[:contrasena];
         //var name = params[:nom_restaurante];
         client.query(sql.query + sql.table + " (" + sql.columns.join(',')+ ") "+ "VALUES ("+request.body.id_usuario+","+request.body.contrasena+","+request.body.nom_restaurante)
     });
 });*/
 
 

 app.post('/order',function(request, response) {

     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'INSERT INTO ', table: 'Orden', columns: ['id_orden', 'id_restaurante','estado','id_cliente','ispaid'] };

         sql.values = ['DEFAULT', "\'"+request.body.idRestaurant+"\'","\'N\'","\'"+request.body.id_cliente+"\'",'false'];
   		
         client.query(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")" + "RETURNING id_orden" , function(err, result) {
             done();
             if (err) {
                 response.send("Error primer query" + err);
                 console.log(sql.query + sql.table + " (" + sql.columns.join(',') + ") " + "VALUES (" + sql.values.join(',') + ")" + "RETURNING id_orden");
                 response.status(400).end();
             } else {
                response.header("Access-Control-Allow-Origin: http://localhost:8100");
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
                                     response.header("Access-Control-Allow-Origin: http://localhost:8100");
                                     
                                     //response.send(JSON.stringify(result.rows));
                            }
                         }
                     });
                 }

             }

         });


     });

 });

 app.post('/logoutcliente', function(req, res) {
    response.status(200).end();
 });

 app.post('/logincliente', function(req, res) {
     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'SELECT * FROM ', table: 'Cliente', where: ' where correo = '+"\'"+req.body.correo+"\'"+' AND contrasena = '+"\'"+req.body.contrasena+"\'"};
         client.query(sql.query + sql.table + sql.where, function(err, result){
            done();
            if(err){
                console.error(err);
                console.log(sql.query + sql.table + sql.where);
            }else{
                if (result.rows.length > 0) {
                         //res.redirect('/registry');
                        res.header("Access-Control-Allow-Origin: http://localhost:8100");
                         res.send("existe");
                         res.status(200).end();
                     } else {
                         console.log("no encontrado");
                         //res.redirect('/login');
                         res.status(401).end();
                     }
            }
         });
     });
 });

 app.post('/registrycliente', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
         var sql = { query: 'INSERT INTO ', table: 'Cliente', columns: ['correo', 'nombre', 'contrasena']};
         client.query(sql.query + sql.table + " (" + sql.columns.join(',')+ ") "+ " VALUES ("+"\'"+req.body.correo+"\'"+","+"\'"+req.body.nombre+"\'"+","+"\'"+req.body.contrasena+"\'"+")", function(err, result){
            done();
            if(err){
                console.error(err);
                console.log(sql.query + sql.table + " (" + sql.columns.join(',')+ ") "+ " VALUES ("+req.body.correo+","+req.body.nombre+","+req.body.contrasena+")");
            }else{
                res.header("Access-Control-Allow-Origin: http://localhost:8100");
                res.status(201).end();
            }
         });
     });
 });

//var client2= new pg.Client(process.env.DATABASE_URL);
app.post('/historialOrdenes', function(req, res) {
        //var client= new pg.Client(process.env.DATABASE_URL);
         //client.connect(function(err) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = { query: 'SELECT R.nom_restaurante, O.id_orden, O.id_restaurante, O.estado, O.ispaid, O.tiempo, O.id_cliente FROM ', table: 'Orden O', join:' inner join Restaurante R on R.id_usuario=O.id_restaurante' , where: ' where O.id_cliente = '+"\'"+req.body.id_cliente+"\'"};
          client.query(sql.query + sql.table + sql.join+sql.where, function(err, projects) {
            //console.log(sql.query + sql.table + sql.join+sql.where);
        if (err) return console.error("error1"+err);
        async.each(projects.rows, 
        function(projectRow, cb) { // called once for each project row
            client.query('select CO.id,CO.id_orden,CO.id_comida,C.nombre, C.precio from Comida_pertenece_orden CO inner join Comida C on C.id_comida = CO.id_comida where CO.id_orden= '+"\'"+projectRow.id_orden+"\'" , function(err, result) {
                //console.log('select CO.id,CO.id_orden,CO.id_comida,C.nombre from Comida_pertenece_orden CO join Comida C on C.id_comida = CO.id_comida where CO.id_orden= '+"\'"+projectRow.id_orden+"\'");
              if(err) return cb("erro3"+err); // let Async know there was an error. Further processing will stop
              projectRow.comidas = result.rows;
              cb(null); // no error, continue with next projectRow, if any
            });
          }

        , function(err) {
          if (err) return console.error("error2"+err);
          // all project rows have been handled now
          //console.log(projects.rows);
          done();
          res.header("Access-Control-Allow-Origin: http://localhost:8100");
          res.contentType('application/json');
          res.send(JSON.stringify(projects.rows));
          res.status(200).end();
        });
        //client.end();
      });

     });
 });    

var addComidasToOrden = function(projectRow, cb) { // called once for each project row
    client2.query('select CO.id,CO.id_orden,CO.id_comida,C.nombre, C.precio from Comida_pertenece_orden CO inner join Comida C on C.id_comida = CO.id_comida where CO.id_orden= '+"\'"+projectRow.id_orden+"\'" , function(err, result) {
        //console.log('select CO.id,CO.id_orden,CO.id_comida,C.nombre from Comida_pertenece_orden CO join Comida C on C.id_comida = CO.id_comida where CO.id_orden= '+"\'"+projectRow.id_orden+"\'");
      if(err) return cb("erro3"+err); // let Async know there was an error. Further processing will stop
      projectRow.comidas = result.rows;
      cb(null); // no error, continue with next projectRow, if any
    });
  };


