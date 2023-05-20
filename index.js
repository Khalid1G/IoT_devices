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

// Check if it's nighttime (e.g., between 10 PM and 6 AM)
function isNighttime() {
  const currentHour = new Date().getHours();
  return currentHour >= 22 || currentHour < 6;
}

// Create MQTT client
const client = mqtt.connect(brokerUrl, options);

// MQTT client connected event
client.on("connect", () => {
  console.log("Connected to MQTT broker");

  // // Add device with topic "SITI/khalid/test"
  // const deviceTopic = "SITI/khalid/test2";
  // client.subscribe(deviceTopic, (err) => {
  //   if (err) {
  //     console.error("Error subscribing to device topic:", err);
  //   } else {
  //     console.log("Subscribed to device topic:", deviceTopic);
  //   }
  // });
});

// MQTT message received event
// client.on("message", (topic, message) => {
//   console.log("Received message:", message.toString());
// });

// Send random number every minute
setInterval(() => {
  let randomNumber;
  if (isNighttime()) {
    randomNumber = 0;
  } else {
    const probability = Math.random();
    if (probability < 0.1) {
      randomNumber = 0; // 10% probability for 0
    } else if (probability < 0.3) {
      randomNumber = 80; // 20% probability for 80
    } else if (probability < 0.4) {
      randomNumber = getRandomNumber(15, 80); // 10% probability for values between 15 and 80
    } else {
      randomNumber = getRandomNumber(80, 85); // Remaining 60% probability for values between 80 and 85
    }
  }

  const message = randomNumber.toString();
  const deviceTopic = "SITI/khalid/test";
  client.publish(deviceTopic, message, (err) => {
    if (err) {
      console.error("Error publishing message:", err);
    } else {
      console.log("Published message:", message);
    }
  });
}, 1000); // Send message every minute
