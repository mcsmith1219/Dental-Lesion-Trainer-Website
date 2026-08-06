const userDatabase = [
  { username: "user1", password: "password", email: "user1@gmail.com" },
  { username: "user2", password: "password", email: "user2@gmail.com" },
  { username: "user3", password: "password", email: "user3@gmail.com" }
];

function findUserByUsername(username) {
  return userDatabase.find(function (user) {
    return user.username === username;
  });
}

function findUserByEmail(email) {
  return userDatabase.find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });
}
