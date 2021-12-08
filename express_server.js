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

const generateRandomString = function(){
 return Math.random().toString(36).substr(2, 6);
};
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});