const mysql = require("mysql");
const config = require("config")
const dbConfig = config.get('User.dbConfig')

// Create a connection to the database
const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

// Open the MySQL connection
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database 'PSAS_DB'.");
});

module.exports = connection;
