import fs from "fs";
import { __dirname } from "../utils.js";

export class GenericManager {

    constructor(path) {
        this.filePath = `${__dirname}/dao/data/${path}`;

        if (!fs.existsSync(this.filePath)) {
            fs.mkdir(__dirname + "/dao/data", () => {
                fs.writeFileSync(`${__dirname}/dao/data/${path}`, JSON.stringify([]), { encoding: "utf-8" });
                this.filePath = `${__dirname}/dao/data/${path}`
            })
        }
    }
}
