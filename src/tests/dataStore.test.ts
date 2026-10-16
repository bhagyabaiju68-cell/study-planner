import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesList, coursesGrade, assessmentsCreate, assessmentsMark } from '../interface.ts';
import { data, setData } from '../dataStore.ts';

beforeEach(() => {
  clearData();
});

// same as saving to data.json, restarting the server, and loading it back
function saveAndReload() {
  const saved = JSON.stringify(data);
  clearData();
  setData(JSON.parse(saved));
}

describe('dataStore save and load', () => {
  test('empty at the start', () => {
    expect(data).toStrictEqual({ courses: [], nextAssessmentId: 1 });
  });

  test('everything comes back after a save and load', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    assessmentsMark(lab.assessmentId, 80);
    saveAndReload();
    expect(coursesList()).toStrictEqual({ courses: [{ code: 'COMP1531', name: 'Software Eng' }] });
    expect(coursesGrade('COMP1531')).toStrictEqual({ earned: 8, markedWeight: 10, average: 80 });
  });

  test('new ids keep counting up after loading', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    saveAndReload();
    expect(assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30')).not.toStrictEqual({ assessmentId: lab.assessmentId });
  });
});
