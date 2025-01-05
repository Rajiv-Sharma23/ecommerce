import express from "express";
import dotenv from "dotenv";
// import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import mongoDB from "./DB/mongoDB.js";
import authRoutes from "./Routes/user.routes.js";
import productRoutes from "./Routes/product.route.js";
import cartRoutes from "./Routes/cart.route.js";

const app = express();
dotenv.config();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT ||3001 ;

app.get("/", (req, res) => {
    res.send("Hello World!");
  });



app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);

app.listen(process.env.port, () => {
    console.log(`Example app listening on port ${process.env.port}`);
    mongoDB();
})

