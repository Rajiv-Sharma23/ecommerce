import { redis } from "../lib/redis.js";
import Product from "../Models/product.model.js";

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({}); 
        res.json({products});
    } catch (error) {
        console.log("error in getAllProducts controller",error);
        res.status(500).json({message:"server error",error:error.message});
    }
}

export const getFeaturedProducts = async (req,res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }
        // if not in redis fetch from mongo DB...
        featuredProducts = await Product.find({isFeatured:true}).lean();

        if(!featuredProducts) {
            return res.status(404).json({message:"No featured products found"});
        }

        // store in redis for future access

        await redis.set("featured_products",JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("error in getFeaturedProducts controller",error.message);
        return res.status(500).json({message:"server error",error:error.message}); 
        
    }
}