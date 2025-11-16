const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    poster: { type: String, required: true },
    backdrop: { type: String, required: true },
    genres: { type: [String], required: true },
    description: { type: String, required: true },
    year: { type: Number, required: true },
    director: { type: String, required: true },
    cast: { type: [String], required: true },
    rating: { type: Number, required: true },
    runtime: { type: String, required: true }
});

const Movie = mongoose.model('Movie', MovieSchema);

module.exports = Movie;

