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
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|png|jpg)$/)) {
            return cb(new Error('you must upload an image'))
        }

        cb(undefined, true)
    }
})


// create a User post including images - POST http method
router.post('/users/me/user-role', auth, postPic.single('postPic'), async (req, res, next) => {
    const bufer = await sharp(req.file.buffer).resize({width: 450, height: 650}).png().toBuffer()
    
    const userRole = new UserRole({
        ...req.body,
        ownerId: req.user._id,
        postPicture: bufer
        //postVideo: req.file.buffer // no condition in multer to pass this information
    }) 
        try {
            await userRole.save()  
            if (userRole.length <= 1) {
              firstPostMail(req.user.name, req.user.email)
            }
            res.status(201).send(userRole)

        } catch (e) {
            res.status(400).send(e.message)
        }    
})


//serve up user post image - GET http method
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


//allow un-auth users to read users post aspa new comers - GET http method
router.get('/users-role', async (req, res) => {
   
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


//allow users read post they created on their profile page
//then pagenize it!
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
