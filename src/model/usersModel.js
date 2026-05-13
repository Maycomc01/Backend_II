import { Schema, model, Types } from "mongoose";
import { hashPassword } from "../utils.js";

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Formato de email invalido"]
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value) => value.length > 10,
            message: "la contraseña debe tener al menos 10 caracteres"
        }
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
        required: true
    },
    cart: {
        type: Types.ObjectId,
        ref: "cart"
    }

});

userSchema.pre("save", function () {
    this.password = hashPassword(this.password);
});

export const userModel = model("user", userSchema);
