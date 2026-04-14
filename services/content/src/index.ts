import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tracksRouter from "./routers/tracks";
import onboardingRouter from "./routers/onboarding";
import usersRouter from "./routers/users";
import progressRouter from "./routers/progress";
import interviewRouter from "./routers/interview";
import learningPlansRouter from "./routers/learning-plans";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ service: "DeployKaro Content Librarian", status: "healthy", version: "1.0.0" });
});

// API v1 routes
app.use("/v1/tracks", tracksRouter);
app.use("/v1/onboarding", onboardingRouter);
app.use("/v1/user", usersRouter);   // PATCH /settings, GET /profile, GET /leaderboard
app.use("/v1/users", usersRouter);  // Alias — keeps old /v1/users/me/... calls working
app.use("/v1/tracks", progressRouter);
app.use("/v1/interview", interviewRouter); // Interview questions, sessions & answers
app.use("/v1/learning-plans", learningPlansRouter); // AI Learning plans

app.listen(port, () => {
  console.log(`[Librarian]: Sitting at the desk on http://localhost:${port}`);
});
