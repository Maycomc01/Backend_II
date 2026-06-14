import { CartRepository } from "../repositories/cart.repository.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { TicketRepository } from "../repositories/ticket.repository.js";

export class PurchaseService {
    constructor() {
        this.cartRepository = new CartRepository();
        this.productRepository = new ProductRepository();
        this.ticketRepository = new TicketRepository();
    }

    async processPurchase(cid, userEmail) {
        const cart = await this.cartRepository.getById(cid);
        if (!cart || !cart.products || cart.products.length === 0) {
            throw new Error("El carrito está vacío o no existe");
        }

        const productsToPurchase = [];
        const productsNotPurchased = [];
        let totalAmount = 0;

        for (const item of cart.products) {
            const product = item.product;
            const quantity = item.quantity;

            if (product.stock >= quantity) {
                const newStock = product.stock - quantity;
                await this.productRepository.update(product._id, { stock: newStock });

                productsToPurchase.push({ product: product._id, quantity });
                totalAmount += product.price * quantity;
            } else {
                productsNotPurchased.push({
                    product: product._id,
                    title: product.title,
                    quantity,
                    stockAvailable: product.stock
                });
            }
        }

        const remainingProducts = cart.products.filter(item => {
            return productsNotPurchased.some(np => np.product.toString() === item.product._id.toString());
        });

        if (remainingProducts.length !== cart.products.length) {
            await this.cartRepository.dao.findOneAndUpdate(
                { _id: cid },
                { $set: { products: remainingProducts } }
            );
        }

        if (productsToPurchase.length === 0) {
            throw new Error("No hay stock suficiente para ningún producto");
        }

        const ticket = await this.ticketRepository.create({
            amount: totalAmount,
            purchaser: userEmail
        });

        return {
            ticket,
            productsNotPurchased,
            productsToPurchase
        };
    }
}
