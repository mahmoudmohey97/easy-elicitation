var nodemailer = require('nodemailer');
const decrypt = require('./models/encrypt_decrypt')

module.exports.invite = function (email, projectName, link) {
  
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'alihussien618@gmail.com',
            pass: 'alimahmoud123'
        }
    });
    var mailOptions = {
        from: 'alihussien618@gmail.com',
        to: email,
        subject: "Project Invitation",
        text:
            "Your are invited to participate in " + projectName + "\n To Accept the invitation click the following link \n" +link
    };

    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}