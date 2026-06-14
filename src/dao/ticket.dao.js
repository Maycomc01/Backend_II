import { ticketModel } from "../model/ticketModel.js";

export class TicketDAO {
    async create(data) {
        return ticketModel.create(data);
    }

    async findById(id) {
        return ticketModel.findById(id);
    }

    async findAll() {
        return ticketModel.find({});
    }
}
