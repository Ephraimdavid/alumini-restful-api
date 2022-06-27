const { firstPostMail } = require('../emails/account') 
const UserRole = require('../models/userrole')
const auth = require('../middleware/auth')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')


const router = new express.Router()


//restrict image upload in user post
const postPic = multer({
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|png|jpg)$/)) {
            return cb(new Error('you must upload an image'))
        }

       cd(undefined, true)
    }
})

// method - POST
// content-type - application/json
// route - /users/me/user-role
// here the user creates and upload their post to the databse 
// and we send back the created post to them
// create a User post including images - POST http method
router.post('/users/me/user-role', auth, postPic.single('postPic'), async (req, res, next) => {
    // const bufer = await sharp(req.file.buffer).resize({width: 450, height: 650}).png().toBuffer()
       
    const userRole = new UserRole({
        ...req.body,
        ownerId: req.user._id 
    })
        try {
           await userRole.save()  
           res.status(201).send(userRole)
        } catch (e) {
            res.status(400).send(e.message)
        }    
      
})

// method - POST
// content-type - image/png
// route  - /users/me/user-role/postpicture
// here the user creates/upload an image associated with their post to the database
// so we have a different route that handles the image upload. while making request to this route
// from the front-end, remember that you are working with the same object "UserRole", only 
// that this route is solely responsble for image upload i:e userrole.postpicture prop.  if you 
// are a front-end dev, you better know how to connect this form-data to the post
// application/json 😂😂😜✌
//user role 'with image' route
router.post('/users/me/user-role/postpicture', auth, postPic.single('postPic'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({height: 250, width: 250}).png().toBuffer()
    
    const userRole = await UserRole({
        ownerId: req.user._id,
        postPicture: buffer
    })

    try {
        await userRole.save()
        res.send()
    } catch (e) {
        res.status(500).send(e.message)
    }

})

// method - GET
// content-type - form-data
// route - /users/me/user-role/:id
// here we serve up the image associated with user post.

//serve up user role image - GET http method
router.get('/users/me/user-role/:id', async (req, res) => {

    try {
        const userRoleId = await UserRole.findOne({_id: req.params.id})

        if (!userRoleId || !userRoleId.postPicture) {
            return res.status(404).send()
        }

       res.set('Content-Type', 'image/png')
       res.send(userRoleId.postPicture)

    } catch (e) {
        res.status(500).send(e.message)
    }

})

// method - DELETE
// content-type - form-data
// route - /users/me/user-role/postpicture/:id
// here we allow users delete a certain picture associated with user post
router.delete('/users/me/user-role/postpicture/:id', auth, async (req, res) => {
    const id = await UserRole.findById(req.params.id)

    try {
        id.postPicture = undefined
        await id.save()
        res.status(200).send(id)

    } catch (e) {
        res.status(500).send(e.messsage)
    }

})

// method - GET
// content-type - application/json
// route - /users-role
// here we pool out all post from the database and sort by first created
//allow all users to read users post aspa news feed - GET http method
router.get('/users-role', auth, async (req, res) => {
   
    try {
    const userrole = await UserRole.find({})
   
    if (!userrole) {
        return res.status(404).send()
    }

    res.status(200).send(userrole)

    } catch (e) {
        res.status(500).send(e.message)
    }

})

// method - GET
// content-type - application/json
//allow users read post they created on their profile page
//then sort - users/me/user-role_Auth?sortBy=createdAt_desc
router.get('/users/me/users-role_Auth', auth, async (req, res) => {
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1]  === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'role',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort 
            }
        }).execPopulate()

        res.status(200).send(req.user.role)
    } catch (e) {
        res.status(500).send(e.message)
    }

})
 

// method - patch
// content-type - application/json
// route - /users/me/user-role/:_id
// here we allow the user to edit and update their postTitle and postBody 
//allow users update the post they created - PATCH http method
router.patch('/users/me/user-role/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['postTitle', 'postBody']
    const isValidUpdates = updates.every((update) => allowedUpdates.includes(update))

        if (!isValidUpdates) {
            return res.status(400).send({error: 'invalid updates'})
        }

    try {

       const userrole = await UserRole.findOne({_id: req.params.id, ownerId: req.user._id})
      
        if (!userrole) {
            res.status(404).send()
        }

        updates.forEach((update) => userrole[update] = req.body[update])
        await userrole.save()
        res.status(200).send(userrole)

    } catch (e) {
        res.status(500).send(e.message)
    }
})

// method - DELETE
// content-type - application/json
// route - /users/me/user-role/:id
// here the user is authorized to delete their post document, so nothing is coming back
//delete post route
router.delete('/users/me/user-role/:id', auth, async (req, res) => {
    try {
      const deleted = await UserRole.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id })
        
        if (!deleted) {
            return res.status(404).send()
        }

        res.status(200).send()

    } catch (e) {
        res.status(500).send(e.message)
    }
})


module.exports = router
