import { google } from "googleapis";

type RescheduleEventParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauthClient: any;
  eventId: string;
  startTime: string;
  endTime: string;
  summary?: string;
  description?: string;
  attendees?: string[];
  timezone?: string;
  calendarId?: string;
};

export async function rescheduleGoogleInterviewEvent({
  oauthClient,
  eventId,
  startTime,
  endTime,
  summary = "Interview Rescheduled",
  description = "Updated interview details",
  attendees = [],
  timezone = "UTC",
  calendarId = "primary",
}: RescheduleEventParams) {
  const calendar = google.calendar({ version: "v3", auth: oauthClient });

  const updatedEvent = await calendar.events.update({
    calendarId,
    eventId,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: timezone,
      },
      end: {
        dateTime: endTime,
        timeZone: timezone,
      },
      attendees: attendees.map((email) => ({ email })),
    },
  });

  return updatedEvent.data;
}
