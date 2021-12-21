# Avaliability Checker

## Description

This component is part of the the distributed system DENTISTIMO, a web application that offers a geolocalisation based dental care booking system.
The avaliability checker provides the booking handler with valid booking requests. More details can be found in the component diagram below as well as further in this README.md file.

## Component Responsibilities

- Check if chosen time slot from the timeslot generator has available appointments 
- Filter timeslots so that dentists can have lunch and fika
- Forward this information to frontend that displays only available timeslots
- Validate booking requests
- Trigger the booking handler

![_Current_state__System_Component_Diagram-21_dec.drawio](/uploads/d9ba9b8d588fdd14e6c6e450354aa1d7/_Current_state__System_Component_Diagram-21_dec.drawio.png)

## Data input and output
### Data input

The component expects stringified json objects sent via MQTT. 

#### Data input from time slots generator
- Timeslots

#### Data input from frontend
- Booking information

### Data output

#### Data output to booking handler
- Booking request in the right format

#### Data output to frontend
- Validation or rejection


## Installing and running

### Prerequisits:
#### MQTT
You need to have a running version of <b>MQTT</b> on your machine. Please refer to this [link](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwjG3fWb6NH0AhXpQvEDHSGLC2MQFnoECAMQAQ&url=https%3A%2F%2Fmosquitto.org%2Fdownload%2F&usg=AOvVaw2rLN-Os_zfUrtqeV1Lrunf) to download the mosquitto broker if you do not have any. 
#### Node.js
To download the latest version of node.js, please follow this [link](https://nodejs.org/en/download/)

### Instructions

| Step | Command |
| ------ | ------ |
| start your MQTT broker on port 1883| This differs based on which broker, as well as your settings. Make sure the broker listens to port 1883. (Default port with mosquitto) |
| clone this project on your machine | `git clone < SSH address or HTTPS address >` |
| go to the repo and run the following  | `npm start` |

In the window of your broker, you should see a message similar to this:

`1638885841: New client connected from 127.0.0.1:49531 as Dentistimo Team5 - Booking Handler n°3c1ff99e (p2, c1, k60).`

The booking handler is now ready to proceed your requests. 
 



