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
/* Check bookings availability */
/********************************************************** */

let issuanceQueue = new MinPriorityQueue({
  priority: (booking) => booking.timeStamp,
});

/**
 * Adds booking to min priority queue
 * @param {*} booking 
 */
module.exports.enqueueBooking = (booking) => {
  if (!booking.clinicId || !booking.ssn || !booking.date || !booking.time || !booking.timeStamp){
    throw 'Invalid booking format, missing field';
  } else {
    issuanceQueue.enqueue(booking);
  }
};

/**
 * Takes the prioritised booking and finds nr of available dentists at the time of the booking
 */
module.exports.validateBooking = () => {
  const booking = issuanceQueue.dequeue();
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
        checkAvailability(nrAvailableDentists, booking.element);
      }
    );
  });
};

/**
 * If the there is an available timeslot forward booking, else reject
 * @param {*} nrAvailableDentists 
 * @param {*} booking 
 */
const checkAvailability = (nrAvailableDentists, booking) => {
  if (nrAvailableDentists > 0) {
    forwardBooking(booking);
  } else {
    rejectBooking(booking);
  }
};

/**
 * Ensures booking from frontend matches booking schema
 * @param {*} booking 
 * @returns correct booking schema 
 */
const convertBooking = (booking) => {
  const b = new Booking();
  b.userSSN = booking.ssn;
  b.clinic = booking.clinicId;
  b.date = booking.date;
  b.startTime = booking.time;
  return b;
};

/**
 * Forwards validated booking to frontend
 * @param {*} booking a validated booking
 */
const forwardBooking = (booking) => {
  console.log(JSON.stringify(convertBooking(booking)));

  mqtt.publishToTopic(
    bookingValidatedTopic,
    JSON.stringify(convertBooking(booking)),
    {qos:1}
  );
  console.log("Booking validated");
};

/**
 * Notifies Frontend that booking is invalid and has been rejected
 * @param {*} booking invalid booking
 */
const rejectBooking = (booking) => {
  mqtt.publishToTopic(bookingRejectedTopic, JSON.stringify(booking), {qos:1})
  console.log("Booking rejected");
};
