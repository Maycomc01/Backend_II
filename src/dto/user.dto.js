export class UserDTO {
    constructor(user) {
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.role = user.role;
        if (user.cart) {
            this.cart = user.cart;
        }
    }
}

export function getUserDTO(user) {
    return new UserDTO(user);
}
