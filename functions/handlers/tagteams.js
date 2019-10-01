const { db } = require("../util/admin");

exports.getAllTagTeams = (req, res) => {
  db.collection("tagteams")
    .orderBy("date", "desc")
    .get()
    // once all of the tagteams are received it loops through them
    .then(data => {
      // creating an empty array to store the tagteams
      let tagteams = [];
      // loops through the data
      data.forEach(doc => {
        // adds each document data into the tagteams array
        tagteams.push({
          tagteamId: doc.id,
          tagteamhandle: doc.data().tagteamhandle,
          date: doc.data().date,
          event: doc.data().event,
          users: doc.data().users,
          location: doc.data().location,
          tags: doc.data().tags,
          userhandle: doc.data().userhandle,
          userImage: doc.data().userImage
        });
      });
      // returns all of the tagteams in an array of json objects
      return res.json(tagteams);
    })
    // console logs any errors that occur in the get process
    .catch(err => console.error(err));
};

exports.postTagTeam = (req, res) => {
  // This if statement checks to make sure that the method is a POST method
  // to add a new tagteam, and the user doesn't accidentally call the function
  // as a GET request.
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed!" });
  }

  // This is pulling the information from the user to create the new tagteam
  const newTagTeam = {
    tagteamHandle: req.body.tagteamhandle,
    date: new Date().toISOString(),
    event: req.body.event,
    users: req.body.users,
    location: req.body.location,
    tags: req.body.tags,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    likeCount: 0,
    commentCount: 0
  };

  // This is adding the tagteam to the firestore
  db.collection("tagteams")
    .add(newTagTeam)
    // once added it responds with the document id in a message object
    .then(doc => {
      const resTagTeam = newTagTeam;
      resTagTeam.tagteamId = doc.id;
      res.json({ resTagTeam });
    })
    // catches any issues in the post method
    .catch(err => {
      // returns a 500 status code if there is an error, and sends the
      // console logs any errors that occur in the process
      console.error(err);
      // following json object error message in response.
      res.status(500).json({ error: "Error!!! Something Went Wrong!!!" });
    });
};

// Get One TagTeam
exports.getTagTeam = (req, res) => {
  let tagteamData = {};
  db.doc(`/tagteams/${req.params.tagteamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Tag Team not found" });
      }
      tagteamData = doc.data();
      tagteamData.tagteamId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("tagteamId", "==", req.params.tagteamId)
        .get();
    })
    .then(data => {
      tagteamData.comments = [];
      data.forEach(doc => {
        tagteamData.comments.push(doc.data());
      });
      return res.json(tagteamData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Comment on a Tag Team
exports.commentOnTagTeam = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    tagteamId: req.params.tagteamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/tagteams/${req.params.tagteamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Tag Team not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Like a Tag Team
exports.likeTagTeam = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("tagteamId", "==", req.params.tagteamId)
    .limit(1);

  const tagteamDocument = db.doc(`/tagteams/${req.params.tagteamId}`);

  let tagteamData;

  tagteamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        tagteamData = doc.data();
        tagteamData.tagteamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Tag Team not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            tagteamId: req.params.tagteamId,
            userHandle: req.user.handle
          })
          .then(() => {
            tagteamData.likeCount++;
            return tagteamDocument.update({ likeCount: tagteamData.likeCount });
          })
          .then(() => {
            return res.json(tagteamData);
          });
      } else {
        return res.status(400).json({ error: "Tag Team already liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Unlike a Tag Team
exports.unlikeTagTeam = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("tagteamId", "==", req.params.tagteamId)
    .limit(1);

  const tagteamDocument = db.doc(`/tagteams/${req.params.tagteamId}`);

  let tagteamData;

  tagteamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        tagteamData = doc.data();
        tagteamData.tagteamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Tag Team not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Tag Team not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            tagteamData.likeCount--;
            return tagteamDocument.update({ likeCount: tagteamData.likeCount });
          })
          .then(() => {
            res.json(tagteamData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Delete a Tag Team
exports.deleteTagTeam = (req, res) => {
  const tagteamDocument = db.doc(`/tagteams/${req.params.tagteamId}`);
  tagteamDocument
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Tag Team not found" });
      }
      console.log(doc.data());
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return tagteamDocument.delete();
      }
    })
    .then(() => {
      res.json({ message: "Tag Team deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
