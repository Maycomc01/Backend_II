import { config } from "dotenv";

config();

export const env = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    google: {
        GOOGLE_AUTH_CLIENT: process.env.GOOGLE_AUTH_CLIENT,
        GOOGLE_AUTH_SECRET: process.env.GOOGLE_AUTH_SECRET
    },
    github: {
        GITHUB_AUTH_CLIENT: process.env.GITHUB_AUTH_CLIENT,
        GITHUB_AUTH_SECRET: process.env.GITHUB_AUTH_SECRET
    }
}
