if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const port = 8082;
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

//files 
const Listing = require("./models/listings");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

//Routes
const listingRoutes = require("./router/listings");
const reviewsRoutes = require("./router/reviews");
const userRoutes = require("./router/user");
const wrapAsync = require('./utils/wrapAsync');



app.set("view engine", "ejs");
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(methodOverride("method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const dbUrl = process.env.MONGODB_URI;

main().then(() => {
    console.log("Successful DB connection");
}).catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
});
store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

//express session 
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

//passport for user authentication and authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/whoami", (req, res) => {
//     res.json({
//         loggedIn: req.isAuthenticated(),
//         user: req.user ? req.user.username : null,
//         sessionId: req.sessionID
//     });
// });

//demo user to check if authentication works
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "demouser1@gmail.com",
//         username: "demouser"
//     });

//     let regisUser = await User.register(fakeUser, "demo101");
//     res.send(regisUser);
// });

//all listings are visible here
app.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings, currCategory: null});
    
}));

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

//custom middleware and error handling
app.all("{*splat}", (req, res, next) => {
    console.log("404 for:", req.method, req.originalUrl);
    next(new ExpressError(404, "Page Not Found"));
});

// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong" } = err;
//     res.status(statusCode).render("error.ejs", { err, statusCode, message });
// });
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // response already sent, let Express close it safely
    }

    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err, statusCode, message });
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});