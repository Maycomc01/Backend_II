import { Router, json, urlencoded } from "express";
import passport from "passport";
import { generateToken } from "../utils.js";
import { sessionsErrorHandler } from "../middlewares/auth.middlewares.js"

const router = Router();

router.get("/logout", (req, res, next) => {
    try {
        res.status(200).clearCookie("jwt").redirect("/login");
    } catch (error) {
        next(error);
    }
});

router.post("/logout", (req, res, next) => {
    try {
        res.status(200).clearCookie("jwt").json({
            message: "Sesión cerrada exitosamente"
        });
    } catch (error) {
        next(error);
    }
});

router.get("/github-login",
    passport.authenticate("github", {
        failureRedirect: "/login-failed",
        session: false
    }),
    async (req, res, next) => {
        try {
            req.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                role: req.user.role
            }

            const token = generateToken(req.user);
            res.status(200).cookie("jwt", token, { maxAge: 60000 }).redirect("/profile");
        } catch (error) {
            next(error);
        }
    });

router.get("/google",
    passport.authenticate("google", {
        session: false,
        scope: ["email", "profile"]
    }),
    async (req, res, next) => {
        try {
            req.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                role: req.user.role
            }

            const token = generateToken(req.user);
            res.status(200).cookie("jwt", token, { maxAge: 60000 }).redirect("/profile");
        } catch (error) {
            next(error);
        }
    });

router.use(json(), urlencoded({ extended: true }));

router.post("/register", passport.authenticate("register",
    {
        session: false,
        failureRedirect: "/register-failed",
        successRedirect: "/profile"
    })
);

router.post("/login",
    passport.authenticate("login",
        {
            failureRedirect: "/login-failed",
            session: false
        }),
    async (req, res, next) => {
        try {
            req.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                role: req.user.role
            }

            const token = generateToken(req.user);
            res.status(200).cookie("jwt", token, { maxAge: 60000 }).json({
                message: "Login exitoso",
                token,
                user: req.user
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get("/current",
    passport.authenticate("current", { session: false }),
    async (req, res, next) => {
        try {
            res.status(200).json({ user: req.user });
        } catch (error) {
            next(error);
        }
    }
);

router.get("/current-user",
    passport.authenticate("current", { session: false }),
    async (req, res, next) => {
        try {
            res.status(200).json({ user: req.user });
        } catch (error) {
            next(error);
        }
    }
);

router.post("/set-cookie",
    passport.authenticate("login", { session: false }),
    async (req, res, next) => {
        try {
            const user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                role: req.user.role
            };
            const token = generateToken(user);
            res.cookie("jwt", token, { maxAge: 60000 }).status(200).json({
                message: "Cookie seteada",
                token
            });
        } catch (error) {
            next(error);
        }
    }
);

router.use(sessionsErrorHandler);

export default router;
