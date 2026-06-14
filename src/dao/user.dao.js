import { userModel } from "../model/usersModel.js";

export class UserDAO {
    async findAll() {
        return userModel.find({});
    }

    async findById(id) {
        return userModel.findById(id).populate(["cart"]);
    }

    async findByEmail(email) {
        return userModel.findOne({ email });
    }

    async create(data) {
        return userModel.create(data);
    }

    async update(id, data) {
        return userModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return userModel.findByIdAndDelete(id);
    }
}
