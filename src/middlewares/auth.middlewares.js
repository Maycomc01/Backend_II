export function ensureAdmin(req, res, next) {
    if (req.user.role != "admin") {
        res.status(404).send("la pagina buscada no existe");
    } else {
        next();
    }
}

export function sessionsErrorHandler(error, req, res, next) {
    res.status(500).json({ error: error.message });
}
