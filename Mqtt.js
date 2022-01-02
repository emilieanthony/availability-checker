const mqtt = require('mqtt')
//TODO: define options for mqtt connection (client ID, etc)

/** Different MQTT servers */
const LOCALHOST = 'mqtt://127.0.0.1:1883'; //TODO: fill with the local mqtt address
const HOST = 'mqtt://test.mosquitto.org'; //mosquitto test server address
const options = {clientId:'Dentistimo Team5 - Availability Checker n°' + Math.random().toString(16).substr(2, 8),
    will: {
        topic: "Team5/Dentistimo/AvailabilityChecker/LastWill",
        payload: "Availability Checker has been disconnected from the system",
        qos: 1
    }
}

/** Connects to the servers defined in the constants above */
const client = mqtt.connect(LOCALHOST, options) //Change the parameter between HOST or LOCALHOST if you want to connect to the mosquitto test broker or a local broker. For local, mosquitto needs to be installed and running
module.exports.client = client;


/**
 * Subscribes to the needed topic(s)
 */
client.on('connect', async function () {
    await console.log("Connected to Mqtt broker successfully")
})

/**
 * Function that subscribes to a certain topic and react to the subscription.
 * @param topic of type String
 */
module.exports.subscribeToTopic = function (topic){
    client.subscribe(topic, function (err) {
        if (!err) {
            console.log("Subscribed to " + topic + " successfully")
        }else{
            console.log(err.message);
        }
    })
}

/**
 * Subscribe of all topics in the array and prints in the console a confirmation message for each topic.
 * @param arrayOfTopics
 */
module.exports.subscribeToAll = function (arrayOfTopics){
    arrayOfTopics.forEach(topic => {
            client.subscribe(topic,function (error) {
                if (error) {
                    console.log(error)
                } else {
                    console.log('Subscribe to topic ' + topic)
                }
            })
        }
    )
}

/**
 * Unsubscribes to the topics contained in the array and print in the console a confirmation message. Then, disconnects from the mqtt broker
 * @param arrayOfTopics
 */
module.exports.disconnect = function (arrayOfTopics){
    arrayOfTopics.forEach(topic => {
            client.unsubscribe(topic, console.log('Unsubscribing to topic ' + topic))
        }
    )
    client.end(false)
    console.log('Disconnecting from MQTT broker.')
}

/**
 * Publish wrapper for publishing message to given topic, with a given QOS
 * @param topic as a string
 * @param message as a string or buffer
 * @param QoS as a Json Object following the QoS in the mqtt library
 */
module.exports.publishToTopic = function (topic, message, QoS){
    client.publish(topic, message, QoS)
}



