var admin = require("firebase-admin");

// importing credential key for the firebase admin sdk service account
const { credentials } = require("../credentials");

admin.initializeApp({
  // allowing usage of database calls from local server without deploying
  credential: admin.credential.cert(credentials),
  // links to the firestore database
  databaseURL: "https://catchy-codas.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
