import { getGoogleAuthURL } from "@/lib/google/oauthClient";

export async function GET() {
  const url = getGoogleAuthURL();

  return Response.json({ url });
}
