import { Router, json } from "express";
import { userModel } from "../model/usersModel.js";
import { usersErrorHandler } from "../middlewares/users.middlewares.js";

const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const users = await userModel.find({});
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const requiredUser = await userModel.findById(req.params.id).populate(["cart"]);
        res.status(200).json(requiredUser);
    } catch (error) {
        console.log(error)
        next(error);
    }
});


router.use(json());

router.post("/", async (req, res, next) => {

    try {
        const newUser = await userModel.create(req.body);
        res.status(201).json({ message: "Usuario creado con éxito", newUser });
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const updatedUser = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        next(error);
    }
});

router.use(usersErrorHandler);

export default router;
