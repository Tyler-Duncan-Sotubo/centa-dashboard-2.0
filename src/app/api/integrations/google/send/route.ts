/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { google } from "googleapis";
import { getServerAuthSession } from "@/lib/auth";
import { getGoogleOAuthClient } from "@/lib/google/oauthClient";
import { axiosInstance } from "@/lib/axios";

function base64EncodeEmail(email: string) {
  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { to, subject, body } = await req.json();

  if (!to || !subject || !body) {
    return new Response("Missing email fields", { status: 400 });
  }

  try {
    const tokenRes = await axiosInstance.get(`/api/google`, {
      headers: {
        Authorization: `Bearer ${session.backendTokens.accessToken}`,
      },
    });

    const googleData = tokenRes.data.data;
    const oauthClient = getGoogleOAuthClient();
    oauthClient.setCredentials({
      access_token: googleData.accessToken,
      refresh_token: googleData.refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauthClient });

    const rawMessage = base64EncodeEmail(
      `
To: ${to}
Subject: ${subject}
Content-Type: text/plain; charset="UTF-8"

${body}
    `.trim()
    );

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    return Response.json({ status: "sent", id: result.data.id });
  } catch (err: any) {
    console.error("Failed to send email:", err);
    return new Response("Failed to send email", { status: 500 });
  }
}
