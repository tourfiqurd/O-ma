import React, { useState, useEffect, useMemo } from 'react';
import { SubjectGroupManager } from '@/components/SubjectGroupManager';
import { processGroupedResults, StudentResult } from '@/lib/result-processor';
import { fetchSubjectGroups, SubjectGroup } from '@/lib/subject-grouping';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

// --- Types & Interfaces ---
interface Exam {
  id: string;
  name: string;
}

interface ClassData {
  id: string;
  name: string;
}

// --- Helper Functions ---

/**
 * Fetches raw student results from Firebase.
 * Assumes structure: results/{schoolId}/{classId}/{examId}/{studentId}
 */
const fetchRawResults = async (schoolId: string, classId: string, examId: string): Promise<StudentResult[]> => {
  try {
    // Fixed path: added classId and examId
    const resultsRef = ref(database, `results/${schoolId}/${classId}/${examId}`);
    const snapshot = await get(resultsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        studentId: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching results:", error);
    return [];
  }
};

/**
 * Fetches available exams for the class/school.
 */
const fetchExams = async (schoolId: string): Promise<Exam[]> => {
  // Placeholder: Replace with actual exams fetching logic
  return [
    { id: 'exam_001', name: 'Half Yearly Examination' },
    { id: 'exam_002', name: 'Annual Examination' },
  ];
};

/**
 * Fetches available classes for the school.
 */
const fetchClasses = async (schoolId: string): Promise<ClassData[]> => {
  // Placeholder: Replace with actual class fetching logic
  return [
    { id: 'class_09', name: 'Class 9' },
    { id: 'class_10', name: 'Class 10' },
  ];
};

// --- Main Component ---

const ResultManagement: React.FC = () => {
  // Context / Auth State (Mocked for this example)
  const [schoolId] = useState<string>('school_id_1'); 

  // Selection State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');

  // Data State
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [rawResults, setRawResults] = useState<StudentResult[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [showMarks, setShowMarks] = useState(true);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // Initial Data Load
  useEffect(() => {
    if (schoolId) {
      fetchClasses(schoolId).then(setClasses);
      fetchExams(schoolId).then(setExams);
    }
  }, [schoolId]);

  // Fetch Subject Groups when Class changes
  useEffect(() => {
    if (schoolId && selectedClass) {
      fetchSubjectGroups(schoolId, selectedClass).then(setSubjectGroups);
    } else {
      setSubjectGroups([]);
    }
  }, [schoolId, selectedClass]);

  // Fetch Results when Exam/Class changes
  useEffect(() => {
    if (schoolId && selectedClass && selectedExam) {
      setLoading(true);
      fetchRawResults(schoolId, selectedClass, selectedExam)
        .then(setRawResults)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setRawResults([]);
    }
  }, [schoolId, selectedClass, selectedExam]);

  // Process Results (Apply Grouping)
  const processedResults = useMemo(() => {
    return processGroupedResults(rawResults, subjectGroups);
  }, [rawResults, subjectGroups]);

  // Get unique headers from the first result for the table
  const tableHeaders = useMemo(() => {
    if (processedResults.length === 0) return [];
    return processedResults[0].subjects.map(s => ({
      id: s.subjectId,
      name: s.subjectName,
      fullMarks: s.maxMarks
    }));
  }, [processedResults]);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Result Management</h1>
          <p className="text-muted-foreground">Process, group, and publish student results.</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-card rounded-xl border shadow-sm p-5 space-y-4 md:space-y-0 md:flex md:items-end md:gap-6">
        
        {/* Class Selector */}
        <div className="space-y-2 w-full md:w-48">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Class
          </label>
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Exam Selector */}
        <div className="space-y-2 w-full md:w-48">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Exam
          </label>
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Show Marks Toggle */}
          <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-md border">
            <input
              type="checkbox"
              id="show-marks"
              className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
              checked={showMarks}
              onChange={(e) => setShowMarks(e.target.checked)}
            />
            <label
              htmlFor="show-marks"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show Marks
            </label>
          </div>

          {/* Print Sheet Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            Print Sheet
          </button>

          {/* Merge Subject Button - Only visible when class is selected */}
          {selectedClass && (
            <button
              onClick={() => setIsMergeModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              Merge Subject
            </button>
          )}
          {selectedClass && (
            <SubjectGroupManager 
              schoolId={schoolId} 
              classId={selectedClass} 
              isOpen={isMergeModalOpen}
              onClose={() => setIsMergeModalOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Student ID</th>
                {tableHeaders.map((header) => (
                  <th key={header.id} className="px-6 py-4 text-center font-semibold min-w-[100px]">
                    <div className="flex flex-col items-center">
                      <span>{header.name}</span>
                      <span className="text-[10px] opacity-70 font-normal">FM: {header.fullMarks}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-center font-semibold">Total</th>
                <th className="px-6 py-4 text-center font-semibold">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={100} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading results...
                    </div>
                  </td>
                </tr>
              ) : processedResults.length === 0 ? (
                <tr>
                  <td colSpan={100} className="px-6 py-12 text-center text-muted-foreground">
                    {selectedClass && selectedExam 
                      ? "No results found for this selection." 
                      : "Please select a Class and Exam to view results."}
                  </td>
                </tr>
              ) : (
                processedResults.map((student) => {
                  const totalObtained = student.subjects.reduce((sum, s) => sum + (Number(s.marksObtained) || 0), 0);
                  const totalGPA = (student.subjects.reduce((sum, s) => sum + (s.gpa || 0), 0) / student.subjects.length).toFixed(2);
                  
                  return (
                    <tr key={student.studentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{student.studentId}</td>
                      {student.subjects.map((subj) => (
                        <td key={subj.subjectId} className="px-6 py-4 text-center">
                          {showMarks ? (
                            <span className="font-medium">{subj.marksObtained}</span>
                          ) : (
                            <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              subj.grade === 'F' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {subj.grade}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center font-bold">{totalObtained}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{totalGPA}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultManagement;