import { json, Router, urlencoded } from "express";
import { ProductRepository } from "../repositories/product.repository.js";
import { uploader } from "../utils.js";
import { ensureAdmin, authorize } from "../middlewares/auth.middlewares.js";
import { validateParamProductId, handleProductsError } from "../middlewares/products.middlewares.js";

const router = Router();
const productRepository = new ProductRepository();

router.get("/stock",
    ensureAdmin,
    async (req, res, next) => {
        try {
            const stock = await productRepository.getStockReport();
            res.status(200).json({ message: "reporte de stock generado", stock });
        } catch (error) {
            next(error);
        }
    });

router.param("pid", validateParamProductId);

router.route("/:pid")
    .get(async (req, res, next) => {
        try {
            const { pid } = req.params;
            const product = await productRepository.getById(pid)
            res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    })
    .put(authorize(["admin"]), json(), urlencoded({ extended: true }), async (req, res, next) => {
        try {
            const update = req.body;
            const { pid } = req.params;
            const updatedProduct = await productRepository.update(pid, update);
            res.status(200).json({ message: "producto actualizado", updatedProduct });
        } catch (error) {
            next(error);
        }
    })
    .delete(authorize(["admin"]), async (req, res, next) => {
        try {
            const { pid } = req.params;
            const deletedProduct = await productRepository.delete(pid);
            res.status(200).json({ message: "producto borrado", deletedProduct });
        } catch (error) {
            next(error);
        }
    })

router.get("/", async (req, res, next) => {
    try {
        const { category } = req.query;
        const products = await productRepository.getAll(category);
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
});

router.post("/",
    authorize(["admin"]),
    json(),
    urlencoded({ extended: true }),
    uploader.array("thumbnails", 10),
    async (req, res, next) => {
        try {
            const product = req.body;
            const thumbnails = req.files?.map(file => file.filename) || [];
            const newProduct = await productRepository.create({ ...product, thumbnails });
            req.app.get("socketServer").emit("new-product", newProduct);
            res.status(200).json({ message: "producto agregado", newProduct });
        } catch (error) {
            next(error);
        }
    });


router.use(handleProductsError);
export default router;
