import { logtail } from "./logtail";

export async function flushLogtail() {
  try {
    await logtail.flush();
  } catch {
    // don't throw from logging
  }
}
