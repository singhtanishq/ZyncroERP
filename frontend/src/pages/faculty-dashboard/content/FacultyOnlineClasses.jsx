import ManageOnlineClasses from "../../dashboard/online-classes/ManageOnlineClasses";

export default function FacultyOnlineClasses() {
  return (
    <ManageOnlineClasses
      apiPrefix="/faculty"
      isFaculty
    />
  );
}