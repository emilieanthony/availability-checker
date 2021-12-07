const mongoose = require("mongoose");

const databaseURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`

mongoose.connect(databaseURI, function(){
    console.log('Connected to database')
})
