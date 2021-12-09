const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});


app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});