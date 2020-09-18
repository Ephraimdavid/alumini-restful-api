/*         MY NAME IS AGBEZE ALIGBO OBINNA UMU-OKORO       

                                 UNIX-EPOCH      
            land of the rising sun!  ...for the love of a Nation!

SOCIAL MEDIA REST API FOR AFRICA
OBJECTIVES: SPREAD THE NEWS OF FREEDOM AND EMANCIPATION!
*/
const mongoose = require('mongoose')
   
     mongoose.connect('mongodb://127.0.0.1:27017/africa-api', //CONNECT TO DATABASE

      { 
        useNewUrlParser: true, 
        useCreateIndex: true, 
        useUnifiedTopology: true,
         useFindAndModify: false, 
         serverSelectionTimeoutMS: 30000 
        }).catch((e) => {
            console.log(e.message)
        })
