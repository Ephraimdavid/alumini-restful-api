const sharp = require('sharp')
const multer = require('multer')
const express = require('express')
const auth = require('../middleware/auth')
const UserComment = require('../models/usercomment')

const router = new express.Router()

// restrict picture upload in comments
const upload = multer({
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|png|jpg)$/)) {
            return cb(new Error('please upload an image!'))
        }
        cd(undefined, true)
    }
})

// method - POST
// content-type - application/json
// route - /users/user-comment
//here we allow the user comment on individual post
// honestly i don't know if i correctly created a relationship betwwen the comment
// and the post to comment on @ ../models/user: line 90
// create a User comment with images - POST http method
router.post('/users/user-comment', auth, async (req, res) => {
  const userComment = new UserComment({
        ...req.body,
        ownerId: req.user._id
    })
   
    try {
        await userComment.save()
        res.status(201).send(userComment)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

// method - POST
// content-type - form-data
// route - /users/user-comment/pic
// here the user comments with a picture if need be...nothing is coming back, 
// we are just sending to database
//user comment' with pic' route
router.post('/users/user-comment/pic', auth, upload.single('commentPic'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    const userComment = await UserComment({
        ownerId: req.user._id,
        commentPicture: buffer
    })

     try {
         
        await userComment.save()
        res.send()

    } catch (e) {
    res.status(500).send(e.message)
    
    }
})


// method - GET 
// content/type - form-data
// route - /users/user-comment/:id
// here we serve the image the user provided in the comment
//serve up comment image - use ur browser to test this route
router.get('/users/user-comment/:id', async (req, res) => {

    try {

        const usercoment = await UserComment.findOne({_id: req.params.id})

        if (!usercoment || !usercoment.commentPicture) {
            throw new Error('no picture here')
        }

        res.set('Content-Type', 'image/png')
        res.send(usercoment.commentPicture)

    } catch (e) {
        res.status(404).send(e.message)
    }

})

// method - GET
// content-type - application/json
// route - /users/comment
// here we render all the comment associated with the vaious post in our DB
//read users comment - GET http method
router.get('/users-comment', async (req, res) => {

        try {
         const comment = await UserComment.find({})
         
         if (!comment) {
             return res.status(404).send()
         }

         res.status(200).send(comment)
        } catch (e) {
            res.status(500).send(e.message)
        }
})


// method - GET
// content-type - application/json
// route - /user-coomment/:id
// here we identify who wrote which comment
//read a user comment by Id - GET http method
router.get('/user-comment/:id', auth, async (req, res ) => {
    const _id = req.params.id

      try {
        const commentId = await UserComment.findById(_id)
        
        if (!commentId) {
            return res.status(404).send()
        }
        res.status(200).send(commentId)

     } catch (e) {
        res.status(500).send(e.message)
       }

})

// method - PATCH
// content-type - application/json
// route - /user-comment/:id
// here we allow the user edit their individual comment
//update a user comment by Id - PATCH http method
router.patch('/user-comment/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['comment']
    const isValidUpdates = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidUpdates) {
            return res.status(400).send({error: 'invalid updates!'})
        }

    try {
        const userco = await UserComment.findOne({_id: req.params.id, ownerId: req.user._id})
        
        if (!userco) {
            return res.status(404).send()
        }
        
        updates.forEach((update) => userco[update] = req.body[update]) 
        await userco.save()
        res.status(200).send(userco)

    } catch (e) {
        res.status(500).send(e.message)
    }
})

// method - DELETE
// content-type - application/json
// route - /user-comment/:id
// here we allow the user delete the comment they wrote

router.delete('/user-comment/:id', auth, async (req, res) => {
        try {
           const deleted = await UserComment.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id})
         
            if (!deleted) {
                return res.status(404).send()
            }
           res.status(200).send()

        } catch (e) {
            res.status(500).send()
        }
})


module.exports = router