// Include modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// Set Port
const PORT = 8080;

// Include Databases
var urlDatabase = require('./database');
var usersDatabase = require('./users');
const users = require('./users');
const res = require('express/lib/response');

app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine for the app.
app.set('view engine', 'ejs');

// Set the cookie session, keys, and max age of said cookie.
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

// Helper function to generate strings of 6 characters to use as the 'short' URL

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

// Helper function to identify current users by crossreferencing current user with ID passed in via form.
// returns array of objects that contain certain attribute "attrib"
function filterByAttribute(filteredObj, attrib, value) {
  let fileredObjArray = [];
  for (let obj in filteredObj) {
    if (attrib in filteredObj[obj]) {
      fileredObjArray.push(filteredObj[obj]);
    }
  }
  return fileredObjArray.filter((user) => { return user[attrib] == value });
}

//~~~~~~~~~~~~~~~~~~ GET - ROUTES ~~~~~~~~~~~~~~~~~~~~~


// GET declaration for the homepage.
// If user is logged in, redirect to urls, if not, redirect to login. This is done via checking for a session ID
app.get('/', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET /urls page
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, user: usersDatabase[req.session['user_id']] }
  if (templateVars.user) {
    res.render('urls_index', templateVars);
  } else {
    res.send('Please log in <a href="/login"> here</a>');
  }
})

// GET /register page
app.get('/register', (req, res) => {
  if (!req.session['user_id']) {
    let templateVars = { urls: urlDatabase, user: usersDatabase[req.session['user_id']] };
    res.render('registration', templateVars);
  } else {
    res.redirect('/urls');
  }
})

// GET /login page
app.get('/login', (req, res) => {
  if (!req.session['user_id']) {
    let templateVars = { urls: urlDatabase, user: usersDatabase[req.session['user_id']] }
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
})

// GET page
app.get('/urls/new', (req, res) => {
  let templateVars = { user: usersDatabase[req.session['user_id']] }
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
})

// GET declaration for each individual short URL page.
app.get('/urls/:shortURL', (req, res) => {
  // If user is not signed in, send message to login
  if (!req.session['user_id'] || !usersDatabase[req.session['user_id']]) {
    res.send('Please sign in <a href="/login">here</a>');
    return;
  }
  // If the shortURL cannot be found in the database flag an error.
  if (!urlDatabase[req.params.shortURL]) {
    res.send('That url has not been shortened. Please add it and try again.');
    return;
  }
  // if the current logged in user doesnt match the user ID tied to the url your looking at.
  if (usersDatabase[req.session['user_id']].id !== urlDatabase[req.params.shortURL].userID) {
    res.send('Not you url! <a href="/urls">Choose another</a>');
    return;
  }
  // Set variables to be passed through to the view.
  let shortURLRef = req.params.shortURL
  let templateShowVars = { shortURL: shortURLRef, longURL: urlDatabase[shortURLRef].longURL, user: usersDatabase[req.session['user_id']].id };
  res.render('urls_show', templateShowVars);
})


// GET Declaration to handle incoming requests from the outside.
// Looks for the record of the short url being requested.
// Forwards viewer to applicalble longURL.
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.send('That url has not been shortened with this service');
  }
})


//~~~~~~~~~~~~~~~~~~ POST - ROUTES ~~~~~~~~~~~~~~~~~~~~~

// POST Declaration for the endpoint /urls
// Handles submission of new URLs to be shortened.
// 1. Generates unique ID for the entry.
// 2. Confirms the submission of the url from the form.
// 3. Attaches the current viewer ID to the submission.
// Redirects to the /urls page after successful submission.
app.post('/urls', (req, res) => {
  var getShortURL = generateRandomString()
  urlDatabase[getShortURL] = {};
  urlDatabase[getShortURL]['longURL'] = req.body['longURL'];
  urlDatabase[getShortURL]['userID'] = req.session.user_id;
  res.redirect('/urls/' + getShortURL);
})


//Add login cookie
app.post("/login", (req, res) => {
  let matchingUser = filterByAttribute(users, "email", req.body.email);
  if (!matchingUser.length) {
    res.status(403).send({ error: "Invalid email or password ,please try again" });
  }
  else if (!bcrypt.compareSync(req.body.password, matchingUser[0].password)) {
    res.status(403).send({ error: "Invalid email or password, please try again" });
  }
  else {
    req.session.user_id = matchingUser[0].id;
    res.redirect("/");
  }
});

//handle user registration
app.post("/register", (req, res) => {

  //check for empty registration fields
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ error: "Invalid username or password" });
  }

  //check if email matches any user in database
  let emailMatches = filterByAttribute(users, "email", req.body.email);
  if (emailMatches.length) {
    res.status(400).send({ error: "Email already registered.Please login" });
  } else {
    let id = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[id] = { id: id, email: req.body.email, password: hashedPassword };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});



// POST Declaration for the /update endpoint found for each short URL after creation.
app.post('/urls/:shortURL/update', (req, res) => {
  let shortURLRef = req.params.shortURL;
  urlDatabase[shortURLRef].longURL = req.body.longURL;
  res.redirect('/urls/');
})

// POST Declaration to handle deleting of a url.
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})



// POST Declaration for the /logout endpoint.
// Deletes session cookie and redirects.
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});



// Reflect back the port on the server side.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})