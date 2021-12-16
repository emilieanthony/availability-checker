require("dotenv").config();

import {
  MinPriorityQueue,
} from '@datastructures-js/priority-queue';

const {
  MinPriorityQueue
} = require('@datastructures-js/priority-queue');
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require("./Models/booking.js");

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require("./Mqtt");

/**  Subscribed topics */
const checkBookingTopic = "Team5/Dentistimo/Check/Booking"; //Booking information from frontend - confirm - should include issuance

/**  Published topics */
const bookingValidatedTopic = "Team5/Dentistimo/Booking/Create/Request"; // Forward to Booking Handler
const bookingRejectedTopic = "Team5/Dentistimo/Reject/Booking"; // Message to frontend

/** Import the database. Connection happens in the Database.js file */
const database = require("./Database");
const booking = require("./Models/booking.js");

mqtt.subscribeToTopic(checkBookingTopic); //TODO: Update to the topic from frontend
mqtt.subscribeToTopic(getTimeslotTopic);

/**  Listen to messages below */

mqtt.client.on("message", function (topic, message) {
  switch (topic) {
    case checkBookingTopic:
      // method call
      break;
    case getTimeslotTopic:
      //method call
      break;
    default:
      break;
  }
});

/**  Functions */

var issuanceQueue = new MinPriorityQueue();

const bookingQueue = (booking) => {
  issuanceQueue.enqueue(booking, booking.issuance); 

  // pop all bookings in the queue


}

const bookingAvailability = (booking) => {
  //need clinicID (+number of dentists), date, starttime
  // query data base + return number of available booking. find same clinic id and number of dentist
  // the method return the number of available bookings for that clinic on that specific time.
};

const checkAvailability = (bookingAvailability, booking) => {
  if (bookingAvailability > 0) {
    forwardBooking(booking);
  } else {
    rejectBooking(booking);
  }
};

const forwardBooking = (booking) => {
  client.publish(bookingValidatedTopic, JSON.stringify(booking));
  console.log("Timeslot validated:" + bookingInfo);
};

const rejectBooking = (booking) => {
  client.publish(bookingRejectedTopic, JSON.stringify(booking));
  console.log("Booking rejected:" + bookingInfo);
};
