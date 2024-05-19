const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    hashPassword: {
        type: String,
        required: [true, 'password cannot be blank']
    },
    graphs: {
        type: Array
    } 
})

module.exports = mongoose.model('User', userSchema)