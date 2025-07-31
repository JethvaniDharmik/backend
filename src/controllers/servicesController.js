import servicesModel from "../models/servicesModels.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"


const changeAvailablity = async (req,res) =>{
    try {
       
        const {serId} = req.body

        const serData = await servicesModel.findById(serId)
        await servicesModel.findByIdAndUpdate(serId, {available: !serData.available})
        res.json({success:true, message: 'Availablity Changed'})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })   
    }
}
  
const servicesList = async (req,res) => {
    try {
        const Services = await servicesModel.find({}).select(['-password','-email'])
        res.json({success:true, Services})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })   
     }
}

// API for services Login
const loginServices = async (req,res) => {

    try {
       
        const { email, password } = req.body
        const Services = await servicesModel.findOne({email})


        if (!Services) {
            return res.json({success:false,message:'Invalid Credntials'})
        }

        const isMatch = await  bcrypt.compare(password, Services.password)

        if (isMatch) {
            
             const token = jwt.sign({id:Services._id},process.env.JWT_SECRET)

             res.json({success:true,token})

        }else{
            res.json({success:false,message:'Invalid Credntials'}) 
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })   
    }

}

//API to Get  services appointment for services panel
const appointmentsServices = async (req,res) => {
    try {
        
        const {serId} = req.body
        const appointments = await appointmentModel.find({serId})

        res.json({success:true,appointments})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })    
    }
}

// API to marek appointment completed for srevices panel
const appointmentComplete =  async (req,res) => {
    try {
       
        const {serId, appointmentId  } = req.body
         
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.serId === serId) {
         
            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true})
            return res.json({success:true, message: 'Appointemnt Completed'})

        } else {
            return res.json({success:false, message: 'Mark Faild'}) 
        }
               
 
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })      
    }
}

// API to cancle  appointment completed for srevices panel
const appointmentCancel =  async (req,res) => {
    try {
       
        const {serId, appointmentId  } = req.body
         
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.serId === serId) {
         
            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled : true})
            return res.json({success:true, message: 'Appointemnt Cancelled'})

        } else {
            return res.json({success:false, message: 'Cancellation Faild'}) 
        }
               
 
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })      
    }
}


//api to get dashbord data for services panles
const servicesDashboard = async (req,res) => {
    try {

        const {serId} = req.body

        const appointments = await appointmentModel.find({serId})

         let customer = []

        appointments.map((item)=>{
                if (!customer.includes(item.userId)) {
                    customer.push(item.userId)
                }
        })


        const dashData = {
            appointments:appointments.length,
            customer:customer.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success: true, dashData})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })       
    }
}

const servicesProfile = async (req,res) => {
    try {
        const { serId } = req.body
        const profileData = await  servicesModel.findById(serId).select('-password')
        res.json({success:true, profileData})
    } catch{
        console.log(error);
        res.json({ success: false, message: error.message })        
    }
}

const updateServicesProfile = async (req, res) =>{
    try {
      
        const {available,serId} = req.body
        await servicesModel.findByIdAndUpdate(serId,{available})
        res.json({success:true, message:'Profile Update'})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })        
    }
}

export {changeAvailablity,
    servicesList,
    loginServices,
    appointmentsServices,
    appointmentCancel,
    appointmentComplete,
    servicesDashboard,
    servicesProfile,
    updateServicesProfile
}