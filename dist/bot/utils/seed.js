import { Auth } from "../../models/adminPanel.js";

export async function createAdmin() {
    try {
        const user = await Auth.findOne({ username: 'admin' });
        if (!user) {
            await Auth.create({ username: 'admin', password: 'aA123456789!@#' });
        }
    } catch (error) {
        console.error(error);
    }
}
