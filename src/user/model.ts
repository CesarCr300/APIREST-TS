import {Schema, model, Document} from 'mongoose'
import bcrypt from 'bcryptjs'
export interface IUser extends Document {
    username:string,
    password:string,
    isAdmin:boolean,
    createPassword(password:string):Promise<string>,
    validatePassword(password:string):Promise<boolean>,
}

const schema  = new Schema({
    username:{required: true, type: String, unique: true},
    password:{required: true, type: String},
    isAdmin:{required: false, type: Boolean},
})

schema.methods.createPassword = async (password:string):Promise<string>=>{
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}
schema.methods.validatePassword = async function(password:string):Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}
export const User = model<IUser>("User", schema)