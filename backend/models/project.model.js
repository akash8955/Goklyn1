const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: false
    },
    photoPublicId: {
        type: String,
        required: false
    },
    projectUrl: {
        type: String
    },
    githubUrl: {
        type: String
    },
    tags: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
