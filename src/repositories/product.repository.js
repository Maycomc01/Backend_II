import { ProductDAO } from "../dao/product.dao.js";

export class ProductRepository {
    constructor() {
        this.dao = new ProductDAO();
    }

    async getAll(category) {
        const query = category ? { category } : {};
        return this.dao.findAll(query);
    }

    async getById(id) {
        return this.dao.findById(id);
    }

    async create(productData) {
        if (productData.status === "on") {
            productData.status = true;
        } else if (productData.status === undefined) {
            productData.status = true;
        } else {
            productData.status = false;
        }
        if (!productData.thumbnails) {
            productData.thumbnails = [];
        }
        return this.dao.create(productData);
    }

    async update(id, data) {
        return this.dao.update(id, data);
    }

    async delete(id) {
        return this.dao.delete(id);
    }

    async getPaginated(query, options) {
        return this.dao.paginate(query, options);
    }

    async getStockReport() {
        return this.dao.aggregate([
            {
                $match: { stock: { $lt: 10 } }
            },
            {
                $project: {
                    title: "$title",
                    stock: "$stock",
                    category: "$category"
                }
            },
            {
                $group: {
                    _id: "$category",
                    products: {
                        $push: {
                            title: "$title",
                            stock: "$stock"
                        }
                    }
                }
            },
            {
                $merge: {
                    into: "stock_reports"
                }
            }
        ]);
    }
}
