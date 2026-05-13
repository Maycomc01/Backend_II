import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";

const filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/public/images")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

export const uploader = multer({ storage });

export function hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function validatePassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

export function generateToken(user) {
    return jwt.sign(user, env.JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
}

export function cookieExtractor(req) {
    let token = req.cookies?.jwt;
    if (!token) {
        const authHeader = req.headers?.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
    }
    return token;
}
