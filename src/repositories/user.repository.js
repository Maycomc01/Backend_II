import { UserDAO } from "../dao/user.dao.js";

export class UserRepository {
    constructor() {
        this.dao = new UserDAO();
    }

    async getAll() {
        return this.dao.findAll();
    }

    async getById(id) {
        return this.dao.findById(id);
    }

    async getByEmail(email) {
        return this.dao.findByEmail(email);
    }

    async create(userData) {
        return this.dao.create(userData);
    }

    async update(id, data) {
        return this.dao.update(id, data);
    }

    async delete(id) {
        return this.dao.delete(id);
    }
}
