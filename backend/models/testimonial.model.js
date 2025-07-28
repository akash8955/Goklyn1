const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    feedback: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
