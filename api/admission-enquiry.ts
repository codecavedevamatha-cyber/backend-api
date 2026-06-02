import { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { toMails, validateRequest } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {

   const origin = req.headers.origin;

   res.setHeader("Access-Control-Allow-Origin", origin || "*");

   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

   // Handle preflight request
   if (req.method === "OPTIONS") {
     return res.status(200).end();
   }


  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const isValid = await validateRequest(req, res);

  if (!isValid) {
    return;
  }

  try {
    const {
      name,
      email,
      phone,
      course,
      percentage,
      previous_school,
      address,
      parent_name,
      parent_phone,
    } = req.body;

    const result = await resend.emails.send({
      from: "dmc@devamathacollege.ac.in",
      to: toMails,
      subject: `New Admission Enquiry - ${name}`,
      html: `
        <h2>New Admission Enquiry</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Percentage:</strong> ${percentage}</p>
        <p><strong>Previous School:</strong> ${previous_school}</p>
        <p><strong>Address:</strong> ${address}</p>

        <hr>

        <p><strong>Parent Name:</strong> ${parent_name}</p>
        <p><strong>Parent Phone:</strong> ${parent_phone}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to send email",
    });
  }
}
