// lib/google/createGoogleInterviewEvent.ts
import { google } from "googleapis";

interface CreateGoogleInterviewEventParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauthClient: any; // or OAuth2Client if typed
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  timezone?: string;
}

export async function createGoogleInterviewEvent({
  oauthClient,
  summary,
  description = "",
  startTime,
  endTime,
  attendees,
  timezone = "UTC",
}: CreateGoogleInterviewEventParams) {
  const calendar = google.calendar({ version: "v3", auth: oauthClient });

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary,
      description,
      start: { dateTime: startTime, timeZone: timezone },
      end: { dateTime: endTime, timeZone: timezone },
      attendees: attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
    conferenceDataVersion: 1,
  });

  return {
    eventId: event.data.id,
    meetingLink: event.data.hangoutLink,
    calendarLink: event.data.htmlLink,
  };
}
