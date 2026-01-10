import AttendanceReport from "../../dashboard/reports/AttendanceReport";

export default function FacultyAttendanceReports() {
    return (
        <AttendanceReport
            apiPrefix="/faculty"
        />
    );
}