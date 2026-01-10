import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardPen,
  Wallet,
  Store,
  GraduationCap,
  Bell,
  Shield,
  BarChart3,
  Award,
  GraduationCap as EnrollIcon,
  Building2,
  UserSquare,
  Briefcase,
} from "lucide-react";

/**
 * Single source of truth for per-role navigation. Every role shares the
 * same sidebar/topbar design system — roles differ only in the modules
 * they can access.
 */

export const NAV_BY_ROLE = {
  admin: [
    {
      key: "students",
      title: "Student Management",
      icon: Users,
      items: [
        { label: "Add Student", path: "/dashboard/students/add" },
        { label: "View & Manage Students", path: "/dashboard/students" },
        { label: "Enrollment Center", path: "/dashboard/students/enrollments" },
        { label: "Generate Digital ID Card", path: "/dashboard/students/id-cards" },
        { label: "Manage QR Attendance", path: "/dashboard/attendance" },
      ],
    },
    {
      key: "courses",
      title: "Course Management",
      icon: BookOpen,
      items: [
        { label: "Add Courses", path: "/dashboard/courses/add" },
        { label: "Manage Courses", path: "/dashboard/courses/manage" },
        { label: "Manage Study Materials", path: "/dashboard/study-materials" },
        { label: "Manage Online Classes", path: "/dashboard/online-classes" },
      ],
    },
    {
      key: "exams",
      title: "Exam Management",
      icon: ClipboardPen,
      items: [
        { label: "Manage Assignments", path: "/dashboard/exams/assignments" },
        { label: "Schedule Online Exam", path: "/dashboard/exams/schedule" },
        { label: "View & Manage Exams", path: "/dashboard/exams" },
        { label: "Generate Admit Card", path: "/dashboard/exams/admit-cards" },
        { label: "Publish Results", path: "/dashboard/exams/results" },
        { label: "Issue Certificate", path: "/dashboard/exams/certificates" },
      ],
    },
    {
      key: "franchise",
      title: "Franchise Management",
      icon: Store,
      items: [
        { label: "Add Franchise", path: "/dashboard/franchise/add" },
        { label: "View & Manage Franchise", path: "/dashboard/franchise/manage" },
      ],
    },
    {
      key: "faculty",
      title: "Faculty Management",
      icon: GraduationCap,
      items: [
        { label: "Add Faculty", path: "/dashboard/faculty/add" },
        { label: "View & Manage Faculties", path: "/dashboard/faculty/manage" },
        { label: "Assign Courses", path: "/dashboard/faculty/assign-courses" },
      ],
    },
    {
      key: "corporate",
      title: "Corporate Management",
      icon: Briefcase,
      items: [
        { label: "View & Manage Roles", path: "/dashboard/corporate/roles" },
        { label: "Add Employee", path: "/dashboard/corporate/add-employee" },
        { label: "Manage Employees", path: "/dashboard/corporate/manage-employees" },
        { label: "Issue Certificates", path: "/dashboard/corporate/certificates" },
        { label: "Company Announcements", path: "/dashboard/corporate/announcements" },
      ],
    },
    {
      key: "payments",
      title: "Payments Management",
      icon: Wallet,
      items: [
        { label: "Payment Management", path: "/dashboard/payments/manage" },
        { label: "Track Students Fees", path: "/dashboard/payments/student-fees" },
        { label: "Track Franchise Payments", path: "/dashboard/payments/franchise" },
        { label: "Track Faculty Payouts", path: "/dashboard/payments/faculty" },
        { label: "View Payment History", path: "/dashboard/payments/history" },
      ],
    },
    {
      key: "communication",
      title: "Communication & Alerts",
      icon: Bell,
      items: [
        { label: "Send Bulk Emails", path: "/dashboard/communication/send" },
        { label: "Email Logs", path: "/dashboard/communication/logs" },
        { label: "Student Communications", path: "/dashboard/communication/student-communications" },
      ],
    },
    {
      key: "access",
      title: "User Access Control",
      icon: Shield,
      items: [
        { label: "Add User", path: "/dashboard/users/add" },
        { label: "View & Manage Users", path: "/dashboard/users/manage" },
        { label: "Approve Pending Users", path: "/dashboard/users/pending" },
      ],
    },
    {
      key: "reports",
      title: "Reports & Analytics",
      icon: BarChart3,
      items: [
        { label: "Attendance Report", path: "/dashboard/reports/attendance" },
        { label: "Payments Analytics", path: "/dashboard/reports/payments" },
      ],
    },
  ],

  student: [
    {
      key: "enroll",
      title: "Enroll Course",
      icon: EnrollIcon,
      items: [{ label: "Enroll Course", path: "/student/enroll-course" }],
      flat: true,
    },
    {
      key: "learning",
      title: "My Learning",
      icon: BookOpen,
      items: [
        { label: "My Courses", path: "/student/my-learning/my-courses" },
        { label: "Study Materials", path: "/student/my-learning/study-materials" },
        { label: "Online Classes", path: "/student/my-learning/online-classes" },
        { label: "QR Attendance", path: "/student/my-learning/attendance" },
        { label: "Digital ID Card", path: "/student/my-learning/id-card" },
      ],
    },
    {
      key: "exams",
      title: "Examinations",
      icon: ClipboardPen,
      items: [
        { label: "My Exams", path: "/student/my-exams" },
        { label: "My Assignments", path: "/student/assignments" },
        { label: "Admit Cards", path: "/student/my-admit-cards" },
        { label: "Results", path: "/student/my-results" },
      ],
    },
    {
      key: "certificates",
      title: "Certificates",
      icon: Award,
      items: [{ label: "My Certificates", path: "/student/certificates" }],
    },
    {
      key: "payments",
      title: "Payments",
      icon: Wallet,
      items: [
        { label: "Fee Payments", path: "/student/payments/make-payment" },
        { label: "Upload Payment Proof", path: "/student/upload-payment-proof" },
        { label: "Track Course Fees", path: "/student/payments/track-fees" },
        { label: "Payment History", path: "/student/payments/history" },
      ],
    },
    {
      key: "communication",
      title: "Communication",
      icon: Bell,
      items: [{ label: "Announcements", path: "/student/communication" }],
    },
  ],

  faculty: [
    {
      key: "teaching",
      title: "Teaching",
      icon: BookOpen,
      items: [
        { label: "My Courses", path: "/faculty/courses" },
        { label: "My Students", path: "/faculty/students" },
      ],
    },
    {
      key: "content",
      title: "Content",
      icon: BookOpen,
      items: [
        { label: "Study Materials", path: "/faculty/materials" },
        { label: "Online Classes", path: "/faculty/classes" },
        { label: "QR Attendance", path: "/faculty/attendance" },
      ],
    },
    {
      key: "assessment",
      title: "Assessment",
      icon: ClipboardPen,
      items: [
        { label: "Manage Assignments", path: "/faculty/assignments" },
        { label: "Schedule Online Exams", path: "/faculty/exams/schedule" },
        { label: "View & Manage Exams", path: "/faculty/exams/manage" },
        { label: "Admit Cards", path: "/faculty/admit-cards" },
        { label: "Results", path: "/faculty/results" },
      ],
    },
    {
      key: "certificates",
      title: "Certificates",
      icon: Award,
      items: [{ label: "Issue Certificate", path: "/faculty/certificates" }],
    },
    {
      key: "communication",
      title: "Communication",
      icon: Bell,
      items: [{ label: "Announcements", path: "/faculty/announcements" }],
    },
    {
      key: "finance",
      title: "Finance",
      icon: Wallet,
      items: [{ label: "My Payouts", path: "/faculty/payouts" }],
    },
    {
      key: "reports",
      title: "Reports",
      icon: BarChart3,
      items: [{ label: "Attendance Reports", path: "/faculty/reports/attendance" }],
    },
  ],

  franchise: [
    {
      key: "students",
      title: "Students",
      icon: Users,
      items: [
        { label: "My Students", path: "/franchise/students" },
        { label: "Enrollments", path: "/franchise/enrollments" },
        { label: "Student Reports", path: "/franchise/reports/students" },
      ],
    },
    {
      key: "courses",
      title: "Courses",
      icon: BookOpen,
      items: [{ label: "Our Courses", path: "/franchise/courses" }],
    },
    {
      key: "faculty",
      title: "Faculty",
      icon: GraduationCap,
      items: [{ label: "Our Faculty", path: "/franchise/faculty" }],
    },
    {
      key: "payments",
      title: "Payments",
      icon: Wallet,
      items: [
        { label: "Revenue", path: "/franchise/revenue" },
        { label: "Commission", path: "/franchise/commission" },
      ],
    },
    {
      key: "analytics",
      title: "Analytics",
      icon: BarChart3,
      items: [{ label: "Revenue Reports", path: "/franchise/reports/revenue" }],
    },
    {
      key: "announcements",
      title: "Announcements",
      icon: Bell,
      items: [{ label: "Student Notices", path: "/franchise/announcements" }],
    },
  ],

  employee: [
    {
      key: "employment",
      title: "My Employment",
      icon: UserSquare,
      items: [{ label: "Employment Profile", path: "/employee/employment" }],
    },
    {
      key: "certificates",
      title: "Certificates",
      icon: Award,
      items: [{ label: "My Certificates", path: "/employee/certificates" }],
    },
    {
      key: "announcements",
      title: "Announcements",
      icon: Bell,
      items: [{ label: "Company Notices", path: "/employee/announcements" }],
    },
    {
      key: "directory",
      title: "Team Directory",
      icon: Users,
      items: [{ label: "Colleagues", path: "/employee/directory" }],
    },
    {
      key: "account",
      title: "Account Settings",
      icon: Shield,
      items: [{ label: "Profile & Security", path: "/employee/account" }],
    },
  ],
};

export const ROLE_HOME = {
  admin: "/dashboard",
  student: "/student",
  faculty: "/faculty",
  franchise: "/franchise",
  employee: "/employee",
};

export const ROLE_LABEL = {
  admin: "Administrator",
  student: "Student Portal",
  faculty: "Faculty Portal",
  franchise: "Franchise Portal",
  employee: "Employee Portal",
};

export function navForRole(role) {
  return NAV_BY_ROLE[role] || [];
}
