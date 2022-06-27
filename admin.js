const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const validator = require('validator')
const AdminRole = require('./adminrole')
const AdminComment = require('./admincomment')

const AdminSchema = new mongoose.Schema({
    // perform some validation and sanitization
       fullName: {
           firstName: String,
           middleName: String,
           lastName: String
       },
       userName: {
           type: String,
           required: true,
           trim: true,
           unique: true,
           validate (value) { 
               if (value.toLowerCase().includes('Number')) {
                   throw new Error('try another username without numbers')
               }
           }
       },
       address: {
        country: String,
        state: String,
        street: String,
        postalCode: Number
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


//allow mongoose detect the owner of a given 'comment' 
   AdminSchema.virtual('comment', {
       ref: 'AdminComment', 
       localField: '_id',
       foreignField: 'ownerId'
   })

   
// allow mongoose detect Admin role'
AdminSchema.virtual('role', {
    ref: 'AdminRole',  
    localField: '_id', 
    foreignField: 'ownerId' 
})


// determine data to be sent to the Admin
AdminSchema.methods.toJSON = function () {
    const admin = this
    const AdminObject = admin.toObject()
    //WE ARE DELETING THIS INFO TO AVIOD HACKERS ACCESSING THEM
    delete AdminObject.password
    delete Adminbject.tokens
    delete AdminObject.avatar

    return Adminbject
}


// generate token for every signed up / signed In User
AdminSchema.methods.generateAuthToken = async function () {
    const admin = this

    const token = jwt.sign({_id: admin._id.toString()}, process.env.JWT_SECRET)
    amin.tokens = admin.tokens.concat({ token })
    await admin.save()

    return token
}

   //so lets help a user in case they forgot their password
AdminSchema.statics.findLostAccount = async (email) => {
    const admin = Admin.findOne({ email }) 

        if (!admin) {
            throw new Error("The Email provided isn't in our database")
        }

        return admin
   }



// create a re-usable => for the Admin Instant
   AdminSchema.statics.findUserAndLogIn = async (email, password) => {
    let adminEmail = await Admin.findOne({ email })

    if (!adminEmail) {
        throw new Error('Invalid email or password')
    }

    //ENCRYPT THE PASSWORD
   const isMatch = await bcrypt.compare(password, adminEmail.password)

   if (!isMatch) {
       throw new Error('Invalid email or password!')
   }

    return adminEmail
    
   }


//    update passcode
AdminSchema.statics.updatePassword = async (email, password) => {
    //they ve to provide email b/4 changing the password
    let adminEmail = await User.findOne({ email })

    if (!adminEmail) {
        throw new Error('Invalid update')
    }

    //update password if they are the same
    const comparePass = await bcrypt.compare(password, adminEmail.password)

    if (!comparePass) {
        throw new Error('Invalid update')
    }

    // destory the password and send to database
    if (adminEmail.isModified('password')) {
        adminEmail.password = await bcrypt.hash(adminEmail.password, 8)
    }

    return adminEmail
}



   //  allow us to run some code b/4 - hash the password before saving
 AdminSchema.pre('save', async function (next) {
     const admin = this

     if (admin.isModified('password')) {
         admin.password = await bcrypt.hash(admin.password, 8)
     }

    
     next()
 })



// delete user account and everything related to them in the DATABASE!!
AdminSchema.pre('remove', async function (next) {
    const admin = this

    await Admin.deleteMany({ownerId: admin._id})
    await AdminComment.deleteMany({ownerId: admin._id})

    next()
})



// delete user account and everything related to them in the DATABASE!!
AdminSchema.pre('remove', async function (next) {
    const admin = this

    await AdminRole.deleteMany({ownerId: admin._id})
    await AdminComment.deleteMany({ownerId: admin._id})

    next()
})

const Admin = mongoose.model('Admin', AdminSchema)


module.exports = Admin