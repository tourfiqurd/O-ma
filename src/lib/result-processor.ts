import { SubjectGroup } from "./subject-grouping";

export interface StudentResultSubject {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  gpa?: number;
  mcq?: number;
  written?: number;
  isFourth?: boolean;
}

export interface StudentResult {
  studentId: string;
  subjects: StudentResultSubject[];
  [key: string]: any;
}

/**
 * Processes raw student results to group subjects according to the defined groups.
 * Individual subjects that are part of a group are hidden and replaced by the group result.
 * @param results - An array of raw student results.
 * @param groups - An array of subject groups to apply.
 * @returns An array of processed student results with subjects grouped.
 */
export const processGroupedResults = (
  results: StudentResult[],
  groups: SubjectGroup[]
): StudentResult[] => {
  if (!groups || groups.length === 0) {
    return results;
  }

  return results.map(student => {
    const newSubjects: StudentResultSubject[] = [];
    const groupMap = new Map<string, {
      group: SubjectGroup;
      obtained: number;
      mcqTotal: number;
      writtenTotal: number;
    }>();

    // Initialize group map for this student
    groups.forEach(g => {
      groupMap.set(g.id, { group: g, obtained: 0, mcqTotal: 0, writtenTotal: 0 });
    });

    const groupedSubjectIds = new Set(groups.flatMap(g => g.subjectIds));

    // First pass: aggregate grouped subjects and collect non-grouped ones
    student.subjects.forEach(subj => {
      const group = groups.find(g => g.subjectIds.includes(subj.subjectId));
      if (group) {
        const entry = groupMap.get(group.id)!;
        entry.obtained += Number(subj.marksObtained) || 0;
        entry.mcqTotal += Number(subj.mcq) || 0;
        entry.writtenTotal += Number(subj.written) || 0;
      } else {
        newSubjects.push(subj);
      }
    });

    // Add grouped results to the subject list
    groupMap.forEach((entry, groupId) => {
      // Only add the group if at least one of its subjects was found in the student's results
      if (student.subjects.some(s => entry.group.subjectIds.includes(s.subjectId))) {
        // NOTE: GPA/Grade calculation logic can be customized here.
        const percentage = (entry.obtained / entry.group.totalFullMarks) * 100;
        const grade = percentage >= 80 ? 'A+' : percentage >= 70 ? 'A' : percentage >= 60 ? 'A-' : percentage >= 50 ? 'B' : percentage >= 40 ? 'C' : percentage >= 33 ? 'D' : 'F';
        const gpa = percentage >= 80 ? 5.0 : percentage >= 70 ? 4.0 : percentage >= 60 ? 3.5 : percentage >= 50 ? 3.0 : percentage >= 40 ? 2.0 : percentage >= 33 ? 1.0 : 0;

        newSubjects.push({
          subjectId: `group_${groupId}`,
          subjectName: entry.group.name,
          marksObtained: entry.obtained,
          maxMarks: entry.group.totalFullMarks,
          grade,
          gpa,
          mcq: entry.mcqTotal,
          written: entry.writtenTotal,
        });
      }
    });

    return { ...student, subjects: newSubjects };
  });
};