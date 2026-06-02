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
      batch,
      course,
      current_occupation,
      company,
      address,
      linkedin_profile,
    } = req.body;

    const result = await resend.emails.send({
      from: "dmc@devamathacollege.ac.in",
      to: toMails,
      subject: `New Alumni Registration - ${name}`,
      html: `
        <h2>New Alumni Registration</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Batch:</strong> ${batch}</p>
        <p><strong>Course:</strong> ${course}</p>

        <hr>

        <p><strong>Current Occupation:</strong> ${current_occupation}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>LinkedIn:</strong> ${linkedin_profile}</p>
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
