import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Dashboards
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import SuperAdminSchools from "./pages/dashboards/SuperAdminSchools";
import SuperAdminSubscriptions from "./pages/dashboards/SuperAdminSubscriptions";
import SuperAdminSettings from "./pages/dashboards/SuperAdminSettings";
import SchoolAdminDashboard from "./pages/dashboards/SchoolAdminDashboard";
import SchoolAdminAcademic from "./pages/dashboards/SchoolAdminAcademic";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import SchoolAdminUsers from "./pages/dashboards/SchoolAdminUsers";
import SchoolAdminExams from "./pages/dashboards/SchoolAdminExams";
import SchoolAdminResults from "./pages/dashboards/SchoolAdminResults";
import SchoolAdminReports from "./pages/dashboards/SchoolAdminReports";
import SchoolAdminSettings from "./pages/dashboards/SchoolAdminSettings";
import PrincipalDashboard from "./pages/dashboards/PrincipalDashboard";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import TeacherMarksEntry from "./pages/dashboards/TeacherMarksEntry";
import TeacherResults from "./pages/dashboards/TeacherResults";
import TeacherStudents from "./pages/dashboards/TeacherStudents";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import ParentDashboard from "./pages/dashboards/ParentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />











            <Route path="*" element={<NotFound />} />



            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/super-admin/" >
                <Route index  element={<SuperAdminDashboard />} />
                <Route path="schools"  element={<SuperAdminSchools />} />
                <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
                <Route path="settings" element={<SuperAdminSettings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['school_admin']} />}>
              <Route path="/school-admin/">
                <Route  index element={<SchoolAdminDashboard />} />
                <Route path="academic" element={<SchoolAdminAcademic />} />
                <Route path="users" element={<SchoolAdminUsers />} />
                <Route path="exams" element={<SchoolAdminExams />} />
                <Route path="results" element={<SchoolAdminResults />} />
                <Route path="reports" element={<SchoolAdminReports />} />
                <Route path="settings" element={<SchoolAdminSettings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['principal']} />}>
              <Route path="/principal/*" element={<PrincipalDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher" >
                <Route index element={<TeacherDashboard />} />
                <Route path="marks" element={<TeacherMarksEntry />} />
                <Route path="results" element={<TeacherResults />} />
                <Route path="students" element={<TeacherStudents />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/*" element={<StudentDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="/parent/*" element={<ParentDashboard />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;