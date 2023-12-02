export default {
  origin: "*",
  credentials: true,
  allowHeaders: [
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-Type",
    "Date",
  ],
  allowMethods: ["GET", "POST", "OPTIONS", "HEAD"],
};
