let express = require('express');
let path = require('path');
let fs = require('fs');
let SqlClient = require('mssql');
let bodyParser = require('body-parser');
//var https = require('https');
var http = require('http');

var privateKey = fs.readFileSync('./certificate/key.pem');
var certificate = fs.readFileSync('./certificate/cert.pem');
var credentials = {key: privateKey, cert: certificate};

let app = express();
//var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(app);

const config = {
    user: 'sa',
    password: 'Werder,00',
    server: 'nas-2',
    database: 'misc_data',
    options: {
      trustedConnection: true,
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.static('css'))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index3.html"));
  });

app.get('/tankdaten_erfassen/get-letzter-tankvorgang', function (req, res) {
  (async function () {
    try {
      let sql_query = 'select top 1 Datum, [Km-Stand] as kmStand, Liter, vollgetankt, Betrag, [ct/l] as Literpreis, Tankstelle, Sorte from Tankliste order by Datum desc'
      let pool = await SqlClient.connect(config)
      let result1 = await pool.request().query(sql_query);
        console.log(result1);
        res.send(result1);
      } catch (err) {
      err.status = 415;
		  console.log(err);
      next(err);
    }
  })()
});

app.get('/images(/:picture_name)?', function (req, res) {
  console.log(req.params.picture_name)
  if (typeof req.params.picture_name === 'undefined') {
    picture_name = '111.14537851.jpg.14537862.jpg'
  }
  else {
    picture_name = req.params.picture_name
  }
  let img = fs.readFileSync(path.join(__dirname, "images/" + picture_name));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

app.post('/tankdaten_erfassen/update', function (req, res, next) {
  let userObj = req.body;
  console.log(userObj);

  let sql_query = [];
  sql_query.push(`INSERT INTO Tankliste (FahrzeugID, Datum, [Km-Stand], Liter, vollgetankt, Betrag, [ct/l], Tankstelle, Sorte) VALUES (1, `);
  sql_query.push(`convert(datetime,'${userObj.Datum} 15:00:00', 20), `);
  sql_query.push(`'${userObj.kmStand}', `);
  sql_query.push(`'${userObj.Liter}', `);
  sql_query.push(`'${userObj.vollgetankt}', `);
  sql_query.push(`'${userObj.Betrag}', `);
  sql_query.push(`'${userObj.Literpreis}', `);
  sql_query.push(`'${userObj.Tankstelle}', `);
  sql_query.push(`'${userObj.Sorte}'`);
  sql_query.push(');\n');
  sql_query = sql_query.join('');
  console.log(sql_query);

  (async function () {
    try {
      let pool = await SqlClient.connect(config)
      let result1 = await pool.request().query(sql_query);
        console.log(result1);
        res.send(result1);
      } catch (err) {
      err.status = 415;
		  console.log(err);
      next(err);
    }
  })()

});

httpServer.listen(3001, function () {
  console.log("app listening on port 3001!");
});
