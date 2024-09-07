import User from "../model/userModel.js";
export const create = async(req, res)=>{
    try {
        const userDate = new User(req.body)
        if(!userDate){
            return res.status(404).json({message:"User not not found"})
        }
        const savedData = await userDate.save()
        res.status(201).json(savedData)
    } catch (error) {
        res.status(500).json({error: error})
    }
}

export const getAll = async(req, res)=>{
    try {
        const userData = await User.find()
        if(!userData){
            return res.status(404).json({message:"User not found"})
        }
        res.status(200).json(userData)
    } catch (error) {
        res.status(500).json({error: error})
    }
}

export const getOne = async(req, res)=>{
    try {
        const id = req.params.id
        const userExists = await User.findById(id)
        if(!userExists){
            returnres.status(404).json({message:"User not found"})
        }
        res.status(200).json(userExists)
    } catch (error) {
        res.status(500).json({error: error})
    }
}

export const update = async(req, res)=>{
    try {
        const id = req.params.id;
        const userExists = await User.findById(id)
        if(!userExists){
            return res.status(404).json({message:"User not found"})
        }
        const updatedData = await User.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updatedData)
    } catch (error) {
        res.status(500).json({error: error})
    }
}

export const deleteUser = async(req, res)=>{
    try {
        const id = req.params.id;
        const userExists = await User.findById(id)
        if(!userExists){
            return res.status(404).json({message:"User not found"})
        }
        await User.findByIdAndDelete(id)
        res.status(200).json({message:"User deleted successfully"})
    } catch (error) {
        res.status(500).json({error: error})
    }
}