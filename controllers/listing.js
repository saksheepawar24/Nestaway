const Listing = require("../models/listings");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

//new listing creation form
module.exports.createNewListingForm = (req, res) => {
    res.render("listings/newListing.ejs");
};
//creating new listing - POST METHOD
module.exports.createNewListing = async (req, res, next) => {
    let coordinates = await geoCodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send()

    // req.files is now an array because of upload.array()
    let imageArray = req.files.map(file => ({ url: file.path, filename: file.filename }));
    
    // If user specified a cover index, reorder the array so the cover is first
    let coverIndex = parseInt(req.body.coverIndex) || 0;
    if (imageArray.length > 0 && coverIndex < imageArray.length) {
        let coverImage = imageArray.splice(coverIndex, 1)[0];
        imageArray.unshift(coverImage); // Put cover image at index 0
    }

    let listing = req.body.listing;
    let newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.images = imageArray;

    newListing.geometry = coordinates.body.features[0].geometry;
    await newListing.save();

    req.flash("success", "New Listing Created !");
    res.redirect("/");
};

// Search listings by location
module.exports.searchListings = async (req, res) => {
    let { location, category } = req.query;
    let filter = {};

    if (location) {
        filter.location = { $regex: new RegExp(location, "i") };
    }
    if (category) {
        filter.category = category;
    }

    let allListings = await Listing.find(filter);
    
    // Pass currCategory back to view to keep active states highlighted
    res.render("listings/index.ejs", { allListings, currCategory: category || null });
};

// NEW: Display User's Own Listings
module.exports.renderMyListings = async (req, res) => {
    const allListings = await Listing.find({ owner: req.user._id });
    res.render("listings/index.ejs", { allListings, currCategory: null });
};

//individual listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you were searching for does not exist!");
        return res.redirect("/");
    }
    res.render("listings/show.ejs", { listing });
};

//Edit form rendering
module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you were searching for does not exist!");
        return res.redirect("/");
    }

    let originalImgUrls = listing.images.map(img => {
        let url = img.url;
        return url.replace("/upload", "/upload/w_200,h_100");
    });
    res.render("listings/edit.ejs", { listing, originalImgUrls });
};
//Listing Update/Edit - PUT METHOD
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // If new files were uploaded via multer (upload.array)
    if (req.files && req.files.length > 0) {
        let newImageArray = req.files.map(file => ({ url: file.path, filename: file.filename }));
        
        // Check if user wants to replace all images or append them
        // If your form has a checkbox or selector for "replace all images":
        if (req.body.replaceImages === "on") {
            listing.images = newImageArray;
        } else {
            // Otherwise, append new images to the existing ones
            listing.images.push(...newImageArray);
        }

        // Handle cover index choice if specified
        let coverIndex = parseInt(req.body.coverIndex);
        if (!isNaN(coverIndex) && coverIndex < listing.images.length) {
            let coverImage = listing.images.splice(coverIndex, 1)[0];
            listing.images.unshift(coverImage); // Put chosen cover image at index 0
        }
        await listing.save();
    }

    req.flash("success", "Listing Updated  !");
    res.redirect("/");
};

//DELETE Listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted !");
    res.redirect("/");
};