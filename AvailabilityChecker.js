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
const getTimeslotTopic = "/Team5/Dentistimo/TimeSlots"
/**  Published topics */
const bookingValidatedTopic = "Team5/Dentistimo/Booking/Create/Request"; // Forward to Booking Handler
const bookingRejectedTopic = "Team5/Dentistimo/Reject/Booking"; // Message to frontend

/** Import the database. Connection happens in the Database.js file */
const database = require("./Database");
const booking = require("./Models/booking.js");

mqtt.subscribeToTopic(checkBookingTopic); //TODO: Update to the topic from frontend
mqtt.subscribeToTopic(getTimeslotTopic);

/**  Listen to messages below */
var data = {
  "clinicId": "",
  "timeslots":[
    {
      "_id": "61bc57e6ce0d87512e7329ab",
      "start": "9:00",
      "end": "9:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329ac",
      "start": "9:30",
      "end": "10:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329ad",
      "start": "10:00",
      "end": "10:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329ae",
      "start": "10:30",
      "end": "11:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329af",
      "start": "11:00",
      "end": "11:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b0",
      "start": "11:30",
      "end": "12:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b1",
      "start": "12:00",
      "end": "12:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b2",
      "start": "12:30",
      "end": "13:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b3",
      "start": "13:00",
      "end": "13:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b4",
      "start": "13:30",
      "end": "14:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b5",
      "start": "14:00",
      "end": "14:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b6",
      "start": "14:30",
      "end": "15:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b7",
      "start": "15:00",
      "end": "15:30",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b8",
      "start": "15:30",
      "end": "16:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329b9",
      "start": "16:00",
      "end": "16:30",
      "available": 3,
      "date": "Thu Dec \r\n02 2021"
    },
    {
      "_id": "61bc57e6ce0d87512e7329ba",
      "start": "16:30",
      "end": "17:00",
      "available": 3,
      "date": "Thu Dec 02 2021"
    }
  ]
  }

console.log(data);
const test = saveTimeslotsAsArray(data);

mqtt.client.on("message", function (topic, message) {
  switch (topic) {
    case checkBookingTopic:
      bookingQueue(JSON.parse(message));
      bookingAvailability();

      break;
    case getTimeslotTopic:
      //saveTimeslotsAsArray(JSON.parse(message));
      //method call
      break;
    default:
      break;
  }
});

/*  Check booking Functions */

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


/* Check timeslots functions */

function saveTimeslotsAsArray (message) {
    var timeslot = message;
    //let timeslots = [];
    //timeslots.push(timeslot);
    console.log(timeslot); 
    const result = updateBreaks(timeslot);
    // Get non-filter timeslots in array
};



function updateBreaks (timeslots) {

  return result = timeslots.timeslots.filter(item => item.start !== '12:00' && item.start !== '12:30' && item.start !== '10:00' && item.start !== '15:00');

  // timeslots = fikaBreak(timeslots); 
  // After this check bookings 
};

// check bookings 
// update availability (if 0 remove)

// Vi skickar timeslotsen till frontend
