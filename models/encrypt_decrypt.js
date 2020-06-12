const Cryptr = require('cryptr');
const cryptr = new Cryptr('mailKey');

module.exports.encrypt = function (name) {
    const encrypted = cryptr.encrypt(name);
    return encrypted;
};

module.exports.decrypt = function (encryptedString) {
    const decryptedString = cryptr.decrypt(encryptedString);
    return decryptedString;
}
