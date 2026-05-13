import { json, Router, urlencoded } from "express";
import { productModel } from "../model/productModel.js";
import { uploader } from "../utils.js";
import { ensureAdmin } from "../middlewares/auth.middlewares.js";
import { validateParamProductId, handleProductsError } from "../middlewares/products.middlewares.js";

const router = Router();

router.get("/stock",
    ensureAdmin,
    async (req, res, next) => {
        try {
            const stock = await productModel.aggregate(
                [
                    {
                        $match: {
                            stock: { $lt: 10 }
                        }
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
            res.status(200).json({ message: "reporte de stock generado", stock });
        } catch (error) {
            next(error);
        }
    });

router.route("/:pid")
    .all(validateParamProductId)
    .get(async (req, res, next) => {
        try {
            const { pid } = req.params;
            const product = await productModel.findById(pid)
            res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    })
    .put(json(), urlencoded({ extended: true }), async (req, res, next) => {
        try {
            const update = req.body;
            const { pid } = req.params;
            const updatedProduct = await productModel.findByIdAndUpdate(pid, update);
            res.status(200).json({ message: "producto actualizado", updatedProduct });
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const { pid } = req.params;
            const deletedProduct = await productModel.findByIdAndDelete(pid);
            res.status(200).json({ message: "producto borrado", deletedProduct });
        } catch (error) {
            next(error);
        }
    })

router.get("/", async (req, res, next) => {
    try {
        const { category } = req.query;
        const products = await productModel.find(category ? { category } : {});
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
});

router.post("/",
    json(),
    urlencoded({ extended: true }),
    uploader.array("thumbnails", 10),
    async (req, res, next) => {
        try {
            const product = req.body;
            if (product.status == "on") {
                product.status = true
            } else {
                product.status = false
            }
            const newProduct = await productModel.create({ ...product, thumbnails: req.files?.map(file => file.filename) || [] });
            req.app.get("socketServer").emit("new-product", newProduct);
            res.status(200).json({ message: "producto agregado", newProduct });
        } catch (error) {
            next(error);
        }
    });


router.use(handleProductsError);
export default router;
