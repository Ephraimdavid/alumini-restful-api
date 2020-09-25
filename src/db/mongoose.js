/*         MY NAME IS AGBEZE ALIGBO OBINNA UMU-OKORO       

                                 UNIX-EPOCH      
            land of the rising sun!  ...for the love of a Nation!

SOCIAL MEDIA REST API
OBJECTIVES: SPREAD THE NEWS OF FREEDOM AND EMANCIPATION!
*/
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
