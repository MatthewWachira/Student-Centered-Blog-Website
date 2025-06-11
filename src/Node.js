
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function deleteNonStrathmoreUsers() {
  const listUsersResult = await admin.auth().listUsers();
  for (const userRecord of listUsersResult.users) {
    if (!userRecord.email.endsWith("@strathmore.edu")) {
      await admin.auth().deleteUser(userRecord.uid);
      console.log(`Deleted user: ${userRecord.email}`);
    }
  }
}

deleteNonStrathmoreUsers();