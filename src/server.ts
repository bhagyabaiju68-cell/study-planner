import express, { Request, Response } from 'express';
import fs from 'fs';
import { data, setData } from './dataStore.ts';
import {
  coursesCreate, coursesList, coursesDelete, coursesGrade,
  assessmentsCreate, assessmentsList, assessmentsMark, assessmentsDelete,
  deadlinesList
} from './interface.ts';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const DATA_FILE = 'data.json';

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function load() {
  if (fs.existsSync(DATA_FILE)) {
    setData(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  }
}

// today's date as YYYY-MM-DD in the computer's own timezone
function todayString(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return now.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
}

app.get('/courses', (req: Request, res: Response) => {
  res.json(coursesList());
});

app.post('/courses', (req: Request, res: Response) => {
  const code = req.body.code;
  const name = req.body.name;
  const result = coursesCreate(code, name);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.delete('/courses/:code', (req: Request, res: Response) => {
  const result = coursesDelete(req.params.code as string);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.get('/courses/:code/grade', (req: Request, res: Response) => {
  const result = coursesGrade(req.params.code as string);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.get('/courses/:code/assessments', (req: Request, res: Response) => {
  const result = assessmentsList(req.params.code as string);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.post('/courses/:code/assessments', (req: Request, res: Response) => {
  const title = req.body.title;
  const weight = req.body.weight;
  const due = req.body.due;
  const result = assessmentsCreate(req.params.code as string, title, weight, due);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.put('/assessments/:assessmentId/mark', (req: Request, res: Response) => {
  const result = assessmentsMark(Number(req.params.assessmentId), req.body.mark);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.delete('/assessments/:assessmentId', (req: Request, res: Response) => {
  const result = assessmentsDelete(Number(req.params.assessmentId));
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.get('/deadlines', (req: Request, res: Response) => {
  let days = 14;
  if (req.query.days !== undefined) {
    days = Number(req.query.days);
  }
  const result = deadlinesList(todayString(), days);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

load();

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
