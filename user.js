const sharp = require('sharp')
const multer = require('multer')
const express = require('express')
const Token = require('../models/tokens')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeMail, accountDeleteMail, resetPasswordMail } = require('../emails/account')

                    ' UNIX EPOCH  '
                    
                    ' | ( Y ) |   '
                    '  (  |  )    '
                    '  (__|__)    '


const router = new express.Router()

//restrict profile pic upload - here i called the multer function which enables 
//image uploads; i:e profile pictures. i also made sure that the image size should be 
// <= 1.5MB
const profilePic = multer({
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb( new Error('please upload an image'))
        }
        cb(undefined, true)
    }
})



// Create a New User ROUTE
// method - POST
// content-type - application/json
// route - /users
// this is the route that handles the creation of new users, upon creating account,
// the user is authenticated and logged in... 
// to access the error directly from the server, target the "e.message" object converted to string
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {

        await user.save()
        sendWelcomeMail(user.name, user.email)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    } catch (e) {
        res.status(400).send(e.message)
    }
})


// by forcing users to login, we ve created a R/ship
// between users and the post they will write in the future
// method - POST
// content-type - application/json
// route - /users/login
// here the user provides their email and password to login
router.post('/users/login', async (req, res) => {
    
    try {
     const user = await User.findUserAndLogIn(req.body.email, req.body.password)
      const token = await user.generateAuthToken()

      if (!user) {
         res.status(404).send()

     }
     res.status(200).send({user, token})

    } catch (e) {
        res.status(500).send(e.message)
    }

})

// method - GET
// content-type - application/json
// route - /users/me
// here the users profile is made available to them
// read a user profile - GET http request
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


// method - POST
// content-type - form-data
// route - /users/me/upload
// here the user uploads a profile image to the database, nothing is coming back, 
// we re just saving to database
//upload && change profile image route
router.post('/users/me/upload', auth, profilePic.single('avatar'), async (req, res) => {
const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
   
 req.user.avatar = buffer
    await req.user.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


// method - GET
// content-type - form-data
// route  - /users/:id/avatar
// here we are sending back the image the user provided as a profile picture
// as we serve up the image, the image ID in the database is required while targeting this route
//serve up profile image
router.get('/users/:id/avatar', async (req, res) => {

    try {

            const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('no record')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

// method - DELETE
// content-type - form-data
// route - /users/me/avatar
// here the user deletes their profile picture...BYE BYE png
//delete profile pcture
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined

    await req.user.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// method  - GET
// content-type - application/json
// route - /users/:id
// this route is specifically designed to send back a welcome message to the user,
// like this..... `$Hi {user.userName}`

// read a user by id and send a welcome message - GET http method
router.get('/users/:id', auth, async (req, res) => {
const _id = req.params.id

    try {
        const userId = await User.findById(_id)

        if (!userId) {
            return res.status(404).send()
        }

        res.status(200).send({message:`Hi ${userId.userName}`})

    } catch (e) {
        res.status(500).send(e.message)
    }  
})


// method - PATCH 
// content-type - application/json
// route  - /users/me
// here we allow the user to update some fileds which includes...
// firstName, middleName, lastName, userName, email
// update a user by Id - PATCH http method
router.patch('/users/me',  auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'middleName', 'lastName', 'userName', 'email']
    const isValidUpdates = updates.every((update) => allowedUpdates.includes(update))
 
         if (!isValidUpdates) {
             return res.status(400).send({error: 'invalid updates'})
         }
         
     try {

         updates.forEach((update) => req.user[update] = req.body[update])
         await req.user.save()
         res.status(200).send(req.user)
         
     } catch (e) {
         res.status(500).send(e.message)
     }   
 })


// method - POST 
// content-type - application/json
// route - /users/forgot-passsword
// route handeler coming soon...
//email a token generated URL via JWT b-b /\ {$qt} = pr

router.post( `user/${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`, async (req, res, email) => {

    const user = await User.findOne({ email });
  
    if (!user) throw new Error("User does not exist");
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  
    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();
      resetPasswordMail(req.user.email,"Password Reset Request",{name: req.user.name,link: link,},"./template/requestResetPassword.handlebars");

})

//tell them that password was reset successfully

router.post('/user/password', async (userId, token, password) => {
    let passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
      throw new Error("Invalid or expired password reset token");
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      throw new Error("Invalid or expired password reset token");
    }
    const hash = await bcrypt.hash(password, Number(bcryptSalt));
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await User.findById({ _id: userId });
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.name,
      },
      "./template/resetPassword.handlebars"
    );
    await passwordResetToken.delete
    })


    router.get('/listing', auth, async (req, res) => {
        const admin = Admin.findOne({id})
        res.send([{
            id: admin._id,
            type: 'rice',
            prize: 1500
        }, {
            id: admin._id,
            type: 'agbedu',
            prize: 800
        }, {
            id: admin._id,
            type: 'beans',
            prize: 500
        }])
    })


router.post('/user/add', async () => {
  'NEPA NO GREE'
})

//  method - POST
// content-type - application/json
// route - /users/logout
// here we log the user out by filtering the token in the tokens array
 //ok lets kick them out when they are good to go.
 router.post('/users/logout', auth, async (req, res) => {

    try {  
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token           
        })
      
        await req.user.save()
        res.status(200).send()

    }  catch (e) {
        res.status(500).send(e.message)
    }
})

// method - POST
// content-type - application/json
// route - /users/logoutAll
// here we log out all session of the app in any device by setting the tokens array
// equal to an empty array
// logout all session of the App in any device
router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()

    } catch (e) {
        res.status(500).send(e.message)
    }
})

// method - DELETE
// content-type - application/json
// route - /users/me
// ..and the user might want to delete their profile and account in our database
// we give a "go" command to that!!!
//delete User Account - DELETE http method
 router.delete('/users/me', auth, async (req, res) => {
     
    try {

       await req.user.remove()
       accountDeleteMail(req.user.name, req.user.email)
       res.status(200).send()

    } catch (e) {
        res.status(500).send(e.message)
    }
})


module.exports = router