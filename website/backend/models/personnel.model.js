import mongoose from "mongoose";

const personnelSchema = new mongoose.Schema({
fullName: {
    type: String,
    required: true
},
CIN: {
    type: Number,
    required: true
},
password: {
    type: String, 
    required: true
},
phone: {
    type: String, 
    required: true
},
}, {
    timestamps: true //createdAt, updatedAt
})

const Personnel = mongoose.model('Personnel', personnelSchema)

export default Personnel