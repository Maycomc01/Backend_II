import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: env.GMAIL_EMAIL,
        pass: env.GMAIL_APP_PASSWORD
    }
});

export async function sendResetPasswordEmail(email, resetToken) {
    const resetLink = `http://localhost:${env.PORT}/api/sessions/reset-password/${resetToken}`;

    const mailOptions = {
        from: `Tienda <${env.GMAIL_EMAIL}>`,
        to: email,
        subject: "Recuperación de Contraseña",
        html: `
            <h1>Recuperación de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente botón para restablecerla (el enlace expira en 1 hora):</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Restablecer Contraseña</a>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
        `
    };

    await transporter.sendMail(mailOptions);
}
