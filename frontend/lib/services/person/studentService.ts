import { IStudentRepo } from "@/lib/api/adapters/interfaces/people/IStudentRepo";
import {
  UpdateStudentDataParams,
  CreateStudentParams,
} from "../../api/types/person/student";
import { IParentRepo } from "@/lib/api/adapters/interfaces";

function StudentService(studentRepo: IStudentRepo, parentRepo: IParentRepo) {
  async function getStatusesAsync() {
    return await studentRepo.getStatusesAsync();
  }

  async function createStudentAsync(data: CreateStudentParams) {
    const student = await studentRepo.createStudentAsync(data.studentData);
    console.log({ student });

    // TODO: Maybe check if parent exists already
    const parent1 = await parentRepo.createParentAsync({
      first_name: data.parent1Data.first_name,
      last_name: data.parent1Data.last_name,
      parent_mobile: data.parent1Data.parent_mobile,
    });
    console.log({ parent1 });
    await parentRepo.linkParentToStudentAsync(
      student.student_id,
      parent1.parent_id,
    );

    let parent2;
    if (!!data.parent2Data?.first_name || !!data.parent2Data?.parent_mobile) {
      parent2 = await parentRepo.createParentAsync(data.parent2Data);
      console.log({ parent2 });
      await parentRepo.linkParentToStudentAsync(
        student.student_id,
        parent2.parent_id,
      );
    }

    return {
      ...student,
      parent1FullName: parent1.first_name,
      parent1Mobile: parent1.parent_mobile,
      parent2FullName: parent2?.first_name,
      parent2Mobile: parent2?.parent_mobile,
    };
  }

  async function updateStudentAsync(id: string, data: UpdateStudentDataParams) {
    const updatedStudent = await studentRepo.updateStudentAsync(id, data);
    console.log({ updatedStudent });

    let updateParent1;
    // TODO: only do update for parent, if changed?
    if (!!data.parent1Data?.parent_id) {
      updateParent1 = await parentRepo.updateParentAsync(
        data.parent1Data.parent_id,
        {
          first_name: data.parent1Data.first_name,
          parent_mobile: data.parent1Data.parent_mobile,
        },
      );
    }

    let updatedParent2;
    if (!!data.parent2Data?.parent_id) {
      updatedParent2 = await parentRepo.updateParentAsync(
        data.parent2Data.parent_id,
        {
          first_name: data.parent2Data.first_name,
          parent_mobile: data.parent2Data.parent_mobile,
        },
      );
    }

    const responseData = {
      ...updatedStudent,
      parent1Id: data.parent1Data?.parent_id,
      parent1FullName: updateParent1?.first_name,
      parent1Mobile: updateParent1?.parent_mobile,
      parent2Id: data.parent2Data?.parent_id,
      parent2FullName: updatedParent2?.first_name,
      parent2Mobile: updatedParent2?.parent_mobile,
    };

    return responseData;
  }

  async function getStudentByIdAsync(id: string) {
    // Still okay that parent is fetching is still coupled with Student fetching
    const getStudentResponse = await studentRepo.getStudentByIdAsync(id);
       const parents = getStudentResponse?.parents || [];
    delete getStudentResponse?.parents;

    return {
      ...getStudentResponse,
      // TODO: CHECK ORDERING OF PARENTS, may need a 'primary' contact flag field
      parent1Id: parents[0]?.Parent.parent_id,
      parent1FullName: parents[0]?.Parent.first_name,
      parent1Mobile: parents[0]?.Parent.parent_mobile,
      parent2Id: parents[1]?.Parent.parent_id,
      parent2FullName: parents[1]?.Parent.first_name,
      parent2Mobile: parents[1]?.Parent.parent_mobile,
    };
  }

  async function searchStudentsAsync(query: string) {
    return await studentRepo.searchStudentsAsync(query);
  }

  return {
    getStatusesAsync,
    createStudentAsync,
    updateStudentAsync,
    getStudentByIdAsync,
    searchStudentsAsync,
  };
}

export default StudentService;
