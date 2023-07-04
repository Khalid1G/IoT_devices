// Load environment variables from .env file
require("dotenv").config();

// Import the MQTT library
const mqtt = require("mqtt");

// Import the node-cron library
const cron = require("node-cron");

// Extract MQTT broker details from environment variables
const {
  MQTT_HOST,
  MQTT_PORT,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  TOPIC_PREFIX,
  DEVICES_NUMBER,
} = process.env;

if (
  !MQTT_HOST ||
  !MQTT_PORT ||
  !MQTT_USERNAME ||
  !TOPIC_PREFIX ||
  !DEVICES_NUMBER
) {
  console.error(
    "Please make sure that the following environment variables are set: MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, TOPIC_PREFIX, DEVICES_NUMBER"
  );
  process.exit(1);
}

// Construct the MQTT broker URL
const MqttUrl = `${MQTT_HOST}:${MQTT_PORT}`;

/**
 * Generate a random number between min and max (inclusive).
 *
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The generated random number.
 */
function getRandomNumber(min, max) {
  // Suggestion 1: Validate that 'min' is less than or equal to 'max'.
  if (min > max) {
    throw new Error("'min' must be less than or equal to 'max'");
  }

  // Suggestion 2: Add validation to ensure that 'min' and 'max' are integers.
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error("'min' and 'max' must be integers");
  }

  // Suggestion 3: Add a check to handle the case where 'min' and 'max' are equal.
  if (min === max) {
    return min;
  }

  // Original code
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if it's nighttime for the given shift.
 *
 * @param {string} shift - The shift value.
 * @returns {boolean} True if it's nighttime, false otherwise.
 */
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

/**
 * Check if it's pause time for the given shift.
 *
 * @param {string} shift - The shift value.
 * @returns {boolean} True if it's pause time, false otherwise.
 */
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

/**
 * Generate random number based on probability distribution.
 *
 * @returns {number} The generated random number.
 */
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

/**
 * Start sending MQTT messages for a device.
 *
 * @param {string} deviceName - The name of the device.
 * @param {Object} client - The MQTT client object.
 * @param {string} shift - The shift value.
 */
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

  // Start the message sending with a delay of 60 seconds
  setTimeout(() => {
    sendMessage(); // Send the first message immediately
    // Schedule subsequent messages every 60 seconds using node-cron
    cron.schedule("*/60 * * * * *", () => {
      sendMessage();
    });
  }, getRandomNumber(0, 60000)); // Introduce a random delay between 0 and 60 seconds
}

/**
 * Create MQTT options for the client.
 *
 * @param {string} clientId - The client ID.
 * @returns {Object} The MQTT options.
 */
function createOptions(clientId) {
  return {
    clientId: clientId,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  };
}

/**
 * Start the simulation by connecting devices to the MQTT broker and sending messages.
 */
function startSimulation() {
  for (let i = 0; i < DEVICES_NUMBER; i++) {
    const device = (i + 1).toString().padStart(2, "0");
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

/**
 * Get the shift for the device.
 *
 * @param {string} device - The device name.
 * @returns {string} The shift value.
 */
function getShift(device) {
  if (device <= 10 || device >= 30) {
    return "day";
  } else if (device <= 15) {
    return "night";
  } else {
    return "evening";
  }
}

// Start the simulation
startSimulation();
