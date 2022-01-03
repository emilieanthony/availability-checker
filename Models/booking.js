var mongoose = require('mongoose');
var schema = mongoose.Schema;

var bookingSchema = new schema({

    userSSN: {type: Number, required: [true, 'SSN is required']},
    clinic: {type: schema.Types.ObjectId, ref: 'dentists', required: [true, 'Clinic _id is required']},
    date: {type: String, required: [true, 'Date is required']}, //TODO: Look at the format given by front end and Time slot generator
    startTime: {type: String, required: [true, 'Starting time is required']} //TODO: Look at the format given by front end and Time slot generator
    
});

module.exports = mongoose.model('bookings', bookingSchema);