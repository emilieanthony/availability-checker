const mqtt = require("./Mqtt");
module.exports.mqtt = mqtt;

const Booking = require("./Models/booking.js");
const mongoose = require("mongoose");

// publish topic
const timeslotsValidatedTopic = "Team5/Dentistimo/Timeslots/Validated"; // Forward to Frontend

/********************************************************** */
/* Check timeslots availability functions */
/********************************************************** */

module.exports.saveTimeslotsAsArray = function (message) {
    let timeslots = message.timeSlots;
    const result = updateBreaks(timeslots);
    checkBookings(result, message.clinicId);
}
  
function updateBreaks(timeslots) {
    const LUNCH_1 = "12:00";
    const LUNCH_2 = "12:30";
    const FIKA_1 = "10:00";
    const FIKA_2 = "15:00";
  
    return (result = timeslots.filter(
      (item) =>
        item.start !== LUNCH_1 &&
        item.start !== LUNCH_2 &&
        item.start !== FIKA_1 &&
        item.start !== FIKA_2
    ));
}
  
  // update availability for timeslots
function checkBookings(timeslots, clinicID) {
    console.log("check boookings, clinic: " + clinicID);
  
    const promises = [];
    for (let i = 0; i < timeslots.length; i++) {
      promises.push(
        Booking.find({
          clinic: mongoose.Types.ObjectId(clinicID),
          date: new Date(convertDate(timeslots[i].date))
            .toISOString()
            .slice(0, 10),
          startTime: timeslots[i].start + "-" + timeslots[i].end,
        })
      );
    }
    Promise.all(promises).then((bookings) => {
      timeslots = filterAvailabilty(timeslots, bookings);
      forwardTimeslots(timeslots, clinicID);
    });
}
  
const convertDate = (date) => {
    const parts = date.split(" ");
    if (parts.length != 4) {
      console.error("Date from timeslot generator has invalid format");
    } else {
      return parts[2] + " " + parts[1] + " " + parts[3] + " 00:00:00 UTC";
    }
};
  
  // updates availability and filters
function filterAvailabilty(timeslots, bookings) {
    console.log('filter');
    return (result = timeslots
      .map((timeslot, index) => {
        timeslot.available = timeslot.available - bookings[index].length;
        return timeslot;
      })
      .filter((item) => item.available > 0));
}
  
  // Forward timeslots to frontend
  //TODO: check mqtt, use publish in mqtt.js? 
function forwardTimeslots(timeslots, clinicId) {
    console.log('forward');

    console.log('publish')
    mqtt.client.publish(
      timeslotsValidatedTopic,
      JSON.stringify({
        timeSlots: timeslots,
        clinicId: clinicId,
      })
    );
    console.log("Validated timeslots " + timeslots);
}

  