import express, { Request, Response } from 'express';
import fs from 'fs';
import { data, setData } from './dataStore.ts';
import {
  coursesCreate, coursesList, coursesDelete, coursesGrade,
  assessmentsCreate, assessmentsList, assessmentsMark, assessmentsDelete,
  deadlinesList,
  authRegister,
  authLogin,
  authLogout
} from './interface.ts';
import { findUserIdByToken } from './functions/helpers.ts';

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

app.post('/auth/register', (req: Request, res: Response) => {
  const result = authRegister(req.body.email, req.body.password);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.post('/auth/login', (req: Request, res: Response) => {
  const result = authLogin(req.body.email, req.body.password);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.post('/auth/logout', (req: Request, res: Response) => {
  const result = authLogout(req.header('token') ?? '');
  if ('error' in result) {
    res.status(401).json(result);
    return;
  }
  save();
  res.json(result);
});

app.get('/courses', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  res.json(coursesList(userId));
});

app.post('/courses', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const code = req.body.code;
  const name = req.body.name;
  const result = coursesCreate(userId, code, name);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.delete('/courses/:code', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const result = coursesDelete(userId, req.params.code as string);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.get('/courses/:code/grade', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const result = coursesGrade(userId, req.params.code as string);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.get('/courses/:code/assessments', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const result = assessmentsList(userId, req.params.code as string);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.post('/courses/:code/assessments', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const title = req.body.title;
  const weight = req.body.weight;
  const due = req.body.due;
  const result = assessmentsCreate(userId, req.params.code as string, title, weight, due);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.put('/assessments/:assessmentId/mark', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const result = assessmentsMark(userId, Number(req.params.assessmentId), req.body.mark);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.delete('/assessments/:assessmentId', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  const result = assessmentsDelete(userId, Number(req.params.assessmentId));
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  save();
  res.json(result);
});

app.get('/deadlines', (req: Request, res: Response) => {
  const userId = findUserIdByToken(req.header('token') ?? '');
  if (userId === null) {
    res.status(401).json({ error: 'Invalid Token' });
    return;
  }
  let days = 14;
  if (req.query.days !== undefined) {
    days = Number(req.query.days);
  }
  const result = deadlinesList(userId, todayString(), days);
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
