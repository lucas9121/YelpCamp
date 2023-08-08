const Campground = require('../models/campground')

module.exports = {index, newForm, create, show, edit, update, Delete}


// Index
async function  index(req, res) {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { what: "All Campgounds", campgrounds})
}

// New
function newForm(req, res) {
    res.render('campgrounds/new', {what: "Add Campground"})
}

// Create
async function create(req, res, next) {
    // if(!req.body.campgground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground)
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = req.user._id
    await newCampground.save()
    //dismissible message
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${newCampground._id}`)
}

// Show
async function show(req, res, next) {
    // nested  reviews populate
    const campground = await Campground.findById(req.params.id).populate({
        //populate the all the reviews in campground
        path:'reviews',
        populate: {
            // then populate the author of the reviews
            path: 'author'
        }
        // populate author of campground
    }).populate('author')
    if(!campground){ 
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground, what: campground.title})
}

// Edit
async function edit(req, res, next) {
    const campground = await Campground.findById(req.params.id)
    if(!campground){ 
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {what: `Update ${campground.title}`, campground})
}

// Update
async function update(req, res, next) {
    const {id} = req.params
    // "run validators " update the document according to the schema rules.
    // "new" returns the updated document, rather than the original
    const updatedCampgground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true}, {new: true})

    // dismisible message
    req.flash('success', 'Sucessfully updated campground.')
    res.redirect(`/campgrounds/${updatedCampgground._id}`)
}

// Delete
async function Delete(req, res, next) {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Sucessfully deleted campground.')
    res.redirect('/campgrounds')
}