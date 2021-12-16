require("dotenv").config();

const { MinPriorityQueue } = require("@datastructures-js/priority-queue");
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require("./Models/booking.js");
const Dentist = require("./Models/dentist.js");

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
//mqtt.subscribeToTopic(getTimeslotTopic);

/**  Listen to messages below */

mqtt.client.on("message", function (topic, message) {
  switch (topic) {
    case checkBookingTopic:
      bookingQueue(JSON.parse(message));
      bookingAvailability();

      break;
    case getTimeslotTopic:
      //method call
      break;
    default:
      break;
  }
});

/**  Functions */

var issuanceQueue = new MinPriorityQueue({
  priority: (booking) => booking.issuance,
});

const bookingQueue = (booking) => {
  issuanceQueue.enqueue(booking);
};

const bookingAvailability = () => {
  //refactor after testing
  const booking = issuanceQueue.dequeue();
  Dentist.findById(booking.clinicID, function (err, dentist) {
    if (err) {
      console.error(err);
      return;
    }
    if (!dentist) {
      console.error(err);
      console.log("Dentist not found");
      return;
    }
    Booking.find(
      {
        clinicID: booking.clinicID,
        date: booking.date,
        starttime: booking.starttime,
      },
      function (err, bookings) {
        if (err) {
          console.error(err);
          return;
        }
        const nrAvailableDentists = dentist.dentists - bookings.length;
        checkAvailability(nrAvailableDentists, booking);
      }
    );
  });
};

const checkAvailability = (nrAvailableDentists, booking) => {
  if (nrAvailableDentists > 0) {
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
