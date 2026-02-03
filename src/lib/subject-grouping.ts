import { database } from "./firebase";
import { ref, get, set, push, remove } from "firebase/database";

export interface Subject {
  id: string;
  name: string;
  code?: string;
  fullMarks: number;
  passMarks?: number;
  classId: string;
  schoolId: string;
}

export interface SubjectGroup {
  id: string;
  name: string;
  subjectIds: string[];
  totalFullMarks: number;
  passMark?: number;
  schoolId: string;
  classId: string;
}

/**
 * Fetches all subjects for a specific school and class from Firebase.
 * @param schoolId - The ID of the school.
 * @param classId - The ID of the class.
 * @returns A promise that resolves to an array of subjects.
 */
export const fetchSubjects = async (schoolId: string, classId: string): Promise<Subject[]> => {
  const subjectsRef = ref(database, 'subjects');
  const snapshot = await get(subjectsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data)
      .map(key => ({ id: key, ...data[key], fullMarks: data[key].fullMarks || 100 }))
      .filter((subject: any) => subject.schoolId === schoolId);
  }
  return [];
};

/**
 * Fetches all subject groups for a specific school and class.
 * @param schoolId - The ID of the school.
 * @param classId - The ID of the class.
 * @returns A promise that resolves to an array of subject groups.
 */
export const fetchSubjectGroups = async (schoolId: string, classId: string): Promise<SubjectGroup[]> => {
  const groupsRef = ref(database, `subject_groups/${schoolId}/${classId}`);
  const snapshot = await get(groupsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
  }
  return [];
};

/**
 * Saves (creates or updates) a subject group in Firebase.
 * @param group - The subject group data to save.
 * @param groupId - The ID of the group to update. If not provided, a new group is created.
 */
export const saveSubjectGroup = async (group: Omit<SubjectGroup, 'id'>, groupId?: string): Promise<void> => {
  const groupRef = groupId
    ? ref(database, `subject_groups/${group.schoolId}/${group.classId}/${groupId}`)
    : push(ref(database, `subject_groups/${group.schoolId}/${group.classId}`));
  
  await set(groupRef, group);
};

/**
 * Deletes a subject group from Firebase.
 * @param schoolId - The ID of the school.
 * @param classId - The ID of the class.
 * @param groupId - The ID of the group to delete.
 */
export const deleteSubjectGroup = async (schoolId: string, classId: string, groupId: string): Promise<void> => {
  await remove(ref(database, `subject_groups/${schoolId}/${classId}/${groupId}`));
};