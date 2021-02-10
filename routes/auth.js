const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

// Signup
router.get("/signup", (req, res, next) => {
  res.render("signup");
});

// Profile
router.get('/profile', (req, res) => {
  res.render('profile');
})

// POST Signup
router.post('/signup', (req, res) => {

  const { username, password } = req.body;
  console.log(username, password);

  //Check, if username is empty
  if (username === '') {
    res.render('signup', { message: 'Your username cannot be empty' });
    return
  }

  //Check, if password has minumum 8 chars
  if (password.length < 8) {
    return res.render('signup', { message: 'Your password has to be 8 chars min' });
  }

  // Check if the username already exists
  User.findOne({ username: username })
    .then(userFromDB => {

      // Check, if username is already taken
      if (userFromDB !== null) {
        res.render('signup', { message: 'Username is already taken' });
      } else {

        // Add new user withcredentials to the DB
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt)
        
        User.create({ username: username, password: hash })
          .then(userFromDB => {
            console.log(userFromDB);
            res.redirect('/');
          })
      }
    })
    .catch(err => {
      console.log(err);
    })
})

// Login
router.get("/login", (req, res, next) => {
  console.log('go to log in view');
  res.render("login");
});

// POST Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check, if the entered username exists in the DB
  User.findOne({ username: username })
    .then(userFromDB => {
      if (userFromDB === null) {
        // If user doesn't exist, show login again
        res.render('login', { message: 'Invalid credentials' });
        return;
      }
      // If username exists in DB, check, if the password is correct
      if (bcrypt.compareSync(password, userFromDB.password)) {
        // console.log('user from db: ', userFromDB);
        req.session.user = userFromDB;
        console.log('req.session.user', req.session.user);
        res.redirect('/profile');
      } else {
        res.render('login', { message: 'Invalid credentials' });
      }
    })
    .catch(e => {
      console.log(e);
    })
})



module.exports = router;