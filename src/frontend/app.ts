// The web page's code. `npm run build` turns this into public/app.js

interface Course {
  code: string;
  name: string;
}

interface Assessment {
  assessmentId: number;
  title: string;
  weight: number;
  due: string;
  mark: number | null;
}

interface Grade {
  earned: number;
  markedWeight: number;
  average: number | null;
}

interface Deadline {
  code: string;
  assessmentId: number;
  title: string;
  weight: number;
  due: string;
  daysLeft: number;
}

// finds an element on the page by its id
function getElement(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

function getInput(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

// the course currently shown below the list (null = none)
let selectedCode: string | null = null;

async function loadCourses(): Promise<void> {
  const response = await fetch('/courses');
  const data: { courses: Course[] } = await response.json();

  const list = getElement('course-list');
  list.textContent = '';

  if (data.courses.length === 0) {
    list.textContent = 'No courses yet.';
    return;
  }

  for (const course of data.courses) {
    const item = document.createElement('li');
    if (course.code === selectedCode) {
      item.className = 'selected';
    }

    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = course.code;

    const name = document.createElement('span');
    name.textContent = course.name;

    item.appendChild(code);
    item.appendChild(name);
    item.addEventListener('click', () => {
      showCourse(course.code, course.name);
    });
    list.appendChild(item);
  }
}

async function addCourse(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const code = getInput('code').value;
  const name = getInput('name').value;
  const error = getElement('error');

  const response = await fetch('/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code, name: name }),
  });
  const data = await response.json();

  if (!response.ok) {
    error.textContent = data.error;
    return;
  }

  error.textContent = '';
  getInput('code').value = '';
  getInput('name').value = '';
  loadCourses();
}

// UNSW grade bands
function gradeLetter(average: number): string {
  if (average >= 85) {
    return 'HD';
  }
  if (average >= 75) {
    return 'D';
  }
  if (average >= 65) {
    return 'CR';
  }
  if (average >= 50) {
    return 'PS';
  }
  return 'FL';
}

function showCourse(code: string, name: string): void {
  selectedCode = code;
  getElement('details').style.display = 'block';
  getElement('details-title').textContent = code + ' ' + name;
  getElement('details-error').textContent = '';
  loadCourses();
  loadGrade();
  loadAssessments();
}

async function loadGrade(): Promise<void> {
  const response = await fetch('/courses/' + selectedCode + '/grade');
  const data: Grade = await response.json();
  const grade = getElement('grade');

  if (data.average === null) {
    grade.textContent = 'No marks yet';
    return;
  }
  grade.textContent = 'Average so far: ' + data.average + '% ' + gradeLetter(data.average)
    + ' (' + data.earned + ' of ' + data.markedWeight + ' marked)';
}

async function loadAssessments(): Promise<void> {
  const response = await fetch('/courses/' + selectedCode + '/assessments');
  const data: { assessments: Assessment[] } = await response.json();

  const list = getElement('assessment-list');
  list.textContent = '';

  if (data.assessments.length === 0) {
    list.textContent = 'No assessments yet.';
    return;
  }

  for (const assessment of data.assessments) {
    const item = document.createElement('li');
    item.className = 'assessment';

    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('div');
    title.textContent = assessment.title + ' (' + assessment.weight + '%)';
    const due = document.createElement('div');
    due.className = 'due';
    due.textContent = 'Due ' + assessment.due;
    info.appendChild(title);
    info.appendChild(due);

    const markInput = document.createElement('input');
    markInput.type = 'number';
    markInput.placeholder = 'mark';
    if (assessment.mark !== null) {
      markInput.value = String(assessment.mark);
    }

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
      saveMark(assessment.assessmentId, markInput.value);
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.textContent = '✕';
    deleteButton.title = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteAssessment(assessment.assessmentId, assessment.title);
    });

    item.appendChild(info);
    item.appendChild(markInput);
    item.appendChild(saveButton);
    item.appendChild(deleteButton);
    list.appendChild(item);
  }
}

async function saveMark(assessmentId: number, value: string): Promise<void> {
  const error = getElement('details-error');
  if (value === '') {
    error.textContent = 'Enter a mark first';
    return;
  }

  const response = await fetch('/assessments/' + assessmentId + '/mark', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mark: Number(value) }),
  });
  const data = await response.json();

  if (!response.ok) {
    error.textContent = data.error;
    return;
  }

  error.textContent = '';
  loadGrade();
  loadDeadlines();
}

async function addAssessment(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const title = getInput('title').value;
  const weight = getInput('weight').value;
  const due = getInput('due').value;
  const error = getElement('details-error');

  if (weight === '' || due === '') {
    error.textContent = 'Fill in the weight and due date';
    return;
  }

  const response = await fetch('/courses/' + selectedCode + '/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, weight: Number(weight), due: due }),
  });
  const data = await response.json();

  if (!response.ok) {
    error.textContent = data.error;
    return;
  }

  error.textContent = '';
  getInput('title').value = '';
  getInput('weight').value = '';
  getInput('due').value = '';
  loadAssessments();
  loadDeadlines();
}

function daysText(daysLeft: number): string {
  if (daysLeft === 0) {
    return 'today';
  }
  if (daysLeft === 1) {
    return 'tomorrow';
  }
  return 'in ' + daysLeft + ' days';
}

async function loadDeadlines(): Promise<void> {
  const response = await fetch('/deadlines');
  const data: { deadlines: Deadline[] } = await response.json();

  const list = getElement('deadline-list');
  list.textContent = '';

  if (data.deadlines.length === 0) {
    list.textContent = 'Nothing due soon.';
    return;
  }

  for (const deadline of data.deadlines) {
    const item = document.createElement('li');

    const left = document.createElement('span');
    left.textContent = deadline.code + ' ' + deadline.title + ' (' + deadline.weight + '%)';

    const right = document.createElement('span');
    right.textContent = daysText(deadline.daysLeft);
    if (deadline.daysLeft <= 3) {
      right.className = 'soon';
    }

    item.appendChild(left);
    item.appendChild(right);
    list.appendChild(item);
  }
}

async function deleteAssessment(assessmentId: number, title: string): Promise<void> {
  if (!confirm('Delete ' + title + '?')) {
    return;
  }
  await fetch('/assessments/' + assessmentId, { method: 'DELETE' });
  loadAssessments();
  loadGrade();
  loadDeadlines();
}

async function deleteCourse(): Promise<void> {
  if (!confirm('Delete ' + selectedCode + ' and all its assessments?')) {
    return;
  }
  await fetch('/courses/' + selectedCode, { method: 'DELETE' });
  selectedCode = null;
  getElement('details').style.display = 'none';
  loadCourses();
  loadDeadlines();
}

getElement('add-form').addEventListener('submit', addCourse);
getElement('assessment-form').addEventListener('submit', addAssessment);
getElement('delete-course').addEventListener('click', deleteCourse);
loadCourses();
loadDeadlines();

// makes this file a module, so its names don't clash with other files
export {};
