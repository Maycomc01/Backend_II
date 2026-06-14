import { productModel } from "../model/productModel.js";

export class ProductDAO {
    async findAll(query = {}) {
        return productModel.find(query);
    }

    async findById(id) {
        return productModel.findById(id);
    }

    async create(data) {
        return productModel.create(data);
    }

    async update(id, data) {
        return productModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return productModel.findByIdAndDelete(id);
    }

    async paginate(query, options) {
        return productModel.paginate(query, options);
    }

    async aggregate(pipeline) {
        return productModel.aggregate(pipeline);
    }
}
