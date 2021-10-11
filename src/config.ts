import dotenv from "dotenv"
dotenv.config()

const config = {
    TOKEN_SECRET: process.env.TOKEN_SECRET||"secret"
}

export default config
