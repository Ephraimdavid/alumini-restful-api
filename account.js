//SEND AUTOMATED EMAIL FROM THIS APP
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//SEND A WELCOME EMAIL TO NEW USER
const sendWelcomeMail = (name, email) => {
    sgMail.send({
        to: email,
        from: 'COMPANYEMAIL@MAIL.COM',
        subject: 'Welcome new User',
        text: `Hi ${name}, you recently created an account with FOODELO`
    }).catch((e) => {
        console.log(e.message)
    })
}

//SEND DELETE ACCOUNT MAIL TO USER
const accountDeleteMail = (name, email) =>    {
    sgMail.send({
        to: email,
        from: 'OMPANYEMAILMAIL@GMAIL.COM',
        subject: `Hey ${name}`,
        text: 'You just deleted your profile in DINAINFO database. Do well to tell us why you choose to left'
    }).catch((e) => {
        console.log(e.message)
    })
}

const resetPasswordMail = (name, token, email) => {
    sgMail.send({
        to: email,
        from: 'obinna.agbeze.204678@unn.edu.ng',
        subject: 'Reset your password ' + name,
        text: `${token} click the link to reset your password, you have 1hour to do that`
    })
}


module.exports = { 
    sendWelcomeMail, 
    accountDeleteMail, 
    firstPostMail, 
    resetPasswordMail
 }