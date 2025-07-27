<script setup lang="ts">
import { onMounted, reactive, ref, h } from 'vue';
import { message } from 'ant-design-vue';
import { useCourse } from '../composible/Index';
import type { ICourseEntity } from '../entity/Course.entity';

// เพิ่ม import สำหรับดึง category และ teacher
import { CourseCategoryComposible } from '../../course-category/composible/index';
import { useTeacher } from '../../teacher/composible';
// สมมุติว่ามี useTeacher composable

const { fetchItems, createItem, updateItem } = useCourse();
const { fetchAll: fetchCategories } = CourseCategoryComposible();
const { fetchAll: fetchTeachers } = useTeacher();

const data = reactive<any>({
  courses: [],
  isLoading: false,
  teachers: [],
  categories: []
});

// ฟอร์มสำหรับเพิ่มข้อมูล
const addForm = reactive({
  title: '',
  teacher_id: null,
  category_id: null,
  max_student: null,
  duration_hours: null,
  price: null,
  registration_start_date: '',
  registration_end_date: '',
  start_date: '',
  end_date: '',
  status: 'open',
  description: ''
});

const columns = [
  {
    title: 'ລຳດັບ',
    key: "no",
    customRender: ({ index }: { index: number }) => index + 1
  },
  {
    title: 'ໝວດໝູ່',
    dataIndex: 'category',
    key: "category",
    customRender: ({ record }: { record: ICourseEntity }) => record.category?.name || '-'
  },
  {
    title: 'ຫົວຂໍ້',
    dataIndex: 'title',
    key: "title"
  },
  {
    title: 'ຮັບຈຳນວນ',
    dataIndex: 'max_student',
    key: "max_student",
    customRender: ({ record }: { record: ICourseEntity }) => {
      const maxStudent = record.max_student ?? 0;
      return `${maxStudent} ຄົນ`;
    }
  },
  {
    title: 'ຊົ່ວໂມງຮຽນ',
    dataIndex: 'duration_hours',
    key: "duration_hours",
    customRender: ({ record }: { record: ICourseEntity }) => {
      const durationHours = record.duration_hours ?? 0;
      return `${durationHours} ຊົ່ວໂມງ`;
    }
  },
  {
    title: 'ລາຄາ',
    dataIndex: 'price',
    key: "price",
    customRender: ({ record }: { record: ICourseEntity }) => {
      const price = record.price ?? 0;
      return `${price.toLocaleString('lo-LA')} ກີບ`;
    }
  },
  {
    title: 'ເປີດລົງທະບຽນ',
    dataIndex: 'registration_start_date',
    key: "registration_start_date"
  },
  {
    title: 'ປິດລົງທະບຽນ',
    dataIndex: 'registration_end_date',
    key: "registration_end_date"
  },
  {
    title: 'ເປີດຮຽນ',
    dataIndex: 'start_date',
    key: "start_date"
  },
  {
    title: 'ປິດຮຽນ',
    dataIndex: 'end_date',
    key: "end_date"
  },
  {
    title: 'ສະຖານະ',
    dataIndex: 'status',
    key: "status",
    customRender: ({ record }: { record: ICourseEntity }) => {
      const status = record.status ?? 'open';
      const color = status === 'open' ? 'green' : 'red';
      const text = status === 'open' ? 'ເປີດ' : 'ປິດ';

      return h(
        'span',
        {
          style: {
            color: color,
            fontWeight: 'bold',
          },
        },
        text
      );
    }
  },
  {
    title: 'ການດຳເນີນການ',
    key: 'action',
    width: 120
  }
];

const fetchAll = async () => {
  const response = await fetchItems();
  data.courses = response.data;
};

const fetchOptions = async () => {
  // ดึง category
  const categoriesRes = await fetchCategories();
  data.categories = (categoriesRes?.data || []).map((item: any) => ({
    label: item.name,
    value: item.id
  }));

  // ดึง teacher
  const getallTeachers = await fetchTeachers();
  console.log('getallTeachers', getallTeachers);
  data.teachers = (getallTeachers?.data || []).map((item: any) => ({
    label: item.user.username ?? 'ບໍ່ມີອາຈານ',
    value: item.id
  }));
};

onMounted(async () => {
  await fetchAll();
  await fetchOptions();
});

const isOpenModalAdd = ref(false);

const openModalAdd = () => {
  isOpenModalAdd.value = true;
};

// ฟังก์ชันเปลี่ยนสถานะ
const handleStatusChange = async (record: ICourseEntity, checked: boolean) => {
  const newStatus = checked ? 'open' : 'closed';
  const originalStatus = record.status;

  try {
    // ส่งข้อมูลทั้งหมดของ course พร้อมกับ status ที่อัพเดท
    const updateData = {
      title: record.title,
      teacher_id: record.teacher_id,
      category_id: record.category_id,
      max_student: record.max_student,
      duration_hours: record.duration_hours,
      price: record.price,
      register_start_date: record.registration_start_date,
      register_end_date: record.registration_end_date,
      start_date: record.start_date,
      end_date: record.end_date,
      status: newStatus,
      description: record.description
    };

    // รอให้ API call เสร็จสิ้นก่อน
    await updateItem(record.id, updateData);
    console.log('Status updated successfully to:', newStatus);

    // อัพเดทสถานะในข้อมูลหลังจาก API call สำเร็จ
    record.status = newStatus;
  } catch (e: any) {
    console.error('Error updating status:', e);
    message.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
  }
};

// ฟังก์ชันบันทึกข้อมูลใหม่
const handleAddOk = async () => {
  try {
    await createItem({ ...addForm, register_start_date: addForm.registration_start_date, register_end_date: addForm.registration_end_date });
    message.success('เพิ่มข้อมูลสำเร็จ');
    isOpenModalAdd.value = false;
    // reset form
    Object.keys(addForm).forEach(key => (addForm as any)[key] = '');
    addForm.status = 'open';
    await fetchAll();
  } catch (e: any) {
    message.error(e?.response?.data?.message?.[0] || 'เกิดข้อผิดพลาด');
  }
};
</script>

<template>
  <div>
    <div class="title">
      <p>ລາຍການ Course</p>
      <p>
        <a-button type="primary" @click="openModalAdd">ເພີ່ມຂໍ້ມູນ</a-button>
      </p>
    </div>
    <a-table :data-source="data.courses" :columns="columns">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <span>
            <a-switch
              :checked="record.status === 'open'"
              @change="(checked: boolean) => handleStatusChange(record, checked)"
              checked-children="ເປີດ"
              un-checked-children="ປິດ"
            />
          </span>
        </template>
      </template>
    </a-table>
  </div>

  <a-modal v-model:open="isOpenModalAdd" title="Basic Modal" @ok="handleAddOk">
    <!-- Teachers -->
    <div class="select-container">
      <label for="teacher-select">ອາຈານ</label>
      <a-select id="teacher-select" v-model:value="addForm.teacher_id" show-search placeholder="Select a teacher"
        style="width: 100%" :options="data.teachers"></a-select>
    </div>

    <!-- Categories -->
    <div class="select-container">
      <label for="category-select">ໝວດໝູ່</label>
      <a-select id="category-select" v-model:value="addForm.category_id" show-search placeholder="Select a category"
        style="width: 100%" :options="data.categories"></a-select>
    </div>

    <!-- Title -->
    <div class="select-container">
      <label for="title-input">ຫົວຂໍ້</label>
      <a-input v-model:value="addForm.title" placeholder="ຫົວຂໍ້..."></a-input>
    </div>

    <!-- Max Students -->
    <div class="select-container">
      <label for="max-students-input">ຈຳນວນນັກສຶກສາ</label>
      <a-input type="number" v-model:value="addForm.max_student" placeholder="ຈຳນວນນັກສຶກສາ..."></a-input>
    </div>

    <!-- Max Duration -->
    <div class="select-container">
      <label for="max-duration-input">ຈຳນວນຊົ່ວໂມງ</label>
      <a-input type="number" v-model:value="addForm.duration_hours" placeholder="ຈຳນວນຊົ່ວໂມງ..."></a-input>
    </div>

    <!-- Price -->
    <div class="select-container">
      <label for="max-price-input">ລາຄາ</label>
      <a-input type="number" v-model:value="addForm.price" placeholder="ລາຄາ..."></a-input>
    </div>

    <!-- Registration Start Date -->
    <div class="select-container">
      <label for="registration-start-date-input">ວັນທີ່ເປີດສະໝັກ</label>
      <a-date-picker v-model:value="addForm.registration_start_date" placeholder="ວັນທີ່ເປີດສະໝັກ"
        style="width: 100%"></a-date-picker>
    </div>

    <!-- Registration End Date -->
    <div class="select-container">
      <label for="registration-end-date-input">ວັນທີ່ປິດສະໝັກ</label>
      <a-date-picker v-model:value="addForm.registration_end_date" placeholder="ວັນທີ່ປິດສະໝັກ"
        style="width: 100%"></a-date-picker>
    </div>

    <!-- Start Date -->
    <div class="select-container">
      <label for="start-date-input">ວັນທີ່ເປີດສອນ</label>
      <a-date-picker v-model:value="addForm.start_date" placeholder="ວັນທີ່ເປີດສອນ" style="width: 100%"></a-date-picker>
    </div>

    <!-- End Date -->
    <div class="select-container">
      <label for="end-date-input">ວັນທີ່ປິດສອນ</label>
      <a-date-picker v-model:value="addForm.end_date" placeholder="ວັນທີ່ປິດສອນ" style="width: 100%"></a-date-picker>
    </div>

    <!-- Description -->
    <div class="select-container">
      <label for="description-input">ລາຍລະອຽດ</label>
      <a-textarea v-model:value="addForm.description" placeholder="ລາຍລະອຽດ..." rows="4"></a-textarea>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  p {
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
}
</style>
