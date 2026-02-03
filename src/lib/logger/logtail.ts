import { Logtail } from "@logtail/node";

const token = process.env.LOGTAIL_SOURCE_TOKEN;

if (!token) {
  throw new Error("Missing LOGTAIL_SOURCE_TOKEN");
}

export const logtail = new Logtail(token, {
  endpoint: process.env.LOGTAIL_INGEST_HOST, // undefined is fine (uses default)
});
