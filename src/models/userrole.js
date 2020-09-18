const mongoose = require('mongoose')


const roleSchema = new mongoose.Schema({
    
    postTitle: {
        type: String, //post write up
        trim: true, 
        // required: true
    },
    postBody: {
        type: String,
        trim: true,
        // required: true
    },
    postPicture: {
        type: Buffer,  //post with picture
        required: false
    },  
    postVideo: {
        type: Buffer, //post with video
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})


const UserRole = mongoose.model('UserRole', roleSchema)


module.exports = UserRole