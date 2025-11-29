/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerAuthSession } from "@/lib/auth";
import { axiosInstance } from "@/lib/axios";
import { rescheduleGoogleInterviewEvent } from "@/lib/google/rescheduleGoogleInterviewEvent";
import { getGoogleOAuthClient } from "@/lib/google/oauthClient";
import { google } from "googleapis";
import { NextRequest } from "next/server";

// Refresh access token if expired
const refreshAccessToken = async (oauthClient: any) => {
  try {
    const { credentials } = await oauthClient.refreshAccessToken();
    oauthClient.setCredentials(credentials);
    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh Google access token");
  }
};

export async function PUT(req: NextRequest) {
  const session = await getServerAuthSession();

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const res = await axiosInstance.get(`/api/google`, {
    headers: {
      Authorization: `Bearer ${session.backendTokens.accessToken}`,
    },
  });

  const googleData = res.data.data;
  if (!googleData?.accessToken || !googleData?.refreshToken) {
    return new Response("Google account not connected", { status: 400 });
  }

  const oauthClient = getGoogleOAuthClient();
  oauthClient.setCredentials({
    access_token: googleData.accessToken,
    refresh_token: googleData.refreshToken,
  });

  const oauth2 = google.oauth2({ version: "v2", auth: oauthClient });
  const { data: userInfo } = await oauth2.userinfo.get();

  try {
    const updatedEvent = await rescheduleGoogleInterviewEvent({
      oauthClient,
      eventId: body.eventId,
      startTime: body.scheduledFor,
      endTime: new Date(
        new Date(body.scheduledFor).getTime() + body.durationMins * 60000
      ).toISOString(),
      summary: `Interview – ${body.stage} (Rescheduled)`,
      description: `Rescheduled interview for ${body.applicationId} by ${
        userInfo.name || userInfo.email
      }`,
      attendees: body.interviewerEmails,
    });

    return Response.json(updatedEvent);
  } catch (err: any) {
    if (err?.code === 401 || err?.response?.status === 401) {
      try {
        const refreshedAccessToken = await refreshAccessToken(oauthClient);

        const updatedEvent = await rescheduleGoogleInterviewEvent({
          oauthClient,
          eventId: body.eventId,
          startTime: body.scheduledFor,
          endTime: new Date(
            new Date(body.scheduledFor).getTime() + body.durationMins * 60000
          ).toISOString(),
          summary: `Interview – ${body.stage} (Rescheduled)`,
          description: `Rescheduled interview for ${body.applicationId}`,
          attendees: body.interviewerEmails,
        });

        await axiosInstance.put(
          `/api/google`,
          { accessToken: refreshedAccessToken },
          {
            headers: {
              Authorization: `Bearer ${session.backendTokens.accessToken}`,
            },
          }
        );

        return Response.json(updatedEvent);
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
        return new Response("Google token refresh failed", { status: 401 });
      }
    }

    console.error("Failed to reschedule interview:", err);
    return new Response("Google reschedule failed", { status: 500 });
  }
}
