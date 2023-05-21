require("dotenv").config();
const mqtt = require("mqtt");

// MQTT broker details
const { MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, TOPIC_PREFIX } =
  process.env;

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

for (let i = 0; i < 20; i++) {
  const client = mqtt.connect(MqttUrl, createOptions(`mqtt-client-${i}`));
  client.on("connect", () => {
    console.log(`Connected to MQTT broker - Device ${i}`);
  });
  client.on("error", (err) => {
    console.error(`Error connecting to MQTT broker - Device ${i}:`, err);
  });
  client.on("close", () => {
    console.log(`Disconnected from MQTT broker - Device ${i}`);
  });

  // Send random number for each device
  setTimeout(() => {
    setInterval(() => {
      const randomNumber = isNighttime() ? 0 : generateRandomNumber();
      const deviceTopic = `${TOPIC_PREFIX}/test/d${i}`;
      client.publish(deviceTopic, randomNumber.toString(), (err) => {
        if (err) {
          console.error(`Error publishing message for ${deviceTopic}:`, err);
        } else {
          console.log(`Published message for ${deviceTopic}:`, randomNumber);
        }
      });
    }, 60000); // Send message for Device 1 every minute
  }, getRandomDelay());
}

// Function to create MQTT options
function createOptions(clientId) {
  return {
    clientId: clientId,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  };
}

// Send random number for each device every minute with random delays
function sendRandomNumber(deviceName, client) {
  let randomNumber =
    isNighttime() || isLunchtime() || isPauseTime()
      ? 0
      : generateRandomNumber();

  const deviceTopic = `SITI/test/${deviceName}`;

  client.publish(deviceTopic, randomNumber.toString(), (err) => {
    if (err) {
      console.error(`Error publishing message for ${deviceName}:`, err);
    } else {
      console.log(`Published message for ${deviceName}:`, randomNumber);
    }
  });
}

// Check if it's lunchtime (e.g., between 12 PM and 1 PM)
function isLunchtime() {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  return currentHour === 12 && currentMinute >= 0 && currentMinute < 1;
}

// Check if it's time for pause (e.g., between 2 PM and 3 PM)
function isPauseTime() {
  const currentHour = new Date().getHours();
  return currentHour === 14;
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
