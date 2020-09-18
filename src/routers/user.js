const sharp = require('sharp')
const multer = require('multer')
const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeMail, accountDeleteMail, resetPasswordMail } = require('../emails/account')

const router = new express.Router()

//restrict profile pic upload
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



// Create a New User - POST http method
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


// read a user profile - GET http request
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


//upload && change profile image route
router.post('/users/me/upload', auth, profilePic.single('avatar'), async (req, res) => {
const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
   
 req.user.avatar = buffer
    await req.user.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


//delete profile pcture
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined

    await req.user.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


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


 
// lets forgive the user and RETURN them to the DataBase
/*
    ( )
   <| |>   still working on this route though
    ( )
*/
//email a token generated URL via JWT b-b /\ {$qt} = pr
router.post('/users/forgot-password', async (req, res) => {
    try {
        // prototype inherited method  "findEmail"
        const userEmail = await User.findLostAccount(req.body.email) 
       
        if (!userEmail) {
            return res.status(404).send()
        } // "Dear User, how could you forgot your password! you need a donkey kicking😍😍!"
       
        await userEmail.generateAuthToken()
        resetPasswordMail(req.user.name, req.user.tokens.token, req.user.email)
        res.status(200).send('check your email inbox, visit the link to reset your password, if you ever forget your password again, i swear you are going to jail😂😂!')

    } catch (e) {
        res.status(500).send(e.message)
    }
}) 


  //update a user password
 router.get('/reset-password', async (req, res) => {
//   coming soon
 })


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