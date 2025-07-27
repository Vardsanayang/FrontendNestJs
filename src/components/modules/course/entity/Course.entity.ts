export interface ICourseEntity {
  id: number;
  title: string;
  max_student: number;
  duration_hours: number;
  price: number;
  registration_start_date: string;
  registration_end_date: string;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  teacher: {
    id: number;
    specialization: string;
    experience: number;
    education: string;
    created_at: string;
    updated_at: string;
  };
  category: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  
}
