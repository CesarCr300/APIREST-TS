import morgan from "morgan"
import express, { Application } from "express"
const app: Application = express()

//routes
import userRouter from "./user/routes"

app.set("port", process.env.PORT||3000)
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'))
app.use(express.json())

app.use("/api/users",userRouter)

export {app}