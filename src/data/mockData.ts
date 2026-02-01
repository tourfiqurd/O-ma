import { 
  User, School, Teacher, Student, Parent, 
  AcademicYear, Class, Subject, Exam, Result, GradeScale, Announcement,
  SuperAdminStats, SchoolAdminStats, PrincipalStats, TeacherStats, StudentStats, ParentStats
} from '@/types';

// Demo credentials - all use password: demo123
export const DEMO_CREDENTIALS = {
  super_admin: { email: 'superadmin@rms.com', password: 'demo123' },
  school_admin: { email: 'schooladmin@rms.com', password: 'demo123' },
  principal: { email: 'principal@rms.com', password: 'demo123' },
  teacher: { email: 'teacher@rms.com', password: 'demo123' },
  student: { email: 'student@rms.com', password: 'demo123' },
  parent: { email: 'parent@rms.com', password: 'demo123' },
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'sa-001',
    email: 'superadmin@rms.com',
    name: 'Alex Thompson',
    role: 'super_admin',
    avatar: '',
    phone: '+1 234-567-8900',
    createdAt: '2024-01-01',
  },
  {
    id: 'admin-001',
    email: 'schooladmin@rms.com',
    name: 'Sarah Johnson',
    role: 'school_admin',
    avatar: '',
    phone: '+1 234-567-8901',
    createdAt: '2024-02-15',
  },
  {
    id: 'principal-001',
    email: 'principal@rms.com',
    name: 'Dr. Michael Chen',
    role: 'principal',
    avatar: '',
    phone: '+1 234-567-8902',
    createdAt: '2024-02-16',
  },
  {
    id: 'teacher-001',
    email: 'teacher@rms.com',
    name: 'Emily Davis',
    role: 'teacher',
    avatar: '',
    phone: '+1 234-567-8903',
    createdAt: '2024-03-01',
  },
  {
    id: 'student-001',
    email: 'student@rms.com',
    name: 'James Wilson',
    role: 'student',
    avatar: '',
    phone: '+1 234-567-8904',
    createdAt: '2024-04-01',
  },
  {
    id: 'parent-001',
    email: 'parent@rms.com',
    name: 'Robert Wilson',
    role: 'parent',
    avatar: '',
    phone: '+1 234-567-8905',
    createdAt: '2024-04-01',
  },
];

// Mock Schools
export const mockSchools: School[] = [
  {
    id: 'school-001',
    name: 'Greenwood International School',
    registrationNumber: 'GIS-2024-001',
    email: 'admin@greenwoodschool.edu',
    phone: '+1 234-567-1000',
    address: '123 Education Lane',
    city: 'Springfield',
    state: 'Illinois',
    board: 'CBSE',
    status: 'active',
    adminId: 'admin-001',
    adminName: 'Sarah Johnson',
    subscription: 'premium',
    subscriptionExpiry: '2025-12-31',
    createdAt: '2024-02-15',
    studentCount: 850,
    teacherCount: 45,
  },
  {
    id: 'school-002',
    name: 'Sunrise Academy',
    registrationNumber: 'SA-2024-002',
    email: 'admin@sunriseacademy.edu',
    phone: '+1 234-567-2000',
    address: '456 Knowledge Street',
    city: 'Austin',
    state: 'Texas',
    board: 'ICSE',
    status: 'active',
    adminId: 'admin-002',
    adminName: 'John Smith',
    subscription: 'basic',
    subscriptionExpiry: '2025-06-30',
    createdAt: '2024-03-20',
    studentCount: 520,
    teacherCount: 28,
  },
  {
    id: 'school-003',
    name: 'Valley High School',
    registrationNumber: 'VHS-2024-003',
    email: 'admin@valleyhigh.edu',
    phone: '+1 234-567-3000',
    address: '789 Learning Avenue',
    city: 'Denver',
    state: 'Colorado',
    board: 'State',
    status: 'pending',
    adminId: 'admin-003',
    adminName: 'Maria Garcia',
    subscription: 'free',
    createdAt: '2024-06-01',
    studentCount: 0,
    teacherCount: 0,
  },
];

// Mock Teachers (for school-001)
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-001',
    email: 'teacher@rms.com',
    name: 'Emily Davis',
    role: 'teacher',
    phone: '+1 234-567-8903',
    createdAt: '2024-03-01',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    employeeId: 'EMP-001',
    subjects: ['Mathematics', 'Physics'],
    classes: ['Class 10-A', 'Class 10-B', 'Class 11-A'],
    qualification: 'M.Sc. Mathematics',
    experience: 8,
  },
  {
    id: 'teacher-002',
    email: 'teacher2@rms.com',
    name: 'David Brown',
    role: 'teacher',
    phone: '+1 234-567-8906',
    createdAt: '2024-03-05',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    employeeId: 'EMP-002',
    subjects: ['English', 'Literature'],
    classes: ['Class 10-A', 'Class 10-B', 'Class 9-A'],
    qualification: 'M.A. English Literature',
    experience: 12,
  },
  {
    id: 'teacher-003',
    email: 'teacher3@rms.com',
    name: 'Lisa Anderson',
    role: 'teacher',
    phone: '+1 234-567-8907',
    createdAt: '2024-03-10',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    employeeId: 'EMP-003',
    subjects: ['Chemistry', 'Biology'],
    classes: ['Class 11-A', 'Class 11-B', 'Class 12-A'],
    qualification: 'M.Sc. Chemistry',
    experience: 6,
  },
];

// Mock Students (for school-001)
export const mockStudents: Student[] = [
  {
    id: 'student-001',
    email: 'student@rms.com',
    name: 'James Wilson',
    role: 'student',
    phone: '+1 234-567-8904',
    createdAt: '2024-04-01',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    rollNumber: '2024001',
    class: 'Class 10',
    section: 'A',
    parentId: 'parent-001',
    parentName: 'Robert Wilson',
    dateOfBirth: '2008-05-15',
    admissionDate: '2019-04-01',
    bloodGroup: 'O+',
    address: '123 Maple Street, Springfield',
  },
  {
    id: 'student-002',
    email: 'student2@rms.com',
    name: 'Emma Thompson',
    role: 'student',
    phone: '+1 234-567-8908',
    createdAt: '2024-04-01',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    rollNumber: '2024002',
    class: 'Class 10',
    section: 'A',
    parentId: 'parent-002',
    parentName: 'Mark Thompson',
    dateOfBirth: '2008-08-22',
    admissionDate: '2019-04-01',
    bloodGroup: 'A+',
    address: '456 Oak Avenue, Springfield',
  },
  {
    id: 'student-003',
    email: 'student3@rms.com',
    name: 'Noah Martinez',
    role: 'student',
    phone: '+1 234-567-8909',
    createdAt: '2024-04-01',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    rollNumber: '2024003',
    class: 'Class 10',
    section: 'B',
    dateOfBirth: '2008-03-10',
    admissionDate: '2019-04-01',
    bloodGroup: 'B+',
    address: '789 Pine Road, Springfield',
  },
];

// Mock Parents
export const mockParents: Parent[] = [
  {
    id: 'parent-001',
    email: 'parent@rms.com',
    name: 'Robert Wilson',
    role: 'parent',
    phone: '+1 234-567-8905',
    createdAt: '2024-04-01',
    schoolId: 'school-001',
    schoolName: 'Greenwood International School',
    childrenIds: ['student-001'],
    children: [{ id: 'student-001', name: 'James Wilson', class: 'Class 10', section: 'A' }],
    occupation: 'Software Engineer',
    relationship: 'father',
  },
];

// Mock Academic Years
export const mockAcademicYears: AcademicYear[] = [
  {
    id: 'ay-001',
    schoolId: 'school-001',
    name: '2024-2025',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isActive: true,
  },
  {
    id: 'ay-002',
    schoolId: 'school-001',
    name: '2023-2024',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    isActive: false,
  },
];

// Mock Classes
export const mockClasses: Class[] = [
  { id: 'class-001', schoolId: 'school-001', name: 'Class 9', sections: ['A', 'B', 'C'], academicYearId: 'ay-001' },
  { id: 'class-002', schoolId: 'school-001', name: 'Class 10', sections: ['A', 'B', 'C'], academicYearId: 'ay-001' },
  { id: 'class-003', schoolId: 'school-001', name: 'Class 11', sections: ['A', 'B'], academicYearId: 'ay-001' },
  { id: 'class-004', schoolId: 'school-001', name: 'Class 12', sections: ['A', 'B'], academicYearId: 'ay-001' },
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  { id: 'sub-001', schoolId: 'school-001', name: 'Mathematics', code: 'MATH', classId: 'class-002', teacherId: 'teacher-001', teacherName: 'Emily Davis', maxMarks: 100, passMarks: 35 },
  { id: 'sub-002', schoolId: 'school-001', name: 'English', code: 'ENG', classId: 'class-002', teacherId: 'teacher-002', teacherName: 'David Brown', maxMarks: 100, passMarks: 35 },
  { id: 'sub-003', schoolId: 'school-001', name: 'Physics', code: 'PHY', classId: 'class-002', teacherId: 'teacher-001', teacherName: 'Emily Davis', maxMarks: 100, passMarks: 35 },
  { id: 'sub-004', schoolId: 'school-001', name: 'Chemistry', code: 'CHEM', classId: 'class-002', teacherId: 'teacher-003', teacherName: 'Lisa Anderson', maxMarks: 100, passMarks: 35 },
  { id: 'sub-005', schoolId: 'school-001', name: 'Biology', code: 'BIO', classId: 'class-002', teacherId: 'teacher-003', teacherName: 'Lisa Anderson', maxMarks: 100, passMarks: 35 },
];

// Mock Exams
export const mockExams: Exam[] = [
  {
    id: 'exam-001',
    schoolId: 'school-001',
    academicYearId: 'ay-001',
    name: 'First Unit Test',
    type: 'unit_test',
    startDate: '2024-06-15',
    endDate: '2024-06-22',
    status: 'published',
    classes: ['Class 9', 'Class 10'],
  },
  {
    id: 'exam-002',
    schoolId: 'school-001',
    academicYearId: 'ay-001',
    name: 'Mid-Term Examination',
    type: 'mid_term',
    startDate: '2024-09-01',
    endDate: '2024-09-15',
    status: 'completed',
    classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  },
  {
    id: 'exam-003',
    schoolId: 'school-001',
    academicYearId: 'ay-001',
    name: 'Second Unit Test',
    type: 'unit_test',
    startDate: '2024-11-10',
    endDate: '2024-11-17',
    status: 'ongoing',
    classes: ['Class 9', 'Class 10'],
  },
  {
    id: 'exam-004',
    schoolId: 'school-001',
    academicYearId: 'ay-001',
    name: 'Final Examination',
    type: 'final',
    startDate: '2025-02-15',
    endDate: '2025-03-05',
    status: 'upcoming',
    classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  },
];

// Mock Results for student-001
export const mockResults: Result[] = [
  {
    id: 'result-001',
    examId: 'exam-001',
    examName: 'First Unit Test',
    studentId: 'student-001',
    studentName: 'James Wilson',
    class: 'Class 10',
    section: 'A',
    rollNumber: '2024001',
    subjects: [
      { subjectId: 'sub-001', subjectName: 'Mathematics', marksObtained: 92, maxMarks: 100, grade: 'A+', remarks: 'Excellent' },
      { subjectId: 'sub-002', subjectName: 'English', marksObtained: 85, maxMarks: 100, grade: 'A', remarks: 'Very Good' },
      { subjectId: 'sub-003', subjectName: 'Physics', marksObtained: 88, maxMarks: 100, grade: 'A', remarks: 'Very Good' },
      { subjectId: 'sub-004', subjectName: 'Chemistry', marksObtained: 78, maxMarks: 100, grade: 'B+', remarks: 'Good' },
      { subjectId: 'sub-005', subjectName: 'Biology', marksObtained: 90, maxMarks: 100, grade: 'A+', remarks: 'Excellent' },
    ],
    totalMarks: 433,
    totalMaxMarks: 500,
    percentage: 86.6,
    grade: 'A',
    gpa: 3.8,
    rank: 3,
    status: 'published',
    approvedBy: 'principal-001',
    approvedAt: '2024-06-25',
    publishedAt: '2024-06-26',
  },
  {
    id: 'result-002',
    examId: 'exam-002',
    examName: 'Mid-Term Examination',
    studentId: 'student-001',
    studentName: 'James Wilson',
    class: 'Class 10',
    section: 'A',
    rollNumber: '2024001',
    subjects: [
      { subjectId: 'sub-001', subjectName: 'Mathematics', marksObtained: 95, maxMarks: 100, grade: 'A+', remarks: 'Outstanding' },
      { subjectId: 'sub-002', subjectName: 'English', marksObtained: 88, maxMarks: 100, grade: 'A', remarks: 'Excellent' },
      { subjectId: 'sub-003', subjectName: 'Physics', marksObtained: 91, maxMarks: 100, grade: 'A+', remarks: 'Excellent' },
      { subjectId: 'sub-004', subjectName: 'Chemistry', marksObtained: 84, maxMarks: 100, grade: 'A', remarks: 'Very Good' },
      { subjectId: 'sub-005', subjectName: 'Biology', marksObtained: 93, maxMarks: 100, grade: 'A+', remarks: 'Outstanding' },
    ],
    totalMarks: 451,
    totalMaxMarks: 500,
    percentage: 90.2,
    grade: 'A+',
    gpa: 3.9,
    rank: 2,
    status: 'published',
    approvedBy: 'principal-001',
    approvedAt: '2024-09-20',
    publishedAt: '2024-09-22',
  },
];

// Mock Grade Scale
export const mockGradeScale: GradeScale[] = [
  { id: 'gs-001', schoolId: 'school-001', minPercentage: 90, maxPercentage: 100, grade: 'A+', gradePoint: 4.0, remarks: 'Outstanding' },
  { id: 'gs-002', schoolId: 'school-001', minPercentage: 80, maxPercentage: 89, grade: 'A', gradePoint: 3.7, remarks: 'Excellent' },
  { id: 'gs-003', schoolId: 'school-001', minPercentage: 70, maxPercentage: 79, grade: 'B+', gradePoint: 3.3, remarks: 'Very Good' },
  { id: 'gs-004', schoolId: 'school-001', minPercentage: 60, maxPercentage: 69, grade: 'B', gradePoint: 3.0, remarks: 'Good' },
  { id: 'gs-005', schoolId: 'school-001', minPercentage: 50, maxPercentage: 59, grade: 'C+', gradePoint: 2.5, remarks: 'Average' },
  { id: 'gs-006', schoolId: 'school-001', minPercentage: 40, maxPercentage: 49, grade: 'C', gradePoint: 2.0, remarks: 'Below Average' },
  { id: 'gs-007', schoolId: 'school-001', minPercentage: 35, maxPercentage: 39, grade: 'D', gradePoint: 1.5, remarks: 'Pass' },
  { id: 'gs-008', schoolId: 'school-001', minPercentage: 0, maxPercentage: 34, grade: 'F', gradePoint: 0, remarks: 'Fail' },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    schoolId: 'school-001',
    title: 'Mid-Term Results Published',
    content: 'Dear Students and Parents, the Mid-Term Examination results have been published. Please check your dashboard for detailed results.',
    targetRoles: ['student', 'parent'],
    createdBy: 'principal-001',
    createdByName: 'Dr. Michael Chen',
    createdAt: '2024-09-22',
    isActive: true,
  },
  {
    id: 'ann-002',
    schoolId: 'school-001',
    title: 'Second Unit Test Schedule',
    content: 'The Second Unit Test will be conducted from November 10-17, 2024. Detailed schedule has been shared with class teachers.',
    targetRoles: ['teacher', 'student', 'parent'],
    createdBy: 'principal-001',
    createdByName: 'Dr. Michael Chen',
    createdAt: '2024-10-25',
    isActive: true,
  },
  {
    id: 'ann-003',
    schoolId: 'school-001',
    title: 'Marks Entry Deadline',
    content: 'All teachers are requested to complete marks entry for the ongoing exam by the end of this week.',
    targetRoles: ['teacher'],
    createdBy: 'admin-001',
    createdByName: 'Sarah Johnson',
    createdAt: '2024-11-14',
    isActive: true,
  },
];

// Dashboard Stats
export const mockSuperAdminStats: SuperAdminStats = {
  totalSchools: 45,
  activeSchools: 42,
  pendingApprovals: 3,
  platformUsage: 78,
  monthlyGrowth: 12.5,
};

export const mockSchoolAdminStats: SchoolAdminStats = {
  totalStudents: 850,
  totalTeachers: 45,
  totalClasses: 24,
  activeExams: 2,
  pendingResults: 5,
  publishedResults: 12,
};

export const mockPrincipalStats: PrincipalStats = {
  overallPerformance: 82.5,
  pendingApprovals: 3,
  passRate: 94.2,
  topPerformers: 25,
  weakSubjects: 2,
};

export const mockTeacherStats: TeacherStats = {
  assignedClasses: 3,
  pendingEntries: 45,
  submittedMarks: 120,
  totalStudents: 85,
};

export const mockStudentStats: StudentStats = {
  latestGrade: 'A+',
  gpa: 3.9,
  rank: 2,
  totalExams: 4,
  attendance: 96,
};

export const mockParentStats: ParentStats = {
  childGrade: 'A+',
  childRank: 2,
  attendance: 96,
  upcomingExams: 1,
};

// Pending results for approval
export const mockPendingResults: Result[] = [
  {
    id: 'result-pending-001',
    examId: 'exam-003',
    examName: 'Second Unit Test',
    studentId: 'student-002',
    studentName: 'Emma Thompson',
    class: 'Class 10',
    section: 'A',
    rollNumber: '2024002',
    subjects: [
      { subjectId: 'sub-001', subjectName: 'Mathematics', marksObtained: 88, maxMarks: 100, grade: 'A' },
      { subjectId: 'sub-002', subjectName: 'English', marksObtained: 92, maxMarks: 100, grade: 'A+' },
      { subjectId: 'sub-003', subjectName: 'Physics', marksObtained: 85, maxMarks: 100, grade: 'A' },
    ],
    totalMarks: 265,
    totalMaxMarks: 300,
    percentage: 88.3,
    grade: 'A',
    gpa: 3.8,
    status: 'submitted',
  },
  {
    id: 'result-pending-002',
    examId: 'exam-003',
    examName: 'Second Unit Test',
    studentId: 'student-003',
    studentName: 'Noah Martinez',
    class: 'Class 10',
    section: 'B',
    rollNumber: '2024003',
    subjects: [
      { subjectId: 'sub-001', subjectName: 'Mathematics', marksObtained: 76, maxMarks: 100, grade: 'B+' },
      { subjectId: 'sub-002', subjectName: 'English', marksObtained: 82, maxMarks: 100, grade: 'A' },
      { subjectId: 'sub-003', subjectName: 'Physics', marksObtained: 79, maxMarks: 100, grade: 'B+' },
    ],
    totalMarks: 237,
    totalMaxMarks: 300,
    percentage: 79,
    grade: 'B+',
    gpa: 3.3,
    status: 'submitted',
  },
];
