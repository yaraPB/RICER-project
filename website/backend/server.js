import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import productRoutes from './routes/products.route.js'

dotenv.config()
const app = express()
app.use(express.json())

// GET here because the browser makes a GET request when visiting a website
app.get("/",(req, res) =>{
  res.send("Server is ready")
} )

app.use('/api/products', productRoutes)

app.listen(process.env.PORT, ()=>{
  connectDB() 
  console.log(`Server started at http://localhost:${process.env.PORT}`)  
})
