const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rootroot",
  database: "energy_guide"
});

module.exports = pool.promise();
