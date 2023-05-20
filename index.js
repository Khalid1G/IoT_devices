const mqtt = require("mqtt");

// MQTT broker details
const brokerUrl = "mqtt://gounane.ovh";
const options = {
  clientId: "mqtt-test-khalid",
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
});

// MQTT client disconnected event
client.on("disconnect", () => {
  console.log("Disconnected from MQTT broker");
});

// MQTT client error event
client.on("error", (err) => {
  console.error("MQTT client error:", err);
});

//MQTT reconnect
client.on("reconnect", () => {
  console.log("Reconnected to MQTT broker");
});

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

// Send random number every minute
setInterval(() => {
  let randomNumber;
  if (isNighttime() || isLunchtime() || isPauseTime()) {
    randomNumber = 0;
  } else {
    const probability = Math.random();
    if (probability < 0.2) {
      randomNumber = 0; // 20% probability for 0
    } else if (probability < 0.5) {
      randomNumber = 80; // 30% probability for 80
    } else if (probability < 0.55) {
      randomNumber = getRandomNumber(15, 80); // 5% probability for values between 15 and 80
    } else {
      randomNumber = getRandomNumber(80, 85); // Remaining 45% probability for values between 80 and 85
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
}, 60000); // Send message every minute

// Send random number every minute
setInterval(() => {
  let randomNumber;
  if (isNighttime()) {
    randomNumber = 0;
  } else {
    const probability = Math.random();
    if (probability < 0.3) {
      randomNumber = 0; // 30% probability for 0
    } else if (probability < 0.5) {
      randomNumber = 80; // 20% probability for 80
    } else if (probability < 0.55) {
      randomNumber = getRandomNumber(15, 80); // 5% probability for values between 15 and 80
    } else {
      randomNumber = getRandomNumber(80, 85); // Remaining 54% probability for values between 80 and 85
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
}, 100); // Send message every minute
