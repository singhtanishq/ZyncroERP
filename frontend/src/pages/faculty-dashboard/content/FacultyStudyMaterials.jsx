import ManageStudyMaterials from "../../dashboard/study-materials/ManageStudyMaterials";

export default function StudyMaterials() {
    return (
        <ManageStudyMaterials
            apiPrefix="/faculty"
            isFaculty={true}
        />
    );
}