import mongoose from "mongoose";

const civilianSchema = new mongoose.Schema({
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

const Civilian = mongoose.model('Civilian', civilianSchema)


export default Civilian