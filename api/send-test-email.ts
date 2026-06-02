import { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const data = await resend.emails.send({
      from: "website@devamathacollege.ac.in",
      to: "dmc@devamathacollege.ac.in",
      subject: "Test Email from Vercel",
      html: "<h1>Email system is working!</h1>",
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
}
