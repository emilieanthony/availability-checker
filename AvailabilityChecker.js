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
const getTimeslotTopic = "/Team5/Dentistimo/TimeSlots";

/**  Published topics */
const bookingValidatedTopic = "Team5/Dentistimo/Booking/Create/Request"; // Forward to Booking Handler
const bookingRejectedTopic = "Team5/Dentistimo/Reject/Booking"; // Forward to Frontend
const timeslotsValidatedTopic = "Team5/Dentistimo/Timeslots/Validated"; // Forward to Frontend

/** Import the database. Connection happens in the Database.js file */
const database = require("./Database");
const booking = require("./Models/booking.js");

mqtt.subscribeToTopic(checkBookingTopic); //TODO: Update to the topic from frontend
mqtt.subscribeToTopic(getTimeslotTopic);

/**  Listen to messages below */
mqtt.client.on("message", function (topic, message) {
  let incomingMessage = JSON.parse(message.toString());
  switch (topic) {
    case checkBookingTopic:
      console.log("Message booking from Frontend" + message);
      bookingQueue(JSON.parse(message));
      bookingAvailability();
      break;
    case getTimeslotTopic:
      console.log("Message from Timeslot" + message);
      saveTimeslotsAsArray(JSON.parse(message));
      break;
    default:
      break;
  }
});

/*  Check booking Functions */
// TODO: Error handling (clinic null)
var issuanceQueue = new MinPriorityQueue({
  priority: (booking) => booking.timeStamp,
});

const bookingQueue = (booking) => {
  issuanceQueue.enqueue(booking);
};

const bookingAvailability = () => {
  //TODO: refactor after testing
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

/* Check timeslots functions */
function saveTimeslotsAsArray(message) {
  let timeslot = message;
  //let timeslots = [];
  //timeslots.push(timeslot);
  console.log("saveTimeSlotArray:" + timeslot);
  const result = updateBreaks(timeslot);
  console.log("result");

  console.log("saveTimeSlotArray RESULT AFTER FILTERING:" + result);
  checkBookings(result, timeslot.clinicId);
}

function updateBreaks(timeslots) {
  // TODO: Refactor magic numbers
  return (result = timeslots.timeSlots.filter(
    (item) =>
      item.start !== "12:00" &&
      item.start !== "12:30" &&
      item.start !== "10:00" &&
      item.start !== "15:00"
  ));
}

// check bookings
function checkBookings(timeslots, clinicID) {
  console.log("check boookings, clinic: " + clinicID);

  for (let i = 0; i < timeslots.length; i++) {
    Booking.find(
      {
        clinic: mongoose.Types.ObjectId(clinicID),
        date: timeslots[i].date,
        startTime: timeslots[i].start,
      },
      function (err, booking) {
        if (err) {
          console.log(err.message);
        }
        console.log("Booking: " + booking);
      }
    );
  }
  // TODO: Call filterAvailabilityZero
}

// update availability (if 0 remove)
function filterAvailabiltyZero(timeslots) {
  return (result = timeslots.timeslots.filter(
    (item) => item.available !== "0"
    // TODO: update availability (-1), remove if availability is 0 - only from message to frontend
  ));
}

// Vi skickar timeslotsen till frontend
function forwardTimeslots(timeslots) {
  mqtt.client.publish(timeslotsValidatedTopic, JSON.stringify(timeslots));
  console.log("Validated timeslots " + timeslots);
}
