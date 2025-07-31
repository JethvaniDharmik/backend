import express from 'express'
import { appointmentCancel, appointmentComplete, appointmentsServices, loginServices, servicesDashboard,  servicesList, servicesProfile, updateServicesProfile } from '../controllers/servicesController.js'
import authServices from '../middlewares/authServices.js'

const servicesRouter = express.Router()

servicesRouter.get('/list',servicesList )
servicesRouter.post('/login',loginServices)
servicesRouter.get('/appointments',authServices,appointmentsServices)
servicesRouter.post('/complete-appintment', authServices, appointmentComplete)
servicesRouter.post('/cancel-appintment', authServices, appointmentCancel)
servicesRouter.get('/dashboard', authServices, servicesDashboard)
servicesRouter.get('/profile',authServices, servicesProfile)
servicesRouter.post('/update-profile',authServices, updateServicesProfile)


export default servicesRouter