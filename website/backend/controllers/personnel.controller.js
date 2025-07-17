import mongoose from "mongoose"
import Personnel from "../models/personnel.model.js"

export const createPersonnel = async (req, res) => {
  const personnel = req.body // request = user will send this data

  if(!personnel.name || !personnel.price || !personnel.image)
  {
    return res.status(400).json({success: false, message: "Please provide all fields"})
  }

  const mewCilivian = new Personnel(personnel)

  try{
    await newPersonnel.save()
    res.status(201).json({success: true, data: newPersonnel})
  }
  catch(error){
    console.log("Error in create Personnel", error.message)
    res.status(500).json({success: false, message: "Server error"})
  }
}

export const deletePersonnel = async (req, res) =>{
  const {id} = req.params
  try
  {
    await Personnel.findByIdAndDelete(id)
    res.status(200).json({success: true, message: "Personnel successfully deleted"})
  }
  catch(error){
    res.status(404).json({success:false, message: "Personnel not found"})
  }
}

export const getPersonnels = async (req, res) => {
  try {
    const personnels = await Personnel.find({})
    res.status(200).json({success: true, data: personnels})
  } catch(error){
        res.status(500).json({success:false, message: "No info"})
  }
}

export const updatePersonnel =  async (req, res) =>{
  const {id} = req.params
  const personnel = req.body

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({success:false, message: "Invalid personnel Id"})
  }

  try{
    const updatedPersonnel = await Personnel.findByIdAndUpdate(id, personnel, {new:true, runValidators: true})
    res.status(200).json({success: true, data: updatedPersonnel})
  }
  catch(error){
    res.status(500).json({success:false, message: "Not found"})
  }
}