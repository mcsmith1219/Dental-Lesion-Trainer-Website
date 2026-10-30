// Reads and writes users.
const {USERS_CSV_PATH} = require('../config');
const {readCsvFile, appendCsvRow} = require('./csv');

function readCsvUsers() {
  return readCsvFile(USERS_CSV_PATH).map((user, index) => {

    user.user_id = user.user_id || String(index + 1).padStart(5, '0');
    user.id = Number.parseInt(user.user_id, 10);

    if (Number.isNaN(user.id)) {
      user.id = index + 1;
    }

    return user;
  });
}

function appendCsvUser(user) {
  appendCsvRow(USERS_CSV_PATH, [user.username, user.password, user.email, user.role, user.user_id]);
}

module.exports = {readCsvUsers, appendCsvUser};
