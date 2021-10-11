"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./db");
function main() {
    (0, db_1.connectDB)();
    app_1.app.listen(app_1.app.get('port'), () => {
        console.log("Listening");
    });
}
main();
