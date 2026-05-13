import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema({
    products: {
        type: [{
            quantity: {
                type: Number,
                default: 1
            },
            product: {
                type: Types.ObjectId,
                ref: "product"
            }
        }],
        default: []
    }
});

cartSchema.pre("findOne", function () {
    this.populate("products.product");
});

export const cartModel = model("cart", cartSchema);
