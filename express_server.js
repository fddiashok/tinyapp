const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");// Cookie Parser Middleware



app.set("view engine", "ejs") //setup view engine to ejs
app.use(cookieParser());// bring in cookie-parse middleware which would fetch details from req header and return an object



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// HELPER FUNCTIONS
const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};



// ALL GET REQUSTS
app.get('/urls', (req, res) => {
  
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {

  res.render("urls_new", req.cookies["username"]);
});


app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    username: req.cookies["username"],
    shortURL,
    longURL
  };
  res.render('urls_show', templateVars); // render and pass object to urls_show template
});

app.get('/u/:shortURL', (req, res) => {
  // const shortURL = req.params.shortURL;
  // console.log(shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//All POST REQUESTS

app.post("/logout", (req,res) => {
 res.clearCookie('username');
  // res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  // console.log(longURL);
  const shortURL = generateRandomString();
  // console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)       // Redirect to /urls/randomid
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL]= longURL;
  res.redirect('/urls');
  
})
//Enpoint to handle POST request with sign in button and set cookie to username
app.post('/login',(req,res) => {
  const username = req.body.username;
  // console.log(username);
  res.cookie('username', username);
  res.redirect('/urls');
  

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});