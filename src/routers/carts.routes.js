import { Router } from "express";
import { cartModel } from "../model/cartModel.js";

const router = Router();

router.get("/:cid", async (req, res, next) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findOne({ _id: cid })
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const newCart = await cartModel.create({});
        res.status(200).json({ message: "carrito creado", newCart });
    } catch (error) {
        next(error);
    }
});

router.post("/:cid/product/:pid", async (req, res, next) => {
    try {
        const { cid, pid } = req.params;

        const { productModel } = (await import("../model/productModel.js"));
        const product = await productModel.findById(pid);
        if (!product) return res.status(404).json({ message: "producto no encontrado" });

        let cart = await cartModel.findOneAndUpdate(
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
        if (!cart) return res.status(404).json({ message: "carrito no encontrado" });
        else res.status(200).json({ message: "producto agregado/actualizado", cart });
    } catch (error) {
        next(error);
    }
});

router.delete("/:cid/product/:pid", async (req, res, next) => {
    try {
        const { cid, pid } = req.params;
        let cart = await cartModel.findOneAndUpdate(
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
        res.status(200).json({ message: "producto eliminado del carrito", cart });
    } catch (error) {
        next(error);
    }
});

export default router;
