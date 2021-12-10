const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");// Cookie Parser Middleware



app.set("view engine", "ejs") //setup view engine to ejs
app.use(cookieParser());// bring in cookie-parse middleware which would fetch details from req header and return an object

//#############################################
//~~~~~~~~~~~~~~~~~~ DB / HARDCODES ~~~~~~~~~~~~~~~~~~~~~
//#############################################

//default port
const PORT = 8080;


//URL DATABASE
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};



//USER DB
const users = {
  "user1": {
    id: "user1",
    email: "user1@example.com",
    password: "123"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "abc"
  }
}



// HeELPER FUNCTIONS
const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

// returns array of objects that contain certain attribute "attrib"
function filterByAttribute(UsersObj, attrib, value) {//
  let fileredObjArray = [];
  for (let obj in UsersObj) {
    if (attrib in UsersObj[obj]) {
      fileredObjArray.push(UsersObj[obj]);
    }
  }
  const result = fileredObjArray.filter((individualUser) => { return individualUser[attrib] == value });
  return result;
}



//#############################################
//~~~~~~~~~~~~~~~~~~ GET - ROUTES ~~~~~~~~~~~~~~~~~~~~~
//#############################################

// if user try to access '/' route
app.get('/', (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user_id: users[user_id],
  }
  res.render("login", templateVars);
});

//Login existing users

app.get('/login', (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user_id: users[user_id],
  }

  res.render("login", templateVars);
});




//To register new user
app.get('/register', (req, res) => {
  const user_id = req.cookies['user_id'];
  // console.log(user_id);
  // console.log(users[user_id]);
  res.render("register");
});



app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    res.status(401).redirect('/login');
  }
  const templateVars = {
    user_id: users[user_id],
    urlDatabase: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user_id = req.cookies['user_id'];
  
  if (!user_id) {
    res.status(401).redirect('/login');
  }

  const templateVars = {
    user_id: users[user_id],
    urlDatabase: urlDatabase
  };
  res.render("urls_new", templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
  const user_id = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  const templateVars = {
    user_id: user_id,
    shortURL,
    longURL,
  };
  res.render('urls_show', templateVars); // render and pass object to urls_show template
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//#############################################
//~~~~~~~~~~~~~~~~~~ POST - ROUTES ~~~~~~~~~~~~~~~~~~~~~
//#############################################

// To register new user
app.post("/register", (req, res) => {
  // validate email and password
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("email and password can't be blank");
  }

  //check if email matches any user in database
  let emailMatches = filterByAttribute(users, "email", email);

  if (emailMatches.length) {
    console.log(`status: 400-2`);
    res.status(400).send({ error: "Email already registered." });
  } else {
    const id = generateRandomString();

    // UPDATE USERS DATABASE
    users[id] = { id, email, password };

    // SET COOKIE TO RANDOMLY GENERATED ID : user_id
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});


// LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //validate email and passwords aren't empty
  if (!email || !password) {
    return res.status(403).send("email and password can't be blank");
  }

  // Check if user exists or not
  let matchingUser = filterByAttribute(users, "email", email);


  if (!matchingUser.length) {
    return res.status(403).send({ error: "Email doesn't exists, please register" });
  }
  else {
    // check for password match
    let matchingUser = filterByAttribute(users, "password", password);

    if (!matchingUser.length) {
      return res.status(403).send({ error: "Password is incorrect, please try again" });
    }
    else {
      const user_id = matchingUser[0]["id"]
      res.cookie("user_id", user_id);
      res.redirect('/urls');
    }
  }
});

// POST request made by user when user tries to edit a URL

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  // res.redirect(`/urls/${shortURL}`)       // Redirect to /urls/randomid
});

app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]["longURL"]=longURL;
  // console.log(urlDatabase)
  res.redirect('/urls');

});

app.post('/urls/new', (req, res) => {
  const longURL = req.body.longURL;
  console.log(longURL);
  res.redirect('/urls');
})

// To logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//#############################################
//~~~~~~~~~~~~~~~~~~ DELETE - ROUTES ~~~~~~~~~~~~~~~~~~~~~
//#############################################


//Delete a row
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})



//#############################################
//~~~~~~~~~~~~~~~~~~ LISTEN ~~~~~~~~~~~~~~~~~~~~~
//#############################################
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});