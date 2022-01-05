require("dotenv").config();

/** Required libraries */
const mongoose = require("mongoose");

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require("./Mqtt");
module.exports.mqtt = mqtt;

/**  Subscribed topics */
const checkBookingTopic = "Team5/Dentistimo/Check/Booking"; //Booking information from frontend - confirm - should include issuance
const getTimeslotTopic = "/Team5/Dentistimo/TimeSlots";

const topicsToSubscribeTo = [
  checkBookingTopic,
  getTimeslotTopic
]
module.exports.listOfTopics = topicsToSubscribeTo;


/** Import the database. Connection happens in the Database.js file */
const database = require("./Database");

const timeslotsController = require('./Timeslots.js');
const bookingsController = require('./Booking.js');

mqtt.subscribeToAll(topicsToSubscribeTo);

/**  Listen to messages below */
mqtt.client.on("message", function (topic, message) {
  switch (topic) {
    case checkBookingTopic:
      bookingsController.bookingQueue(JSON.parse(message));
      bookingsController.bookingAvailability()
      break;
    case getTimeslotTopic:
      timeslotsController.saveTimeslotsAsArray(JSON.parse(message));
      break;
    default:
      break;
  }
});
