const mongoose = require('mongoose')

//ADIMN ROLE
const AdminSchema = new mongoose.Schema({
    
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
    postVideo: { //NODEJS IS YET TO MAKE VIDEO BUFFER PUBLIC
        type: Buffer, //post with video
    },
    ownerId: { //we need the ID of the Admin trying to comment!!
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    }
}, {
    timestamps: true
})


const AdminRole = mongoose.model('AdminRole', AdminSchema)


module.exports = AdminRole