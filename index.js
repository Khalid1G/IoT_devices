require("dotenv").config();
const mqtt = require("mqtt");

// MQTT broker details
const { MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD } = process.env;

const MqttUrl = `${MQTT_HOST}:${MQTT_PORT}`;

// Generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if it's nighttime (e.g., between 10 PM and 6 AM)
function isNighttime() {
  const currentHour = new Date().getHours();
  return currentHour >= 22 || currentHour < 6;
}

// Create MQTT clients
const client1 = mqtt.connect(MqttUrl, createOptions("mqtt-client-1"));
const client2 = mqtt.connect(MqttUrl, createOptions("mqtt-client-2"));
const client3 = mqtt.connect(MqttUrl, createOptions("mqtt-client-3"));

// Function to create MQTT options
function createOptions(clientId) {
  return {
    clientId: clientId,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  };
}

// MQTT client connected events
client1.on("connect", () => {
  console.log("Connected to MQTT broker - Device 1");
});

client2.on("connect", () => {
  console.log("Connected to MQTT broker - Device 2");
});

client3.on("connect", () => {
  console.log("Connected to MQTT broker - Device 3");
});

// Send random number for each device every minute with random delays
function sendRandomNumber(deviceName, client) {
  const randomNumber = isNighttime() ? 0 : generateRandomNumber();
  const deviceTopic = `SITI/test/${deviceName}`;

  setTimeout(() => {
    client.publish(deviceTopic, randomNumber.toString(), (err) => {
      if (err) {
        console.error(`Error publishing message for ${deviceName}:`, err);
      } else {
        console.log(`Published message for ${deviceName}:`, randomNumber);
      }
    });
  }, getRandomDelay());
}

// Generate random delay between 0 and 30 seconds
function getRandomDelay() {
  return Math.random() * 30000;
}

// Generate random number based on probability distribution
function generateRandomNumber() {
  const probability = Math.random();
  if (probability < 0.1) {
    return 0; // 10% probability for 0
  } else if (probability < 0.3) {
    return 80; // 20% probability for 80
  } else if (probability < 0.4) {
    return getRandomNumber(15, 80); // 10% probability for values between 15 and 80
  } else {
    return getRandomNumber(80, 85); // Remaining 60% probability for values between 80 and 85
  }
}

// Send random number for each device
setInterval(() => {
  sendRandomNumber("d01", client1);
}, 60000); // Send message for Device 1 every minute

setInterval(() => {
  sendRandomNumber("d02", client2);
}, 60000); // Send message for Device 2 every minute

setInterval(() => {
  sendRandomNumber("d03", client3);
}, 60000); // Send message for Device 3 every minute
