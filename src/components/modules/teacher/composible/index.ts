// src/components/modules/teacher/composible/index.ts
import apiClient from "../../../../common/configuration/axios.config";

// Optional: define the shape of the data you pass in
export interface CoursePayload {
  teacher_id: string | number;
  category_id: string | number;
  title: string;
  description: string;
  duration_hours: number | string;
  max_students: number | string;
  price: number | string;
  end_date?: string | Date | null;
  start_date?: string | Date | null;
  registration_start_date?: string | Date | null;
  registration_end_date?: string | Date | null;
}

export function useTeacher() {
  /** Fetch every teacher from the backend */
  const fetchAll = async () => {
    try {
      const { data } = await apiClient.get("/teacher/get-all");
      return data; // return array or object as your API provides
    } catch (error) {
      console.error("Failed to fetch teachers", error);
      return []; // make the fallback match whatever the real response is
    }
  };

  /** Create a course for a teacher */
  const createCourse = async (courseData: CoursePayload) => {
    try {
      const { data } = await apiClient.post("/course/create-course", {
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
      });

      return data; // created course object (or whatever backend returns)
    } catch (error) {
      console.error("Failed to create course", error);
      throw error; // let the caller handle the failure
    }
  };

  return {
    fetchAll,
    createCourse,
  };
}
