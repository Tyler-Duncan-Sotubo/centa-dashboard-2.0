"use client";
import Script from "next/script";

export function ZendeskWidget() {
  const key = process.env.NEXT_PUBLIC_ZENDESK_CLIENT_ID;

  if (!key) return null;

  return (
    <Script
      id="ze-snippet"
      strategy="afterInteractive"
      src={`https://static.zdassets.com/ekr/snippet.js?key=${key}`}
    />
  );
}
