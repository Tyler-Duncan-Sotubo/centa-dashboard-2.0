// app/api/integrations/google/callback/route.ts
import { google } from "googleapis";
import { NextRequest } from "next/server";
import { getGoogleOAuthClient } from "@/lib/google/oauthClient";
import { getServerAuthSession } from "@/lib/auth";
import { axiosInstance } from "@/lib/axios";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const session = await getServerAuthSession();

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const oauth2Client = getGoogleOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshTokenExpiry = (tokens as any).refresh_token_expires_in;

    await axiosInstance.post(
      "/api/google",
      {
        googleEmail: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type,
        scope: tokens.scope,
        expiryDate: new Date(tokens.expiry_date!).toISOString(),
        refreshTokenExpiry: refreshTokenExpiry,
      },
      {
        headers: {
          Authorization: `Bearer ${session.backendTokens?.accessToken}`,
        },
      },
    );

    // Conditionally set redirectUri based on environment
    let redirectUri;

    if (process.env.NODE_ENV === "development") {
      // Development URL
      redirectUri = "http://localhost:3000/dashboard/integrations"; // Adjust to your dev URL
    } else if (process.env.NODE_ENV === "production") {
      // Production URL
      redirectUri = "https://app.centahr.com/dashboard/integrations"; // Adjust to your production URL
    } else {
      // Fallback URL or error handling
      redirectUri = "http://localhost:3000/dashboard/integrations"; // Adjust to fallback URL
    }

    if (!redirectUri) {
      return new Response("Redirect URI not configured", { status: 500 });
    }

    return Response.redirect(redirectUri);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response("OAuth callback failed", { status: 500 });
  }
}
