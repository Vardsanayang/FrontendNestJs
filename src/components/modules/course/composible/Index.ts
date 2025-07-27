import apiClient from "../../../../common/configuration/axios.config";

export function useCourse() {
  // getall courses
  const fetchItems = async () => {
    try {
      const response = await apiClient.get("course/courses", {
        params: {
          page: 1,
          limit: 10,
          search: "",
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch courses', error);
      return { data: [] };
    }
  };

  // getall teachers
  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/teacher/get-all');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch teachers', error);
      return { data: [] };
    }
  };

  // create course
  const createCourse = async (courseData: any) => {
    try {
      const response = await apiClient.post("course/create-course", {
        teacher_id: Number(courseData.teacher_id),
        category_id: Number(courseData.category_id),
        title: courseData.title,
        description: courseData.description,
        duration_hours: Number(courseData.duration_hours),
        max_student: Number(courseData.max_student),
        price: Number(courseData.price),
        end_date: courseData.end_date
          ? new Date(courseData.end_date).toISOString()
          : null,
        start_date: courseData.start_date
          ? new Date(courseData.start_date).toISOString()
          : null,
        register_start_date: courseData.registration_start_date
          ? new Date(courseData.registration_start_date).toISOString()
          : null,
        register_end_date: courseData.registration_end_date
          ? new Date(courseData.registration_end_date).toISOString()
          : null,
      });

      return response.data;
    } catch (error: any) {
      console.error("Create course failed:", error?.response?.data || error);
      throw error;
    }
  };

  const updateStatusChange = async (id: number, status: string) => {
    return await apiClient.patch(`course/update-status/${id}`, { status });
  };

  // Delete course
  const deleteCourse = async (id: number) => {
    try {
      const response = await apiClient.delete(`course/delete-course/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete course', error);
      throw error;
    }
  };

  // edit course
  const updateCourse = async (courseData: any) => {
    try {
      const response = await apiClient.put(
        `course/update-course/${courseData.id}`,
        {
          teacher_id: courseData.teacher_id,
          category_id: courseData.category_id,
          title: courseData.title,
          description: courseData.description,
          duration_hours: Number(courseData.duration_hours),
          max_student: Number(courseData.max_students),
          price: Number(courseData.price),
          end_date: courseData.end_date
            ? new Date(courseData.end_date).toISOString()
            : null,
          start_date: courseData.start_date
            ? new Date(courseData.start_date).toISOString()
            : null,
          register_start_date: courseData.registration_start_date
            ? new Date(courseData.registration_start_date).toISOString()
            : null,
          register_end_date: courseData.registration_end_date
            ? new Date(courseData.registration_end_date).toISOString()
            : null,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error updating course:", error);
      throw new Error("An unexpected error occurred while updating the course");
    }
  };


  return {
    deleteCourse,
    updateCourse,
    fetchItems,
    fetchTeachers,
    createCourse,
    updateStatusChange,
  };
}
