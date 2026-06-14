import { Router, json } from "express";
import { UserRepository } from "../repositories/user.repository.js";
import { usersErrorHandler } from "../middlewares/users.middlewares.js";

const router = Router();
const userRepository = new UserRepository();

router.get("/", async (req, res, next) => {
    try {
        const users = await userRepository.getAll();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const requiredUser = await userRepository.getById(req.params.id);
        res.status(200).json(requiredUser);
    } catch (error) {
        console.log(error)
        next(error);
    }
});


router.use(json());

router.post("/", async (req, res, next) => {

    try {
        const newUser = await userRepository.create(req.body);
        res.status(201).json({ message: "Usuario creado con éxito", newUser });
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const updatedUser = await userRepository.update(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        await userRepository.delete(req.params.id);
        res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        next(error);
    }
});

router.use(usersErrorHandler);

export default router;
