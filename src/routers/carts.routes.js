import { Router } from "express";
import { CartRepository } from "../repositories/cart.repository.js";
import { PurchaseService } from "../services/purchase.service.js";
import { authorize } from "../middlewares/auth.middlewares.js";

const router = Router();
const cartRepository = new CartRepository();

router.get("/:cid", async (req, res, next) => {
    try {
        const { cid } = req.params;
        const cart = await cartRepository.getById(cid)
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const newCart = await cartRepository.create();
        res.status(200).json({ message: "carrito creado", newCart });
    } catch (error) {
        next(error);
    }
});

router.post("/:cid/product/:pid", authorize(["user"]), async (req, res, next) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartRepository.addProduct(cid, pid);
        if (!cart) return res.status(404).json({ message: "carrito o producto no encontrado" });
        res.status(200).json({ message: "producto agregado/actualizado", cart });
    } catch (error) {
        next(error);
    }
});

router.delete("/:cid/product/:pid", async (req, res, next) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartRepository.removeProduct(cid, pid);
        res.status(200).json({ message: "producto eliminado del carrito", cart });
    } catch (error) {
        next(error);
    }
});

router.post("/:cid/purchase", authorize(["user", "admin"]), async (req, res, next) => {
    try {
        const { cid } = req.params;
        const purchaseService = new PurchaseService();
        const result = await purchaseService.processPurchase(cid, req.user.email);
        res.status(200).json({
            message: "Compra procesada",
            ticket: result.ticket,
            productsNotPurchased: result.productsNotPurchased
        });
    } catch (error) {
        next(error);
    }
});

export default router;
