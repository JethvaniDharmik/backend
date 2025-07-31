import validator from "validator";
import bcrypt from 'bcrypt';  // ✅ Fixed spelling
import { v2 as cloudinary } from "cloudinary";
import servicesModel from "../models/servicesModels.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModels.js";




//API for adding services
const addServices = async (req, res) => {
    try {
        const { name, email, password, speciality, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // checking for all data to add services
        if (!name || !email || !password || !speciality || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating password format
        if (password.length < 8) { 
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // hashing service password
        const salt = await bcrypt.genSalt(10);  // ✅ Correct bcrypt method
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const servicesData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newServices = new servicesModel(servicesData);
        await newServices.save();

        res.json({ success: true, message: "Services Added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API For admin Login
const loginAdmin = async (req,res) => {
    try {
        
        const{email,password} = req. body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({ success: true,token})

        }else{
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//API to get  all Services list  for admin panel
const allServices = async (req,res) =>{
    try {
     
        const services = await servicesModel.find({}).select('-password')
        res.json({success:true,services})
   
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })   
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req,res) => {
     
    try {
       
        const appointments = await appointmentModel.find({})
        res.json({success:true,appointments})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })    
    }
}

//API for appointment cancellation
// API to cancel appointment 
const appointmentCancel = async (req, res) =>{

    try {
      
        const  {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        

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

// API to get dashboard data for admin panel

const adminDashboard = async (req,res) => {

try {
   
    const services = await servicesModel.find({})
    const users = await  userModel.find({})
    const appointments = await appointmentModel.find({})

    const dashData = {
        services: services.length,
        appointments: appointments.length,
        customer: users.length,
        latestAppointments: appointments.reverse().slice(0,5)
    }

    res.json({success:true,dashData})

} catch (error) {
    
    console.log(error);
    res.json({ success: false, message: error.message })               
}





}





export { addServices,
    loginAdmin,
    allServices,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard
}
