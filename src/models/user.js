const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const validator = require('validator')
const UserRole = require('./userrole')
const UserComment = require('./usercomment')

const userSchema = new mongoose.Schema({
    // perform some validation and sanitization
       firstName: {
           type: String,
           required: true,
           lowercase: true,
           trim: true
       },
       middleName: {
           type: String,
           required: true,
           lowercase: true,
           trim: true
       },
       lastName: {
           type: String,
           required: true,
           lowercase: true,
           trim: true
       },
       userName: {
           type: String,
           required: true,
           trim: true,
           unique: true,
           validate (value) { // if you ever come across this code; the function isn't working as expected.
               if (value.toLowerCase().includes('Number')) {
                   throw new Error('try another username without numbers')
               }
           }
       },
       address: {
        country: String,
        state: String,
        street: String,
        postalCode: String
    }, 
    bio: {
        highSchool: String,
        university: String,
        occupation: String
    },
       phone: {
           type: String,
           required: true, 
           unique: true
       },
       dateOfBirth: {
           type: Date,
           required: true,
       },
       email: {
           type: String,
           required: true,
           trim: true,
           unique: true,
           lowercase: true,
           validate (value) {
               if (!validator.isEmail(value)) {
                   throw new Error('please provide a valid email!')
               }
           }
       },
       password: {
           type: String,
           required: true,
           minlength: 7,
           trim: true,
           validate (value) {
               if (value.toLowerCase().includes('password')) {
                   throw new Error('please do not include the word password')
               }
           }
       }, 
       tokens: [{
           token: {
               type: String,
               required: true
           }
       }],
       avatar: {
           type: Buffer
       }
   }, {
       timestamps: true
   })


// allow mongoose detect the owner of a given 'UserRole'
   userSchema.virtual('role', {
       ref: 'UserRole',  // the model name
       localField: '_id', // the prop in UserRole that connects the user-owner i:e user Id
       foreignField: 'ownerId' //the prop in 'operation' model's that connects User model
   })

//allow mongoose detect the owner of a given 'comment' 
   userSchema.virtual('comment', {
       ref: 'UserComment', 
       localField: '_id',
       foreignField: 'ownerId'
   })



// determine data to be sent to the user
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// generate token for every signed up / signed In User
userSchema.methods.generateAuthToken = async function () {
    const user = this

    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

   //so lets help a user in case they forgot their password
userSchema.statics.findLostAccount = async (email) => {
    const user = User.findOne({ email }) 

        if (!user) {
            throw new Error("The Email provided isn't in our database")
        }

        return user
   }



// create a re-usable => for the User Instant
   userSchema.statics.findUserAndLogIn = async (email, password) => {
    let userEmail = await User.findOne({ email })

    if (!userEmail) {
        throw new Error('Invalid email or password')
    }


   const isMatch = await bcrypt.compare(password, userEmail.password)

   if (!isMatch) {
       throw new Error('Invalid email or password!')
   }

    return userEmail
    
   }


//    update passcode
userSchema.statics.updatePassword = async (email, password) => {
    //they ve to provide email b/4 changing the password
    let userEmail = await User.findOne({ email })

    if (!userEmail) {
        throw new Error('Invalid update')
    }

    //update password if they are the same
    const comparePass = await bcrypt.compare(password, userEmail.password)

    if (!comparePass) {
        throw new Error('Invalid update')
    }

    // destory the password and send to database
    if (userEmail.isModified('password')) {
        userEmail.password = await bcrypt.hash(userEmail.password, 8)
    }

    return userEmail
}



   //  allow us to run some code b/4 - hash the password before saving
 userSchema.pre('save', async function (next) {
     const user = this

     if (user.isModified('password')) {
         user.password = await bcrypt.hash(user.password, 8)
     }

    
     next()
 })



// delete user account and everything related to them in the DATABASE!!
userSchema.pre('remove', async function (next) {
    const user = this

    await UserRole.deleteMany({ownerId: user._id})
    await UserComment.deleteMany({ownerId: user._id})

    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User