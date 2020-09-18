const sharp = require('sharp')
const multer = require('multer')
const express = require('express')
const auth = require('../middleware/auth')
const UserComment = require('../models/usercomment')

const router = new express.Router()

// restrict picture upload in comments
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|png|jpg)$/)) {
            return cb(new Error('please upload an image!'))
        }
        cb(undefined, true)
    }
})


// create a User comment with images - POST http method
router.post('/users/user-comment', auth, upload.single('upload'), async (req, res) => {
const buffer = await sharp(req.file.buffer).resize({width: 350, height: 450}).png().toBuffer()
    const userComment = new UserComment({
        ...req.body,
        ownerId: req.user._id,
        commentPic: buffer
    })
   
    try {
        await userComment.save()
        res.status(201).send(userComment)

    } catch (e) {
        res.status(400).send(e.message)
    }
})


//serve up comment image - use ur browser to test this route
router.get('/users/user-comment/:id', async (req, res) => {

    try {

        const usercoment = await UserComment.findOne({_id: req.params.id})

        if (!usercoment || !usercoment.commentPic) {
            throw new Error('no picture here')
        }

        res.set('Content-Type', 'image/png')
        res.send(usercoment.commentPic)

    } catch (e) {
        res.status(404).send(e.message)
    }

})


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