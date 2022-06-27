const mongoose = require('mongoose')

// this file models the comment of an Admin post
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
        ref: 'Admin'
    }

}, {
    timestamps: true
})


const AdminComment = mongoose.model('AdminComment', commentSchema)


module.exports = AdminComment