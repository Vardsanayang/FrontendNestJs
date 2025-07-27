import apiClient from "../../../../common/configuration/axios.config";


export function useCourse() {
  const fetchItems = async () => {
    const response = await apiClient.get("course/courses", {
      params: {
        page: 1,
        limit: 10,
        search: "",
      },
    });
    return response.data;
  };

  const createItem = async (item: any) => {
    const response = await apiClient.post("course/create-course", item);
    return response.data;
  };

  const updateItem = async (id: number, item: any) => {
    console.log('Updating course with ID:', id, 'data:', item);
    const response = await apiClient.put(`course/update-course/${id}`, item);
    console.log('API response:', response);
    return response.data;
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/teacher/get-all'); // เปลี่ยน URL ให้ตรงกับ backend ของคุณ
      return response.data;
    } catch (error) {
      console.error('Failed to fetch teachers', error);
      return { data: [] };
    }
  };


  return {
    fetchItems,
    createItem,
    updateItem,
    fetchTeachers
  };
}
