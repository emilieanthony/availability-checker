require("dotenv").config();

/** Required libraries */
const mongoose = require("mongoose");

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require("./Mqtt");
module.exports.mqtt = mqtt;

/**  Subscribed topics */
const checkBookingTopic = "Team5/Dentistimo/Check/Booking"; //Booking information from frontend - confirm - should include issuance
const getTimeslotTopic = "/Team5/Dentistimo/TimeSlots";
const clientErrorTopic = "/Team5/Dentistimo/Client/Error";

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
      try {
        bookingsController.bookingQueue(JSON.parse(message));
        bookingsController.bookingAvailability();
      } catch (error) {
        console.log(error)
        mqtt.client.publish(clientErrorTopic, JSON.stringify(error));
      }
      break;
    case getTimeslotTopic:
      try {
        timeslotsController.saveTimeslotsAsArray(JSON.parse(message));
      } catch (error) {
        console.log(error)
        mqtt.client.publish(clientErrorTopic, JSON.stringify(error));
      }
      break;
    default:
      break;
  }
});
