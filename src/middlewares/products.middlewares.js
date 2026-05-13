import { Types } from "mongoose";

export async function validateParamProductId(req, res, next, value) {
    if (!Types.ObjectId.isValid(value)) {
        next(new Error("el parametro no corresponde a un ObjectId"))
    }
    else next();
}

export function handleProductsError(error, req, res, next) {
    res.status(500).json({ message: error.message });
}
