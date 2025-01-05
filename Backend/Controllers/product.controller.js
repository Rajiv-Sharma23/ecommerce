import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
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

export const createProduct = async (req,res) => {
    try {
        const{name,description,image,price,category} = req.body;

        let cloudinaryResponse = null;
        if(image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image,{folder:"products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image:cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "" ,
        });

        res.status(201).json(product);

    } catch (error) {
        console.log("error in create products controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
        
    }
}

export const deleteProduct = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) {
            res.status(500).json({message:"Product not found"});
        }
        if(product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary");
            } catch (error) {
                console.log("error deleting image from cloudinary",error);                
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({message:"Product deleted successfully"});
    } catch (error) {
        console.log("error in deleteProduct controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
}

export const getRecommededProducts = async (req,res) => {
 try {
    const products = await Product.aggregate([
        {
            $sample: {size:3}
        },
        {
            $project: {
                _id:1,
                name:1,
                image:1,
                description:1,
                price:1,
            },
        },
    ]);

    res.json(products);
 } catch (error) {
    console.log("error in getRecommededProducts controller",error.message);
    res.status(500).json({message:"Server error",error:error.message}); 
 }   
}

export const getProductsByCategory = async (req,res) => {
    const {category} = req.params ;
    try {
        const products = await Product.find({category})
        res.json(products);
    } catch (error) {
        console.log("error in getProductsByCategory controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
}

export const toggleFeaturedProducts = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            product.isFeatured = !product.isFeatured ;
            const updatedProduct = await product.save();
            await updateFeaturedProductCache();
            res.json(updatedProduct);
        }else {
            res.status(404).json({message:"Product not found"});
        }
    } catch (error) {
        console.log("error in toggleFeaturedProducts controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
}

const updateFeaturedProductCache = async () => {
    try {
        const featuredProducts = await Product.find({isFeatured:true}).lean();
        await redis.set("featured_products",JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in update cache function",error.message);
        
    }
}