// User roles in the system
export type UserRole = 'super_admin' | 'school_admin' | 'principal' | 'teacher' | 'student' | 'parent';

// Base user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

// Super Admin specific
export interface SuperAdmin extends User {
  role: 'super_admin';
}

// School related types
export interface School {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  board: 'CBSE' | 'ICSE' | 'State' | 'Custom';
  status: 'pending' | 'active' | 'suspended';
  adminId: string;
  adminName: string;
  subscription: 'free' | 'basic' | 'premium';
  subscriptionExpiry?: string;
  createdAt: string;
  studentCount: number;
  teacherCount: number;
}

// School Admin specific
export interface SchoolAdmin extends User {
  role: 'school_admin';
  schoolId: string;
  schoolName: string;
}

// Principal specific
export interface Principal extends User {
  role: 'principal';
  schoolId: string;
  schoolName: string;
}

// Teacher specific
export interface Teacher extends User {
  role: 'teacher';
  schoolId: string;
  schoolName: string;
  employeeId: string;
  subjects: string[];
  classes: string[];
  qualification: string;
  experience: number;
}

// Student specific
export interface Student extends User {
  role: 'student';
  schoolId: string;
  schoolName: string;
  rollNumber: string;
  class: string;
  section: string;
  parentId?: string;
  parentName?: string;
  dateOfBirth: string;
  admissionDate: string;
  bloodGroup?: string;
  address?: string;
}

// Parent specific
export interface Parent extends User {
  role: 'parent';
  schoolId: string;
  schoolName: string;
  childrenIds: string[];
  children: { id: string; name: string; class: string; section: string }[];
  occupation?: string;
  relationship: 'father' | 'mother' | 'guardian';
}

// Academic types
export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  sections: string[];
  academicYearId: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  classId: string;
  teacherId?: string;
  teacherName?: string;
  maxMarks: number;
  passMarks: number;
}

// Exam types
export interface Exam {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  type: 'unit_test' | 'mid_term' | 'final' | 'assessment';
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'published';
  classes: string[];
}

// Result types
export interface Mark {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  enteredBy: string;
  enteredAt: string;
}

export interface Result {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  rollNumber: string;
  subjects: {
    subjectId: string;
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    grade: string;
    remarks?: string;
  }[];
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  rank?: number;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
}

// Grading system
export interface GradeScale {
  id: string;
  schoolId: string;
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  gradePoint: number;
  remarks: string;
}

// Announcement
export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetRoles: UserRole[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isActive: boolean;
}

// Dashboard stats types
export interface SuperAdminStats {
  totalSchools: number;
  activeSchools: number;
  pendingApprovals: number;
  platformUsage: number;
  monthlyGrowth: number;
}

export interface SchoolAdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeExams: number;
  pendingResults: number;
  publishedResults: number;
}

export interface PrincipalStats {
  overallPerformance: number;
  pendingApprovals: number;
  passRate: number;
  topPerformers: number;
  weakSubjects: number;
}

export interface TeacherStats {
  assignedClasses: number;
  pendingEntries: number;
  submittedMarks: number;
  totalStudents: number;
}

export interface StudentStats {
  latestGrade: string;
  gpa: number;
  rank: number;
  totalExams: number;
  attendance: number;
}

export interface ParentStats {
  childGrade: string;
  childRank: number;
  attendance: number;
  upcomingExams: number;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

// Navigation item type
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}
