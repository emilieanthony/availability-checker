require('dotenv').config()
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require('./Models/booking.js')

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require('./Mqtt')

/** Import the database. Connection happens in the Database.js file */
const database = require('./Database')
