const User = require("../models/user");

//signup
module.exports.signUpForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const regisUser = await User.register(newUser, password);
        req.login(regisUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User created successfully !");
            res.redirect("/");
        })
    } catch (e) {
        req.flash("error", "User Exists already !");
        res.redirect("/signup");
    }
};

//Login
module.exports.loginForm = (req, res) => {
    res.render("users/login");
}
module.exports.login = async (req, res) => {
    let { username } = req.body;
    req.flash("success", `Welcome back ${username}`);
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
};

//logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out !");
        res.redirect("/");
    })
};