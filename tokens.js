const mongoose = require('mongoose')

//set password reset
const tokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "admin",
      },
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,// this is the expiry time in seconds
  
    },
})


modules.exports = mongoose.model("Token", tokenSchema)