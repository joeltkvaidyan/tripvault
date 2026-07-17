const express = require('express');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/upload');

const router = express.Router();

// All trip routes require a valid JWT
router.use(protect);

// Helper: check if a string is a valid Mongo ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   POST /api/trips
// @desc    Create a new trip, linked to the authenticated user
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, destination, startDate, endDate, description, rating } = req.body;

    if (!title || !destination) {
      return res.status(400).json({ success: false, message: 'Title and destination are required' });
    }

    if (rating !== undefined && rating !== null && rating !== '' && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const trip = await Trip.create({
      title,
      destination,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      description,
      rating: rating || undefined,
      user: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Trip created successfully', trip });
  } catch (err) {
    console.error('Create trip error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while creating trip' });
  }
});

// @route   GET /api/trips
// @desc    Get all trips belonging to the logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: trips.length, trips });
  } catch (err) {
    console.error('Get trips error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching trips' });
  }
});

// @route   GET /api/trips/:id
// @desc    Get a single trip by ID (must belong to logged-in user)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this trip' });
    }

    return res.status(200).json({ success: true, trip });
  } catch (err) {
    console.error('Get trip error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching trip' });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update a trip (ownership check required)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this trip' });
    }

    const { title, destination, startDate, endDate, description, rating } = req.body;

    if (rating !== undefined && rating !== null && rating !== '' && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    if (title !== undefined) trip.title = title;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (description !== undefined) trip.description = description;
    if (rating !== undefined) trip.rating = rating;

    await trip.save();

    return res.status(200).json({ success: true, message: 'Trip updated successfully', trip });
  } catch (err) {
    console.error('Update trip error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while updating trip' });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete a trip (ownership check required)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();

    return res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Delete trip error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while deleting trip' });
  }
});

// @route   POST /api/trips/:id/upload
// @desc    Upload a photo for a trip; attaches the Cloudinary URL to the trip
//          (sets coverImage if it isn't set yet, always appended to photos[])
// @access  Private (owner only)
router.post('/:id/upload', uploadSingleImage, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this trip' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const imageUrl = req.file.path; // secure URL returned by multer-storage-cloudinary

    trip.photos.push(imageUrl);
    if (!trip.coverImage) {
      trip.coverImage = imageUrl;
    }

    await trip.save();

    return res.status(200).json({ success: true, message: 'Photo uploaded successfully', trip });
  } catch (err) {
    console.error('Upload trip photo error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while uploading photo' });
  }
});

module.exports = router;
