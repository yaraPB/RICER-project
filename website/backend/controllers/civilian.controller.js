import mongoose from "mongoose"
import Civilian from "../models/civilian.model.js"

export const createCivilian = async (req, res) => {
  const civilian = req.body // request = user will send this data

  if(!civilian.name || !civilian.price || !civilian.image)
  {
    return res.status(400).json({success: false, message: "Please provide all fields"})
  }

  const mewCilivian = new Civilian(civilian)

  try{
    await newCivilian.save()
    res.status(201).json({success: true, data: newCivilian})
  }
  catch(error){
    console.log("Error in create Civilian", error.message)
    res.status(500).json({success: false, message: "Server error"})
  }
}

export const deleteCivilian = async (req, res) =>{
  const {id} = req.params
  try
  {
    await Civilian.findByIdAndDelete(id)
    res.status(200).json({success: true, message: "Civilian successfully deleted"})
  }
  catch(error){
    res.status(404).json({success:false, message: "Civilian not found"})
  }
}

export const getCivilians = async (req, res) => {
  try {
    const civilians = await Civilian.find({})
    res.status(200).json({success: true, data: civilians})
  } catch(error){
        res.status(500).json({success:false, message: "No info"})
  }
}

export const updateCivilian =  async (req, res) =>{
  const {id} = req.params
  const civilian = req.body

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({success:false, message: "Invalid civilian Id"})
  }

  try{
    const updatedCivilian = await Civilian.findByIdAndUpdate(id, civilian, {new:true, runValidators: true})
    res.status(200).json({success: true, data: updatedCivilian})
  }
  catch(error){
    res.status(500).json({success:false, message: "Not found"})
  }
}