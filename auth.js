const jwt = require('jsonwebtoken')
const User = require('../models/user')

//AUTHENTICATE USERS
const auth = async (req, res, next) => {
  
    try {
        // get the token from the header of a given user request
        const token = req.header('Authorization').replace('Bearer ', '')

    //check and verify if the user-request token was created by our server and hasn't expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // find a user by ID and check if they still have the verified token in the tokens array
    // if they do, we allow them to intiate a process
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})
   
        if (!user) {
            throw new Error('please Authenticate')
        }
        
        req.token = token
        req.user = user
        next()

    } catch (e) {
        res.status(401).send(e.message)
    }

}


module.exports = auth