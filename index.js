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

// Check if it's nighttime for the given shift
function isNighttime(shift) {
  const currentHour = new Date().getHours();
  if (shift === "day") {
    return currentHour >= 22 || currentHour < 6; // Nighttime between 10 PM and 6 AM for day shift
  } else if (shift === "night") {
    return currentHour >= 6 && currentHour < 14; // Nighttime between 6 AM and 2 PM for night shift
  } else if (shift === "evening") {
    return currentHour >= 14 && currentHour < 22; // Nighttime between 2 PM and 10 PM for evening shift
  }
}

// Check if it's pause time for the given shift
function isPauseTime(shift) {
  const currentHour = new Date().getHours();
  if (shift === "day") {
    return false; // No pause time during the day shift
  } else if (shift === "night") {
    return currentHour === 0 || currentHour === 1; // Pause time between 12 AM and 1 AM for night shift
  } else if (shift === "evening") {
    return currentHour === 18 || currentHour === 19; // Pause time between 6 PM and 7 PM for evening shift
  }
}

function getRandomDelay() {
  return Math.floor(Math.random() * 49100) + 900;
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

function startSendingMessages(deviceName, client, shift) {
  const sendMessage = () => {
    let randomNumber;

    if (isNighttime(shift) || isPauseTime(shift)) {
      randomNumber = 0; // Send 0 during nighttime or pause time
    } else {
      randomNumber = generateRandomNumber(); // Send random number
    }

    const deviceTopic = `${TOPIC_PREFIX}/test/d${deviceName}/counter`;
    client.publish(deviceTopic, randomNumber.toString(), (err) => {
      if (err) {
        console.error(`Error publishing message for ${deviceTopic}:`, err);
      } else {
        console.log(`Published message for ${deviceTopic}:`, randomNumber);
      }
    });
  };

  // Start the message sending with a random delay
  setTimeout(() => {
    sendMessage(); // Send the first message immediately
    setInterval(sendMessage, 60000); // Schedule subsequent messages every minute
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

// Start the simulation
function startSimulation() {
  for (let i = 1; i < 21; i++) {
    const device = i.toString().padStart(2, "0");
    const client = mqtt.connect(
      MqttUrl,
      createOptions(`mqtt-client-${device}`)
    );
    const shift = getShift(device);

    client.on("connect", () => {
      console.log(`Connected to MQTT broker - Device ${device}`);
      startSendingMessages(device, client, shift);
    });

    client.on("error", (err) => {
      console.error(`Error connecting to MQTT broker - Device ${device}:`, err);
    });

    client.on("close", () => {
      console.log(`Disconnected from MQTT broker - Device ${device}`);
    });
  }
}

// Get the shift for the device
function getShift(device) {
  if (device <= 5) {
    return "day"; // Devices 01-05 on day shift
  } else if (device <= 10) {
    return "night"; // Devices 06-10 on night shift
  } else {
    return "evening"; // Devices 11-20 on evening shift
  }
}

// Start the simulation
startSimulation();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received.");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received.");
  process.exit(0);
});
