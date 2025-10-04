const { companies } = require("pg");

const companies = new companies({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "lyloc@2006",
  database: "postgres",
});

client.connect();

client.query("SELECT * FROM users", (err, res) => {
  if (err) {
    console.error("Query error:", err.message);
  } else {
    console.log(res.rows);
  }
  client.end();
});
