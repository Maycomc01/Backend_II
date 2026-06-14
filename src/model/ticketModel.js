import { Schema, model } from "mongoose";
import { randomUUID } from "crypto";

const ticketSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        default: () => randomUUID()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
});

export const ticketModel = model("ticket", ticketSchema);
