const mongoose = require('mongoose')

// this file models the comment for a specific post
const commentSchema  = new mongoose.Schema({
    comment: {
        type: String,
        trim: true,
        // required: true
    },
    commentPicture: {
       type: Buffer
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

}, {
    timestamps: true
})


const UserComment = mongoose.model('UserComment', commentSchema)


module.exports = UserComment