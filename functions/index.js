const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");

const {
  getAllTagTeams,
  postTagTeam,
  getTagTeam,
  commentOnTagTeam,
  likeTagTeam,
  unlikeTagTeam,
  deleteTagTeam
} = require("./handlers/tagteams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require("./handlers/users");

// TagTeam Routes
app.get("/tagteams", getAllTagTeams);
app.post("/tagteam", FBAuth, postTagTeam);
app.get("/tagteams/:tagteamId", getTagTeam);
app.post("/tagteams/:tagteamId/comment", FBAuth, commentOnTagTeam);
app.get("/tagteams/:tagteamId/like", FBAuth, likeTagTeam);
app.get("/tagteams/:tagteamId/unlike", FBAuth, unlikeTagTeam);
app.delete("/tagteams/:tagteamId", FBAuth, deleteTagTeam);

// User Routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", markNotificationsRead);

// This will run the routes from the express app to the Google functions
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/tagteams/${snapshot.data().tagteamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            tagteamId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => console.error(err));
  });

exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/tagteams/${snapshot.data().tagteamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            tagteamId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      let batch = db.batch();
      return db
        .collection("tagteams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const tagteam = db.doc(`tagteams/${doc.id}`);
            batch.update(tagteam, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    }
  });

exports.onTagTeamDelete = functions.firestore
  .document("/tagteams/{tagteamId}")
  .onDelete((snapshot, context) => {
    const tagteamId = context.params.tagteamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("tagteamId", "==", tagteamId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("tagteamId", "==", tagteamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("tagteamId", "==", tagteamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
