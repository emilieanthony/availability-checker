const mqtt = require("./Mqtt");
module.exports.mqtt = mqtt;

const Booking = require("./Models/booking.js");
const mongoose = require("mongoose");

// Published topic
const timeslotsValidatedTopic = "Team5/Dentistimo/Timeslots/Validated"; // Forward to Frontend

/********************************************************** */
/* Check and update timeslots availability */
/********************************************************** */

/**
 * Starting point
 * @param {*} message timeslots as JSON 
 */
module.exports.saveTimeslotsAsArray = function (message) {
    let timeslots = message.timeSlots;
    const result = updateBreaks(timeslots);
    checkBookings(result, message.clinicId);
}
  
/**
 * Removes breaks from timeslots so that the breaks are kept free
 * @param {*} timeslots 
 * @returns updated timeslots
 */
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
  
  /**
   * Finds all bookings made to the clinic at the date. Then calls 
   * methods filterAvailablity and forwardTimeslots
   * to filter and finally to forward timeslots. 
   * @param {*} timeslots timeslots with updated breaks
   * @param {*} clinicID 
   */
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

/**
 * Ensures that the correct date format is used
 * @param {*} date 
 * @returns 
 */
const convertDate = (date) => {
    const parts = date.split(" ");
    if (parts.length != 4) {
      console.error("Date from timeslot generator has invalid format");
    } else {
      return parts[2] + " " + parts[1] + " " + parts[3] + " 00:00:00 UTC";
    }
};
  
/**
 * Filters availabilty based on how many bookings have already been made 
 * at a timeslot.  
 * @param {*} timeslots 
 * @param {*} bookings 
 * @returns updated timeslots with available timeslots. 
 */
function filterAvailabilty(timeslots, bookings) {
    console.log('filter');
    return (result = timeslots
      .map((timeslot, index) => {
        timeslot.available = timeslot.available - bookings[index].length;
        return timeslot;
      })
      .filter((item) => item.available > 0));
}
  
  //TODO: check mqtt, use publish in mqtt.js? 

  /**
   * Forwards valid timeslots to frontend via MQTT
   * @param {*} timeslots 
   * @param {*} clinicId 
   */
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

  