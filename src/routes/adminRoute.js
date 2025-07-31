import express from 'express'
import { addServices,adminDashboard,allServices,appointmentCancel,appointmentsAdmin,loginAdmin } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailablity } from '../controllers/servicesController.js'



const adminRouter = express.Router()

adminRouter.post('/add-services',authAdmin,upload.single('image'),addServices)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-services',authAdmin,allServices)
adminRouter.post('/change-availablity',authAdmin,changeAvailablity)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard', authAdmin, adminDashboard)


  

export default adminRouter