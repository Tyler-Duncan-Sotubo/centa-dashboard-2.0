/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGoogleInterviewEvent } from "@/lib/google/createGoogleInterviewEvent";
import { getServerAuthSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import { axiosInstance } from "@/lib/axios";
import { getGoogleOAuthClient } from "@/lib/google/oauthClient";

import { google } from "googleapis";

// Refresh access token if expired
const refreshAccessToken = async (oauthClient: any) => {
  try {
    const { credentials } = await oauthClient.refreshAccessToken();
    oauthClient.setCredentials(credentials);
    return credentials.access_token; // The refreshed token
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh Google access token");
  }
};

// Your POST handler function
export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  // Fetch user's Google account info
  const res = await axiosInstance.get(`/api/google`, {
    headers: {
      Authorization: `Bearer ${session.backendTokens?.accessToken}`,
    },
  });

  const googleData = res.data.data;

  if (!googleData?.accessToken || !googleData?.refreshToken) {
    // 🟢 Skip calendar creation and fallback
    return Response.json({
      eventId: null,
      meetingLink: null,
      skippedGoogle: true,
    });
  }

  const oauthClient = getGoogleOAuthClient();
  oauthClient.setCredentials({
    access_token: googleData.accessToken,
    refresh_token: googleData.refreshToken,
  });

  const oauth2 = google.oauth2({ version: "v2", auth: oauthClient });
  const { data: userInfo } = await oauth2.userinfo.get();

  let event;

  try {
    // Try to create the calendar event
    event = await createGoogleInterviewEvent({
      oauthClient,
      summary: `Interview – ${body.stage}`,
      description: `Interview for Application ${
        body.applicationId
      } Organized by ${userInfo.name || userInfo.email}`,
      startTime: body.scheduledFor,
      endTime: new Date(
        new Date(body.scheduledFor).getTime() + body.durationMins * 60000,
      ).toISOString(),
      attendees: body.interviewerEmails,
      timezone: "UTC",
    });
  } catch (err: any) {
    if (err?.code === 401 || err?.response?.status === 401) {
      try {
        // Refresh token logic
        const refreshedAccessToken = await refreshAccessToken(oauthClient);

        // Retry the event creation with the refreshed token
        event = await createGoogleInterviewEvent({
          oauthClient,
          summary: `Interview – ${body.stage}`,
          description: `Interview for Application ${body.applicationId}`,
          startTime: body.scheduledFor,
          endTime: new Date(
            new Date(body.scheduledFor).getTime() + body.durationMins * 60000,
          ).toISOString(),
          attendees: body.interviewerEmails,
          timezone: "UTC",
        });

        // Optionally, update backend with the refreshed token
        await axiosInstance.put(
          `/api/google`,
          { accessToken: refreshedAccessToken },
          {
            headers: {
              Authorization: `Bearer ${session.backendTokens?.accessToken}`,
            },
          },
        );
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
        return new Response("Google token refresh failed", { status: 401 });
      }
    } else {
      console.error("Google Calendar event creation failed:", err);
      return new Response("Google event creation failed", { status: 500 });
    }
  }

  return Response.json(event);
}
