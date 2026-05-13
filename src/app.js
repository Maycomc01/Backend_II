import express from "express";
import { __dirname } from "./utils.js";
import { env } from "./config/env.js";
import cookieParser from "cookie-parser";
import handlebars from "express-handlebars";
import productsRouter from "./routers/products.routes.js";
import cartsRouter from "./routers/carts.routes.js";
import usersRouter from "./routers/users.routes.js";
import viewsRouter from "./routers/views.routes.js";
import sessionsRouter from "./routers/sessions.routes.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { initializePassport } from "./config/passport.js";
import passport from "passport";

const app = express();

const httpServer = app.listen(env.PORT, () => {
    console.log("server escuchando en " + env.PORT);
    mongoose.connect(env.MONGO_URL)
        .then(() => console.log("conectado a DB"));
});

const socketServer = new Server(httpServer);
socketServer.on("connection", (socket) => { });

app.set("socketServer", socketServer);
app.engine("handlebars", handlebars.engine({
    helpers: {
        isAdmin: (role) => role == "admin"
    },
    partialsDir: __dirname + "/views/partials"
}));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));

app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PASSPORT
initializePassport();
app.use(passport.initialize());

app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);

app.use("/", viewsRouter);
