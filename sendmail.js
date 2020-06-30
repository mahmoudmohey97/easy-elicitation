var nodemailer = require('nodemailer');
const decrypt = require('./models/encrypt_decrypt')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports.invite = function (email, projectName, link) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'EasyElicitationtTest@gmail.com',
            pass: 'test123test'
        }
    });
    var mailOptions = {
        from: 'EasyElicitationtTest@gmail.com',
        to: email,
        subject: "Project Invitation",
        text:
            "Your are invited to participate in " + projectName + "\n To Accept the invitation click the following link \n" + link
    };

    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

module.exports.sendToNewAdmin = function (email, subject, text) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: 'EasyElicitationtTest@gmail.com',
            pass: 'test123test'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var mailOptions = {
        from: 'EasyElicitationtTest@gmail.com',
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}