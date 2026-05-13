import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    category: {
        type: String,
        index: true
    },
    stock: Number,
    status: Boolean,
    code: {
        type: String,
        unique: true,
        required: true
    },
    thumbnails: [String]
});

productSchema.plugin(mongoosePaginate);

export const productModel = model("product", productSchema);
