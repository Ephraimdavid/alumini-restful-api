 /*
    ( )
    |-| -> I ❤ MUM+= lit-luns + i 💖 COLLINS + I 💞 NORA + I 💖 GEN BEN + I 💕 >= PALS + OBIs *3 ...then; there was lizee
    (_)
*/

//import all necessary modules for use!
const express = require('express')
const userRouter = require('./routers/user')
const userRoleRouter = require('./routers/userrole')
const userCommentRouter = require('./routers/usercomment') 

// by calling mongoose, we are inter-connected to the DataBase
require('./db/mongoose.js')

//initiate the server
const app = express()

//we either connect to Heroku server || local server
const port = process.env.PORT


// parse incoming JSON so we can access it as an object in req.body =>
app.use(express.json())


//register various routes to Express
app.use(userRouter)
app.use(userRoleRouter)
app.use(userCommentRouter)





// NEVER FORGET THE SERVER - aspa RUN TIME (local) ENV!!!!!
app.listen(port, () => {
    console.log(`server up on port ${port}`)
})