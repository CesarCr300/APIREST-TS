import express, { Application } from "express"
const app: Application = express()
import morgan from "morgan"
if (process.env.NODE_ENV !== "test"){ 
    app.use(morgan('dev'))
}

//routes
import userRouter from "./user/routes"

app.set("port", process.env.PORT||3000)
app.use(express.urlencoded({extended:true}))

app.use(express.json())

app.use("/api/users",userRouter)

export {app}