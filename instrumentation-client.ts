import posthog from "posthog-js";
import { CONSTANTS } from "./lib/config/constant";

posthog.init(CONSTANTS.ENV.POSTHOG.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ingest",
  ui_host: CONSTANTS.ENV.POSTHOG.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
