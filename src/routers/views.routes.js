import { Router } from "express";
import { productModel } from "../model/productModel.js";
import { ensureAdmin } from "../middlewares/auth.middlewares.js";
import passport from "passport";
const router = Router();

router.get("/register", (req, res) => {
    res.render("register", {
        styles: {
            main: "/css/main.css"
        }
    });
});

router.get("/login", (req, res) => {
    res.render("login", {
        styles: {
            main: "/css/main.css"
        }
    });
});

router.use(passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/login"
}));

router.get("/products", async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const pagination = await productModel.paginate({}, {
            limit: 10,
            page: page,
            lean: true
        });

        res.status(200).render("products", {
            pagination,
            styles: {
                main: "/css/main.css",
                products: "/css/products.css"
            },
            userData: req.user
        })
    } catch (error) {
        res.status(500).send("Error al obtener los productos");
    }
});

router.get("/admin/create-product",
    ensureAdmin,
    async (req, res) => {
        try {

            res.status(200).render("product-form", {
                styles: {
                    main: "/css/main.css"
                },
                userData: req.user

            });

        } catch (error) {
            res.status(500).send("Error al obtener el formulario");
        }
    });


router.get("/profile", (req, res) => {

    res.render("profile", {
        styles: {
            main: "/css/main.css"
        },
        userData: req.user
    });
});

router.get("/register-failed", async (req, res) => {
    res.render("session-failed", {
        styles: {
            main: "/css/main.css"
        }
    });
});

router.get("/login-failed", async (req, res) => {
    res.render("session-failed", {
        styles: {
            main: "/css/main.css"
        }
    });
});

router.use((req, res, next) => {
    res.status(404).render("not-found", {
        styles: {
            main: "/css/main.css"
        }
    });
});
export default router;
