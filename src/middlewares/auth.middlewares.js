import passport from "passport";

export function authorize(allowedRoles) {
    return (req, res, next) => {
        passport.authenticate("current", { session: false }, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).json({ error: "No autenticado" });
            }
            req.user = user;
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ error: "Acceso denegado. Se requiere rol: " + allowedRoles.join(" o ") });
            }
            next();
        })(req, res, next);
    };
}

export function ensureAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador" });
    }
    next();
}

export function sessionsErrorHandler(error, req, res, next) {
    res.status(500).json({ error: error.message });
}
