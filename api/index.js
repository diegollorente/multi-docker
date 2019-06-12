//here we are importing a js file
const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//Here we are going to receive any incoming http request that we will send to the React app
const app = express();
//In order to be able to redirect traffic from express to React cross origin resource sharing
app.use(cors());
//To parse incoming body of POST requests from React app into JSON objects for express
app.use(bodyParser.json());


// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (total INT)')
  .catch(err => console.log(err));

/*
//MariaDB Client Setup
const mariadb = require('mariadb');
const mariaDBClient = mariadb.createPool({
  user: keys.mariaDBUser,
  password: keys.mariaDBPassword, 
  host: keys.mariaDBHost, 
  port: keys.mariaDBPort,
  database: keys.mariaDBDatabase,
  connectionLimit: keys.mariaDBConnectionLimit
});

async function asyncFunction() {
  let mariaDBConn;
  try {
    mariaDBConn = await mariaDBClient.getConnection();
    const rows = await mariaDBConn.query('CREATE TABLE IF NOT EXISTS fib (total INT)');
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("Tabla creada");
    console.log(rows);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");    
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (mariaDBConn) return mariaDBConn.end();
  }
}
//Llamamos a la inicializacion de la bbdd
asyncFunction();
*/

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});


async function getAllValues() {
  let mariaDBConn;
  try {
    mariaDBConn = await mariaDBClient.getConnection();
    return await mariaDBConn.query('SELECT * from fib');
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (mariaDBConn) return mariaDBConn.end();
  }
}



app.get('/values/all2', async (req, res) => {
  const values = await getAllValues();

  res.send(values.rows);
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from fib');

  res.send(values.rows);
});


app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});


async function insertValue(index) {
  let mariaDBConn;
  try {
    mariaDBConn = await mariaDBClient.getConnection();
    return await mariaDBConn.query('INSERT INTO fib(total) VALUES(?)', [index]);
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (mariaDBConn) return mariaDBConn.end();
  }
}


app.post('/values2', async (req, res) => {
  const index = parseInt(req.body.index);
  
  if (index > 2000000) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  await insertValue(index);

  res.send({ working: true });
});

app.post('/values', async (req, res) => {
  const index = parseInt(req.body.index);
  
  if (index > 2000000) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO fib(total) VALUES($1)', [index]);

  res.send({ working: true });
});


app.listen(5000, err => {
  console.log('Listening');
});
