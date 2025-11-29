/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { google } from "googleapis";
import { getServerAuthSession } from "@/lib/auth";
import { getGoogleOAuthClient } from "@/lib/google/oauthClient";
import { axiosInstance } from "@/lib/axios";

const refreshAccessToken = async (oauthClient: any, session: any) => {
  try {
    const { credentials } = await oauthClient.refreshAccessToken();
    oauthClient.setCredentials(credentials);

    // Update access token in DB
    await axiosInstance.put(
      `/api/google`,
      { accessToken: credentials.access_token },
      {
        headers: {
          Authorization: `Bearer ${session.backendTokens.accessToken}`,
        },
      }
    );

    return credentials.access_token;
  } catch (err) {
    console.error("Token refresh error:", err);
    throw new Error("Google token refresh failed");
  }
};

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { candidateEmail } = await req.json();
  if (!candidateEmail) {
    return new Response("Missing candidate email", { status: 400 });
  }

  const res = await axiosInstance.get(`/api/google`, {
    headers: {
      Authorization: `Bearer ${session.backendTokens.accessToken}`,
    },
  });

  const googleData = res.data.data;
  const oauthClient = getGoogleOAuthClient();
  oauthClient.setCredentials({
    access_token: googleData.accessToken,
    refresh_token: googleData.refreshToken,
  });

  const fetchGmailThread = async () => {
    const gmail = google.gmail({ version: "v1", auth: oauthClient });

    const threadList = await gmail.users.messages.list({
      userId: "me",
      q: `to:${candidateEmail} OR from:${candidateEmail}`,
      maxResults: 5,
    });

    const messages = threadList.data.messages;
    if (!messages || messages.length === 0) {
      return null;
    }

    const fullMessages = await Promise.all(
      messages.map(async (m) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: m.id!,
          format: "full",
        });

        const payload = msg.data.payload;
        const headers = payload?.headers || [];

        const from = headers.find((h) => h.name === "From")?.value ?? "";
        const to = headers.find((h) => h.name === "To")?.value ?? "";
        const date = headers.find((h) => h.name === "Date")?.value ?? "";
        const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
        const snippet = msg.data.snippet ?? "";

        const parts = payload?.parts || [];
        const plainPart = parts.find((p) => p.mimeType === "text/plain");
        const bodyData = plainPart?.body?.data || payload?.body?.data || "";
        const decodedBody = Buffer.from(bodyData, "base64").toString("utf-8");

        return {
          id: msg.data.id!,
          from,
          to,
          date,
          subject,
          snippet,
          body: decodedBody,
        };
      })
    );

    return {
      id: messages[0].threadId || "unknown-thread-id",
      subject: fullMessages[0].subject,
      snippet: fullMessages[0].snippet,
      messages: fullMessages,
    };
  };

  try {
    const thread = await fetchGmailThread();
    if (!thread) {
      return new Response("No messages found", { status: 404 });
    }
    return Response.json(thread);
  } catch (err: any) {
    // Attempt token refresh on 401
    if (err?.code === 401 || err?.response?.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken(oauthClient, session);
        oauthClient.setCredentials({ access_token: newAccessToken });

        const retriedThread = await fetchGmailThread();
        if (!retriedThread) {
          return new Response("No messages found after retry", { status: 404 });
        }
        return Response.json(retriedThread);
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
        return new Response("Google token refresh failed", { status: 401 });
      }
    }

    console.error("Gmail fetch failed:", err);
    return new Response("Failed to fetch Gmail message", { status: 500 });
  }
}
