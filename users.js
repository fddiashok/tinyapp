const bcrypt = require('bcrypt');
module.exports = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user1@example.com',
    password: bcrypt.hashSync("123", 10)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync("abc", 10)
  }
}