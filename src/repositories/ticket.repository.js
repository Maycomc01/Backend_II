import { TicketDAO } from "../dao/ticket.dao.js";

export class TicketRepository {
    constructor() {
        this.dao = new TicketDAO();
    }

    async create(ticketData) {
        return this.dao.create(ticketData);
    }

    async getById(id) {
        return this.dao.findById(id);
    }

    async getAll() {
        return this.dao.findAll();
    }
}
