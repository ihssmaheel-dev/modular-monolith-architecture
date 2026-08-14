import { http, HttpResponse } from "msw";

export const handlers = [
  // Intercept GET /api/health to confirm mock is working
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok", mocked: true });
  }),
];
