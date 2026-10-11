const express = require('express');
const router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { saveRedirectUrl } = require('../middleware');
const userController = require("../controllers/user");

router.get("/signup", userController.signUpForm);
router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.loginForm);
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), saveRedirectUrl, wrapAsync(userController.login));

router.get("/logout", userController.logout)

module.exports = router;