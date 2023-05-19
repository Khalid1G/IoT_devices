const mqtt = require("mqtt");

// MQTT broker details
const brokerUrl = "mqtt://gounane.ovh";
const options = {
  clientId: "mqtt-client-khalid",
  username: "chaari",
  password: "chaari2023",
};

// Generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create MQTT client
const client = mqtt.connect(brokerUrl, options);

// MQTT client connected event
client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

// MQTT message received event
client.on("message", (topic, message) => {
  console.log("Received message:", message.toString());
});

// Send random number every minute
setInterval(() => {
  const randomNumber = getRandomNumber(0, 85);
  const message = randomNumber.toString();
  const deviceTopic = "SITI/khalid/test";
  client.publish(deviceTopic, message, (err) => {
    if (err) {
      console.error("Error publishing message:", err);
    } else {
      console.log("Published message:", message);
    }
  });
}, 60000);
