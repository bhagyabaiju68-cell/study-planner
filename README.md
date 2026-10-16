# Study Planner

A web app for UNSW students to track courses, assessments, marks and upcoming deadlines.
Add your courses, enter each assessment with its weight and due date, record marks as they come back,
and see your running average and grade (HD / D / CR / PS / FL) at a glance.

**Live demo:** https://study-planner-2-vfbp.onrender.com
(hosted on Render's free plan, so the first load can take up to a minute while it wakes up)

## Features

- **Courses**: add and delete courses (8-character codes like `COMP1531`)
- **Assessments**: add assessments with a weight and due date; total weight per course can't go over 100%
- **Marks and grade**: enter marks out of 100 and see your weighted average so far, plus the UNSW grade band
- **Upcoming deadlines**: everything due in the next 14 days across all courses, soonest first; marked work drops off
- **Saved between restarts**: data is stored in `data.json`
- **Input validation**: every route checks its input and returns a `400` with a clear error message

## Tech stack

- **Backend:** TypeScript, Node.js, Express
- **Frontend:** HTML, CSS, TypeScript (`fetch` + `async`/`await`), compiled with `tsc`
- **Testing:** Vitest (59 tests, 100% coverage)
- **Code quality:** ESLint, strict TypeScript, GitHub Actions CI (lint + typecheck + tests on every push)

## Running it locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

```bash
npm test            # run the tests
npm run coverage    # tests + coverage report
npm run lint        # check code style (npm run lint-fix to auto-fix)
npm run typecheck   # type-check everything with tsc
npm run build       # compile the page's TypeScript to public/app.js
```

## API

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `/courses` | | `{ courses: [{ code, name }] }` |
| POST | `/courses` | `{ code, name }` | `{ code }` |
| DELETE | `/courses/:code` | | `{}` |
| GET | `/courses/:code/assessments` | | `{ assessments: [{ assessmentId, title, weight, due, mark }] }` |
| POST | `/courses/:code/assessments` | `{ title, weight, due }` | `{ assessmentId }` |
| DELETE | `/assessments/:assessmentId` | | `{}` |
| PUT | `/assessments/:assessmentId/mark` | `{ mark }` | `{}` |
| GET | `/courses/:code/grade` | | `{ earned, markedWeight, average }` |
| GET | `/deadlines?days=14` | | `{ deadlines: [{ code, assessmentId, title, weight, due, daysLeft }] }` |

Dates use the `YYYY-MM-DD` format. Errors return status `400` with `{ error: "message" }`.

## Project structure

```
src/
  dataStore.ts          data types + the shared data object
  interface.ts          exports every function (tests import from here)
  server.ts             Express routes + saving/loading data.json
  functions/
    types.ts            return types for every function
    helpers.ts          isValidDate, findCourse, findAssessment
    clearData.ts
    courses.ts          coursesCreate, coursesList, coursesDelete
    coursesGrade.ts     coursesGrade
    assessments.ts      assessmentsCreate, assessmentsList, assessmentsMark, assessmentsDelete
    deadlinesList.ts    deadlinesList
  tests/                one test file per function
  frontend/
    app.ts              the web page's code (built to public/app.js)
public/
  index.html            the web page
```

The logic in `functions/` has no web or file code, so it can be tested on its own.
