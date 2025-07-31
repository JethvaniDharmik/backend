import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import servicesRouter from './routes/servicesRoute.js'
import userRouter from './routes/userRoute.js'




//app config
const app = express()
const port = process.env.PORT || 5555
connectDB()
connectCloudinary()


// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/admin',adminRouter)
// localhost:4000/api/admin/add-services
app.use('/api/services', servicesRouter)
app.use('/api/user', userRouter)


app.get('/', (req,res)=>{
    res.send('API WORKING ')
})

app.listen(port, ()=> console.log("Server Started",port))