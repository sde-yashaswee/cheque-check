import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c506609cc50e737041573ea61532bd6c@o4511763990577152.ingest.us.sentry.io/4511859247153152",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
