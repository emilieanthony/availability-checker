const mongoose = require("mongoose");

const databaseURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`

mongoose.connect(databaseURI, function(){
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${databaseURI}`);
        console.error(err.stack);
    }

    console.log('Connected to database')
})
