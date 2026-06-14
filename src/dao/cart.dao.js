import { cartModel } from "../model/cartModel.js";

export class CartDAO {
    async findById(id) {
        return cartModel.findOne({ _id: id });
    }

    async create(data = {}) {
        return cartModel.create(data);
    }

    async findOneAndUpdate(filter, update, options = {}) {
        return cartModel.findOneAndUpdate(filter, update, options);
    }
}
