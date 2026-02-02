import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import { LIMIT } from "./constants.js";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:LIMIT
}))

app.use(urlencoded({
    extended:true,
    limit:LIMIT
}))

app.use(express.static("public"))

app.use(cookieParser());


export {app};