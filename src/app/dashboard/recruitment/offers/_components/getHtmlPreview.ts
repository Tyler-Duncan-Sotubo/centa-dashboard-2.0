/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Mustache from "mustache";
import { buildTemplatePreviewData } from "./buildTemplatePreviewData";

export function getHtmlPreview(templateHtml: string): string {
  try {
    const mockData = buildTemplatePreviewData(templateHtml);
    return Mustache.render(templateHtml, mockData);
  } catch (err) {
    return `<p class="text-red-500">Template rendering failed</p>`;
  }
}
