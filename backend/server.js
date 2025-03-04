import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import authRoutes from "./routes/AuthRoutes.js"
import contactsRoutes from "./routes/ContactRoutes.js"
import { fileURLToPath } from "url";
import path from "path"
import setupSoket from "./socket.js"
import messagesRoutes from "./routes/MessagesRoutes.js"
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({
    origin: [process.env.ORIGIN],
    methods:["GET","POST","PUT","PATCH","DELETE"],
    credentials:true
}))
app.use("/uploads/profiles", express.static(path.join(__dirname, "uploads/profiles")));
app.use("/uploads/files",express.static("uploads/files"))
app.use(cookieParser())
app.use(express.json())
app.use('/api/auth',authRoutes)
app.use("/api/contacts",contactsRoutes)
app.use("/api/messages",messagesRoutes)
const server = app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
setupSoket(server)
mongoose.connect(databaseURL).then(()=>console.log('DB Connected')).catch((err)=>console.log(err.message))
