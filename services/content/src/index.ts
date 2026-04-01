import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
// The blueprints said 3001!
const port = process.env.PORT || 3001;

// Allow the Frontend security clearance
app.use(cors());
app.use(express.json());

// A simple response when someone knocks on the front door
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: "DeployKaro Content Librarian 📚",
    status: "Healthy and Organizing Courses",
    version: "1.0.0"
  });
});

// Turn the lights on and start listening
app.listen(port, () => {
  console.log(`[Librarian]: Sitting at the desk on http://localhost:${port}`);
});
