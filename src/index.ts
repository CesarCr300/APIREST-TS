import {app} from './app'
import {connectDB} from "./db"

function  main() {
    connectDB()

    app.listen(app.get('port'), ()=>{
        console.log("Listening")})
}

main()
