const { MinPriorityQueue } = require("@datastructures-js/priority-queue");
/** Required libraries */
const mongoose = require("mongoose");
/** Database Models */
const Booking = require("./Models/booking.js");
const Dentist = require("./Models/dentist.js");

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require("./Mqtt");
module.exports.mqtt = mqtt;

/**  Published topics */
const bookingValidatedTopic = "Team5/Dentistimo/Booking/Create/Request"; // Forward to Booking Handler
const bookingRejectedTopic = "Team5/Dentistimo/Reject/Booking"; // Forward to Frontend

/********************************************************** */
/* Check bookings availability functions */
/********************************************************** */

// TODO: Error handling (clinic null)
let issuanceQueue = new MinPriorityQueue({
  priority: (booking) => booking.timeStamp,
});


module.exports.bookingQueue = (booking) => {
  issuanceQueue.enqueue(booking);
};

module.exports.bookingAvailability = () => {
  //TODO: Refactor after testing
  const booking = issuanceQueue.dequeue();
  console.log(booking);
  Dentist.findById(booking.element.clinicId, function (err, dentist) {
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
        clinic: booking.clinicId,
        date: booking.date,
        starttime: booking.time,
      },
      function (err, bookings) {
        if (err) {
          console.error(err);
          return;
        }
        const nrAvailableDentists = dentist.dentists - bookings.length;
        console.log(dentist);
        checkAvailability(nrAvailableDentists, booking.element);
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

// Function makes sure booking from frontend matches booking schema
const convertBooking = (booking) => {
  const b = new Booking();
  b.userSSN = booking.ssn;
  b.clinic = booking.clinicId;
  b.date = booking.date;
  b.startTime = booking.time;
  return b;
};

const forwardBooking = (booking) => {
  console.log(JSON.stringify(convertBooking(booking)));
  mqtt.client.publish(
    bookingValidatedTopic,
    JSON.stringify(convertBooking(booking))
  );
  console.log("Timeslot validated");
};

const rejectBooking = (booking) => {
  mqtt.client.publish(bookingRejectedTopic, JSON.stringify(booking));
  console.log("Booking rejected");
};
