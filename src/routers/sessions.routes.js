import { Router, json, urlencoded } from "express";
import passport from "passport";
import { generateToken, verifyToken, hashPassword, validatePassword } from "../utils.js";
import { UserRepository } from "../repositories/user.repository.js";
import { getUserDTO } from "../dto/user.dto.js";
import { sendResetPasswordEmail } from "../services/mailing.service.js";
import { sessionsErrorHandler } from "../middlewares/auth.middlewares.js"

const userRepository = new UserRepository();

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
            const userDTO = getUserDTO(req.user);
            res.status(200).json({ user: userDTO });
        } catch (error) {
            next(error);
        }
    }
);

router.get("/current-user",
    passport.authenticate("current", { session: false }),
    async (req, res, next) => {
        try {
            const userDTO = getUserDTO(req.user);
            res.status(200).json({ user: userDTO });
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

router.post("/forgot-password", async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email es requerido" });

        const user = await userRepository.getByEmail(email);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const resetToken = generateToken({ email: user.email }, "1h");
        await sendResetPasswordEmail(email, resetToken);

        res.status(200).json({ message: "Correo de recuperación enviado" });
    } catch (error) {
        next(error);
    }
});

router.get("/reset-password/:token", async (req, res, next) => {
    try {
        const { token } = req.params;
        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return res.status(400).render("session-failed", {
                styles: { main: "/css/main.css" },
                error: "Token inválido o expirado"
            });
        }
        res.status(200).render("reset-password", {
            styles: { main: "/css/main.css" },
            token
        });
    } catch (error) {
        res.status(400).render("session-failed", {
            styles: { main: "/css/main.css" },
            error: "Token inválido o expirado"
        });
    }
});

router.post("/reset-password/:token", async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 10) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 10 caracteres" });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return res.status(400).json({ error: "Token inválido o expirado" });
        }

        const user = await userRepository.getByEmail(decoded.email);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        if (validatePassword(password, user.password)) {
            return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
        }

        user.password = hashPassword(password);
        await user.save();

        res.status(200).json({ message: "Contraseña restablecida exitosamente" });
    } catch (error) {
        next(error);
    }
});

router.use(sessionsErrorHandler);

export default router;
