const mysql = require("mysql2");

// mYSQL connection, replace this to your local server
const con = mysql.createPool({
  // host = RDS endpoint
  host: process.env.MYSQL_HOST || 'localhost',
  database: process.env.MYSQL_DATABASE || 'lazada',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || "RaidenShogun070599:)",
  port: process.env.MYSQL_PORT || 7575,
});

con.getConnection(function (err) {
  if (err) throw err;
  console.log("Connected to database");
});

process.on("uncaughtException", function (err) {
  console.log(err);
});

module.exports = con;