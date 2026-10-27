import mongoose from "mongoose";
import validator from "validator"


const userschema = new mongoose.userschema({
    name: {
        type: String,
        required: [true, 'Tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Email is needed'],
        unique: true,
        lowerCase: true,
        validator: [validator.isEmail, 'Provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please set your password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password']
    }
});

const User = mongoose.model('User', userschema);

module.exports = User;
