import ManageAttendance from "../../dashboard/attendance/ManageAttendance";

export default function FacultyQrAttendance() {
    return (
        <ManageAttendance
            apiPrefix="/faculty"
            isFaculty
        />
    );
}