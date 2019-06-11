module.exports = {
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  pgUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT,
  mariaDBDatabase: process.env.MARIADBDATABASE,
  mariaDBUser: process.env.MARIADBUSER,
  mariaDBPassword: process.env.MARIADBDPASSWORD,
  mariaDBHost: process.env.MARIADBHOST,
  mariaDBPort: process.env.MARIADBPORT,
  mariaDBConnectionLimit: process.env.MARIADCONNECTIONLIMIT
};
