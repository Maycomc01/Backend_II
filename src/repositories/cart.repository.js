import { CartDAO } from "../dao/cart.dao.js";
import { ProductDAO } from "../dao/product.dao.js";

export class CartRepository {
    constructor() {
        this.dao = new CartDAO();
        this.productDao = new ProductDAO();
    }

    async getById(id) {
        return this.dao.findById(id);
    }

    async create() {
        return this.dao.create({});
    }

    async addProduct(cid, pid) {
        const product = await this.productDao.findById(pid);
        if (!product) return null;

        const cart = await this.dao.findOneAndUpdate(
            { _id: cid },
            [
                {
                    $set: {
                        products: {
                            $cond: {
                                if: { $in: [pid, "$products.product"] },
                                then: {
                                    $map: {
                                        input: "$products",
                                        as: "item",
                                        in: {
                                            $cond: [
                                                { $eq: ["$$item.product", pid] },
                                                { product: "$$item.product", quantity: { $add: ["$$item.quantity", 1] } },
                                                "$$item"
                                            ]
                                        }
                                    }
                                },
                                else: { $concatArrays: ["$products", [{ product: pid, quantity: 1 }]] }
                            }
                        }
                    }
                }
            ],
            { new: true }
        );
        return cart;
    }

    async removeProduct(cid, pid) {
        const cart = await this.dao.findOneAndUpdate(
            { _id: cid },
            [
                {
                    $set: {
                        products: {
                            $cond: {
                                if: { $in: [pid, "$products.product"] },
                                then: {
                                    $map: {
                                        input: "$products",
                                        as: "item",
                                        in: {
                                            $cond: [
                                                { $eq: ["$$item.product", pid] },
                                                { product: "$$item.product", quantity: { $add: ["$$item.quantity", -1] } },
                                                "$$item"
                                            ]
                                        }
                                    }
                                },
                                else: { $concatArrays: ["$products", [{ product: pid, quantity: 1 }]] }
                            }
                        }
                    }
                }
            ],
            { new: true }
        );
        return cart;
    }
}
