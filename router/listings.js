const express = require('express');
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig")
const upload = multer({ storage });

//files
const Listing = require("../models/listings");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listing");

//create new listing
router.get("/create", isLoggedIn, listingController.createNewListingForm);

router.post("/", isLoggedIn, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.createNewListing));

//search listings 
router.get("/", wrapAsync(listingController.searchListings));

// Display only the logged-in user's listings
router.get("/my-listings", isLoggedIn, wrapAsync(listingController.renderMyListings));

//individual listings here
router.get("/:id", wrapAsync(listingController.showListing));

//edit page
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm));
//update the listing
router.put("/:id/edit", isLoggedIn, isOwner, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.editListing));

//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router; 