import nodemailer from "nodemailer";
// SOL_PRIVATE_KEY=""
// SMTP_USERNAME=""
// SMTP_PASSWORD=""
// SMTP_ENDPOINT

const user = process.env.SMTP_USERNAME;
const pass = process.env.SMTP_PASSWORD;

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: user,
        pass: pass,
    },
});

export async function sendEmail(to: string, body: string) {
    await transport.sendMail({
        from: user,
        to: to,
        subject: "Hello, from the zapier_clone_app",
        text: body
    })
}