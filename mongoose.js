//here we connect express with mongob database
const mongoose = require('mongoose')
   
     mongoose.connect(process.env.MONGODB_URL, //CONNECT TO DATABASE

      { 
        useNewUrlParser: true, 
        useCreateIndex: true, 
        useUnifiedTopology: true,
         useFindAndModify: false, 
         serverSelectionTimeoutMS: 30000 
        }).catch((e) => {
            console.log(e.message)
        })
