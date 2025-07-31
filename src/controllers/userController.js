import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModels.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import servicesModel from '../models/servicesModels.js'
import appointmentModel from '../models/appointmentModel.js'


// API to register user
const registerUser = async(req,res) => {
    try {
        
        const {name,email,password} = req.body

        if (!name || !email || !password) { 

            return res.json({success:false,message:"Missing Details"})
        }
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email"})
         }
         if (password.length<8) {
            return res.json({success:false,message:"Please enter a strong password"})
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new  userModel(userData)
        const  user =  await newUser.save()

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
         res.json({success:true,token})



    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })      
    }
}

// API for the user login
const  loginUser = async (req,res) => {

    try {
       
        const { email,password } = req.body
        const user = await userModel.findOne({email})

        if (!user) {
       return res.json({ success: false, message: "User does not exist" })       
            }
        const isMatch = await bcrypt.compare(password,user.password)

        if (isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true,token})
        }else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })       
    }

}


// API to get user profile data

const getProfile = async (req,res) => {

        try {
            const { userId } = req.body
            const userData = await userModel.findById(userId).select('-password')

            res.json({success:true,userData})

        } catch (error) {
            console.log(error);
            res.json({ success: false, message: error.message })        
        }
}

// API to update user profile
const updateProfile = async (req,res) => {
    try {
       
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !address || !dob || !gender) {
            return res.json({success:false,message:"Data Missing"})
        }

        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address,),dob,gender})

        if (imageFile) {
             // upload image to cloudinary
             const imageUplod = await cloudinary.uploader.upload(imageFile.path,{resource_type: 'image'})
             const imageURL = imageUplod.secure_url

             await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        res.json({success:true,message:"Profile Updated"})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })       
    }
}

// AIP to book appointment

const bookAppointment = async (req,res) => {
    try {
        
        const {userId, serId, slotDate, slotTime  } = req.body

        const serData = await servicesModel.findById(serId).select('-password')

        if (!serData.available) {
            return req.json({success:false,message:'Service not avsilsble'})
            
        }

        let slots_booked = serData.slots_booked 


        //checking for slot avilablity
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false,message:'Slot  not avsilsble'})  
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete serData.slots_booked

        const appointmentData = {
            userId,
            serId,
            userData,
            serData,
            amount:serData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in serData
        await servicesModel.findByIdAndUpdate(serId, {slots_booked})

        res.json({success:true,message:'Appointment Booked'})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })          
    }
} 

// API to get user appointments for frontend my-appointments page 
const listAppointment =  async (req,res) => {
    try {
        
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})

        res.json({success:true,appointments})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })           
    }
}

// API to cancel appointment 
const cancelAppointment = async (req, res) =>{

    try {
      
        const  {userId, appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointent user
        if (appointmentData.userId !== userId) {
            return res.json({success:false,message:'Unuthorized action'})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        // releasing services slot

        const {serId, slotDate, slotTime} = appointmentData

        const servicesData = await servicesModel.findById(serId)

        let slots_booked = servicesData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await servicesModel.findByIdAndUpdate(serId, {slots_booked})

        res.json({success:true, message:'Appointment Cancelled'})
        

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })              
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment
}