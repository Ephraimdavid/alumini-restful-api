const mongoose = require('mongoose')

// and a user might want to comment in a post, 
// i haven't seen a comment model b/4 but this,
// i think would work for comment model!!!!
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
        // required: false
    },  
    postVideo: {
        type: Buffer, //post with video
    },
    ownerId: { //we need the ID of the user trying to comment!!
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})


const UserRole = mongoose.model('UserRole', roleSchema)


module.exports = UserRole