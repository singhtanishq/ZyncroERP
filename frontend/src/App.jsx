import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import useAuth from "./lib/auth/useAuth";
import { ThemeProvider } from "./lib/theme/ThemeProvider";
import { ToastProvider } from "./components/common/ToastProvider";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AddStudent from "./pages/dashboard/students/AddStudent";
import ManageStudents from "./pages/dashboard/students/ManageStudents";
import GenerateDigitalIdCards from "./pages/dashboard/students/GenerateDigitalIdCards";
import MobileAttendance from "./pages/attendance/MobileAttendance";
import ManageAttendance from "./pages/dashboard/attendance/ManageAttendance";
import AddCourses from "./pages/dashboard/courses/AddCourses";
import ManageCourses from "./pages/dashboard/courses/ManageCourses";
import ManageStudyMaterials from "./pages/dashboard/study-materials/ManageStudyMaterials";
import ManageOnlineClasses from "./pages/dashboard/online-classes/ManageOnlineClasses";
import ManageExams from "./pages/dashboard/exams/ManageExams";
import ScheduleExam from "./pages/dashboard/exams/ScheduleExam";
import AdmitCards from "./pages/dashboard/exams/AdmitCards";
import PublishResults from "./pages/dashboard/exams/PublishResults";
import IssueCertificates from "./pages/dashboard/exams/IssueCertificates";
import PendingApproval from "./pages/common/PendingApproval";
import AddFranchise from "./pages/dashboard/franchise/AddFranchise";
import ManageFranchise from "./pages/dashboard/franchise/ManageFranchise";
import AddFaculty from "./pages/dashboard/faculty/AddFaculty.jsx";
import ManageFaculty from "./pages/dashboard/faculty/ManageFaculty.jsx";
import ManagePayments from "./pages/dashboard/payments/ManagePayments";
import StudentFees from "./pages/dashboard/payments/StudentFees";
import FranchisePayments from "./pages/dashboard/payments/FranchisePayments";
import FacultyPayouts from "./pages/dashboard/payments/FacultyPayouts";
import ManageProfile from "./pages/dashboard/ManageProfile";
import PaymentHistory from "./pages/dashboard/payments/PaymentHistory";
import AddUser from "./pages/dashboard/user-management/AddUser";
import ManageUsers from "./pages/dashboard/user-management/ManageUsers";
import PendingUsers from "./pages/dashboard/user-management/PendingUsers";
import RoleBasedRoute from "./lib/auth/RoleBasedRoute";
import SendBulkEmails from "./pages/dashboard/communication/SendBulkEmails";
import EmailLogs from "./pages/dashboard/communication/EmailLogs";
import Roles from "./pages/dashboard/corporate/Roles";
import AddEmployee from "./pages/dashboard/corporate/AddEmployee";
import ManageEmployees from "./pages/dashboard/corporate/ManageEmployees";
import IssueCertificate from "./pages/dashboard/corporate/IssueCertificate";
import AttendanceReport from "./pages/dashboard/reports/AttendanceReport";
import PaymentAnalytics from "./pages/dashboard/reports/PaymentAnalytics";
import EnrollmentCenter from "./pages/dashboard/students/EnrollmentCenter";
import StudentDashboardLayout from "./layouts/student/StudentDashboardLayout";
import StudentHome from "./pages/student-dashboard/StudentHome";
import EnrollCourse from "./pages/student-dashboard/EnrollCourse";
import StudentStudyMaterials from "./pages/student-dashboard/my-learning/StudentStudyMaterials";
import OnlineClasses from "./pages/student-dashboard/my-learning/OnlineClasses";
import MyCourses from "./pages/student-dashboard/my-learning/MyCourses";
import DigitalIdCard from "./pages/student-dashboard/my-learning/DigitalIdCard";
import QrAttendance from "./pages/student-dashboard/my-learning/QrAttendance";
import MyExams from "./pages/student-dashboard/exams/MyExams";
import MyAdmitCards from "./pages/student-dashboard/exams/MyAdmitCards";
import MyResults from "./pages/student-dashboard/exams/MyResults";
import MyCertificates from "./pages/student-dashboard/certificates/MyCertificates";
import MakePayment from "./pages/student-dashboard/payments/MakePayment";
import UploadPaymentProof from "./pages/student-dashboard/payments/UploadPaymentProof";
import TrackCourseFees from "./pages/student-dashboard/payments/TrackCourseFees";
import StudentPaymentHistory from "./pages/student-dashboard/payments/PaymentHistory";
import Assignments from "./pages/dashboard/exams/Assignments";
import StudentAssignments from "./pages/student-dashboard/exams/Assignments";
import Communication from "./pages/student-dashboard/Communication";
import ManageStudentCommunications from "./pages/dashboard/student-communications/ManageStudentCommunications";
import AssignCourses from "./pages/dashboard/faculty/AssignCourses";
import FacultyDashboardLayout from "./layouts/faculty/FacultyDashboardLayout";
import FacultyHome from "./pages/faculty-dashboard/FacultyHome";
import FacultyMyCourses from "./pages/faculty-dashboard/courses/FacultyMyCourses";
import FacultyMyStudents from "./pages/faculty-dashboard/students/FacultyMyStudents";
import FacultyStudyMaterials from "./pages/faculty-dashboard/content/FacultyStudyMaterials";
import FacultyOnlineClasses from "./pages/faculty-dashboard/content/FacultyOnlineClasses";
import FacultyQrAttendance from "./pages/faculty-dashboard/content/FacultyQrAttendance";
import FacultyAssignments from "./pages/faculty-dashboard/assessment/FacultyAssignments";
import FacultyScheduleExams from "./pages/faculty-dashboard/assessment/FacultyScheduleExams";
import FacultyManageExams from "./pages/faculty-dashboard/assessment/FacultyManageExams";
import FacultyAdmitCards from "./pages/faculty-dashboard/assessment/FacultyAdmitCards";
import FacultyResults from "./pages/faculty-dashboard/assessment/FacultyResults";
import FacultyIssueCertificates from "./pages/faculty-dashboard/certificates/FacultyIssueCertificates";
import FacultyAnnouncements from "./pages/faculty-dashboard/communication/FacultyAnnouncements";
import FacultyMyPayouts from "./pages/faculty-dashboard/finance/FacultyMyPayouts";
import FacultyAttendanceReports from "./pages/faculty-dashboard/reports/FacultyAttendanceReports";

// Franchise dashboard
import FranchiseDashboardLayout from "./layouts/franchise/FranchiseDashboardLayout";
import FranchiseHome from "./pages/franchise-dashboard/FranchiseHome";
import FranchiseStudents from "./pages/franchise-dashboard/students/FranchiseStudents";
import FranchiseStudentReports from "./pages/franchise-dashboard/reports/FranchiseStudentReports";
import FranchiseRevenue from "./pages/franchise-dashboard/payments/FranchiseRevenue";
import FranchiseCommission from "./pages/franchise-dashboard/payments/FranchiseCommission";
import FranchiseRevenueReports from "./pages/franchise-dashboard/reports/FranchiseRevenueReports";
import FranchiseFaculty from "./pages/franchise-dashboard/faculty/FranchiseFaculty";
import FranchiseEnrollments from "./pages/franchise-dashboard/enrollments/FranchiseEnrollments";
import FranchiseCourses from "./pages/franchise-dashboard/courses/FranchiseCourses";
import FranchiseAnnouncements from "./pages/franchise-dashboard/announcements/FranchiseAnnouncements";

// Employee dashboard
import EmployeeHome from "./pages/employee-dashboard/EmployeeHome";
import EmployeeCertificates from "./pages/employee-dashboard/EmployeeCertificates";
import EmployeeProfile from "./pages/employee-dashboard/EmployeeProfile";
import EmployeeAnnouncements from "./pages/employee-dashboard/EmployeeAnnouncements";
import EmployeeDirectory from "./pages/employee-dashboard/EmployeeDirectory";

// Corporate announcements (admin)
import CorporateAnnouncements from "./pages/dashboard/corporate/CorporateAnnouncements";

function ProtectedRoute({ children, auth }) {
  const { user, loading } = auth;

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Guards a dashboard area to a single role. Unauthenticated users go to
 * login; unapproved accounts go to the pending screen; everyone else is
 * routed to their own role's home.
 */
function RoleRoute({ children, auth, role }) {
  const { user, loading } = auth;

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.approve_status !== true) {
    return <Navigate to="/pending" replace />;
  }

  if (user.role !== role) {
    return <RoleBasedRoute />;
  }

  return children;
}

function PublicRoute({ children, auth }) {
  const { user, loading } = auth;

  if (loading) return null;

  if (user) {
    if (user.approve_status === true) {
      return <Navigate to="/dashboard-role" replace />;
    }

    return <Navigate to="/pending" replace />;
  }

  return children;
}

function PendingRoute({ children, auth }) {
  const { user, loading } = auth;

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.approve_status === true) {
    return <Navigate to="/dashboard-role" replace />;
  }

  return children;
}

function App() {
  const auth = useAuth();

  return (
    <ThemeProvider>
      <ToastProvider>
      <Routes>

        <Route
          path="/"
          element={
            <PublicRoute auth={auth}>
              <Navigate to="/login" replace />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute auth={auth}>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute auth={auth}>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/pending"
          element={
            <PendingRoute auth={auth}>
              <PendingApproval />
            </PendingRoute>
          }
        />

        <Route
          path="/dashboard-role"
          element={
            <ProtectedRoute auth={auth}>
              <RoleBasedRoute />
            </ProtectedRoute>
          }
        />

        {/* Legacy misspelling kept as a safe alias */}
        <Route path="/dashbord" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashbord/*" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <RoleRoute auth={auth} role="admin">
              <DashboardLayout role="admin" />
            </RoleRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          <Route path="students/add" element={<AddStudent />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="students/id-cards" element={<GenerateDigitalIdCards />} />
          <Route path="students/enrollments" element={<EnrollmentCenter />} />
          <Route path="attendance" element={<ManageAttendance />} />

          <Route path="courses/add" element={<AddCourses />} />
          <Route path="courses/manage" element={<ManageCourses />} />
          <Route path="study-materials" element={<ManageStudyMaterials />} />
          <Route path="online-classes" element={<ManageOnlineClasses />} />

          <Route path="exams" element={<ManageExams />} />
          <Route path="exams/schedule" element={<ScheduleExam />} />
          <Route path="exams/assignments" element={<Assignments />} />
          <Route path="exams/admit-cards" element={<AdmitCards />} />
          <Route path="exams/results" element={<PublishResults />} />
          <Route path="exams/certificates" element={<IssueCertificates />} />

          <Route path="franchise/add" element={<AddFranchise />} />
          <Route path="franchise/manage" element={<ManageFranchise />} />

          <Route path="faculty/add" element={<AddFaculty />} />
          <Route path="faculty/manage" element={<ManageFaculty />} />
          <Route path="faculty/assign-courses" element={<AssignCourses />} />

          <Route path="payments/manage" element={<ManagePayments />} />
          <Route path="payments/student-fees" element={<StudentFees />} />
          <Route path="payments/franchise" element={<FranchisePayments />} />
          <Route path="payments/faculty" element={<FacultyPayouts />} />
          <Route path="payments/history" element={<PaymentHistory />} />

          <Route path="profile" element={<ManageProfile />} />

          <Route path="users/add" element={<AddUser />} />
          <Route path="users/manage" element={<ManageUsers />} />
          <Route path="users/pending" element={<PendingUsers />} />

          <Route path="communication/send" element={<SendBulkEmails />} />
          <Route path="communication/logs" element={<EmailLogs />} />
          <Route path="communication/student-communications" element={<ManageStudentCommunications />} />

          <Route path="corporate/roles" element={<Roles />} />
          <Route path="corporate/announcements" element={<CorporateAnnouncements />} />
          <Route path="corporate/add-employee" element={<AddEmployee />} />
          <Route path="corporate/manage-employees" element={<ManageEmployees />} />
          <Route path="corporate/certificates" element={<IssueCertificate />} />

          <Route path="reports/attendance" element={<AttendanceReport />} />
          <Route path="reports/payments" element={<PaymentAnalytics />} />
        </Route>

        <Route
          path="/student"
          element={
            <RoleRoute auth={auth} role="student">
              <StudentDashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="enroll-course" element={<EnrollCourse />} />
          <Route path="profile" element={<ManageProfile />} />

          <Route path="my-learning/my-courses" element={<MyCourses />} />
          <Route path="my-learning/study-materials" element={<StudentStudyMaterials />} />
          <Route path="my-learning/online-classes" element={<OnlineClasses />} />
          <Route path="my-learning/id-card" element={<DigitalIdCard />} />
          <Route path="my-learning/attendance" element={<QrAttendance />} />
          <Route path="my-exams" element={<MyExams />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="my-admit-cards" element={<MyAdmitCards />} />
          <Route path="my-results" element={<MyResults />} />
          <Route path="certificates" element={<MyCertificates />} />
          <Route path="payments/make-payment" element={<MakePayment />} />
          <Route path="upload-payment-proof" element={<UploadPaymentProof />} />
          <Route path="payments/track-fees" element={<TrackCourseFees />} />
          <Route path="payments/history" element={<StudentPaymentHistory />} />
          <Route path="communication" element={<Communication />} />
        </Route>

        <Route
          path="/faculty"
          element={
            <RoleRoute auth={auth} role="faculty">
              <FacultyDashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<FacultyHome />} />
          <Route path="profile" element={<ManageProfile />} />

          <Route path="courses" element={<FacultyMyCourses />} />
          <Route path="students" element={<FacultyMyStudents />} />

          <Route path="materials" element={<FacultyStudyMaterials />} />
          <Route path="classes" element={<FacultyOnlineClasses />} />
          <Route path="attendance" element={<FacultyQrAttendance />} />

          <Route path="assignments" element={<FacultyAssignments />} />
          <Route path="exams/schedule" element={<FacultyScheduleExams />} />
          <Route path="exams/manage" element={<FacultyManageExams />} />
          <Route path="admit-cards" element={<FacultyAdmitCards />} />
          <Route path="results" element={<FacultyResults />} />

          <Route path="certificates" element={<FacultyIssueCertificates />} />
          <Route path="announcements" element={<FacultyAnnouncements />} />
          <Route path="payouts" element={<FacultyMyPayouts />} />
          <Route path="reports/attendance" element={<FacultyAttendanceReports />} />
        </Route>

        <Route
          path="/franchise"
          element={
            <RoleRoute auth={auth} role="franchise">
              <FranchiseDashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<FranchiseHome />} />
          <Route path="profile" element={<ManageProfile />} />

          <Route path="students" element={<FranchiseStudents />} />
          <Route path="enrollments" element={<FranchiseEnrollments />} />
          <Route path="courses" element={<FranchiseCourses />} />
          <Route path="reports/students" element={<FranchiseStudentReports />} />
          <Route path="faculty" element={<FranchiseFaculty />} />
          <Route path="announcements" element={<FranchiseAnnouncements />} />
          <Route path="revenue" element={<FranchiseRevenue />} />
          <Route path="commission" element={<FranchiseCommission />} />
          <Route path="reports/revenue" element={<FranchiseRevenueReports />} />
        </Route>

        <Route
          path="/employee"
          element={
            <RoleRoute auth={auth} role="employee">
              <DashboardLayout role="employee" />
            </RoleRoute>
          }
        >
          <Route index element={<EmployeeHome />} />
          <Route path="employment" element={<EmployeeProfile />} />
          <Route path="certificates" element={<EmployeeCertificates />} />
          <Route path="announcements" element={<EmployeeAnnouncements />} />
          <Route path="directory" element={<EmployeeDirectory />} />
          <Route path="account" element={<ManageProfile />} />
        </Route>

        <Route path="/attendance" element={<MobileAttendance />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
