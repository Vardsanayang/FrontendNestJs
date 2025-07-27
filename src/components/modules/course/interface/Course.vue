<script setup lang="ts">
import { onMounted, reactive, ref, h } from 'vue';
import { message } from 'ant-design-vue';
import { useCourse } from '../composible/Index';
import type { ICourseEntity } from '../entity/Course.entity';

import { CourseCategoryComposible } from '../../course-category/composible/index';
import { useTeacher } from '../../teacher/composible';
import apiClient from '../../../../common/configuration/axios.config';
import dayjs from 'dayjs';

const { fetchItems, createCourse, deleteCourse,updateCourse} = useCourse();
const { fetchAll: fetchCategories } = CourseCategoryComposible();
const { fetchAll: fetchTeachers } = useTeacher();

const data = reactive<any>({
    courses: [],
    isLoading: false,
    teachers: [],
    categories: []
});

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

const isOpenModalAdd = ref(false);
const isSubmitting = ref(false);

const openModalAdd = () => {
    isOpenModalAdd.value = true;
};

const updateStatusChange = async (id: number, status: string) => {
    try {
        const response = await apiClient.put(`course/update-status/${id}`, {
            status,
        });
        message.success("ປ່ຽນສະຖານະສຳເລັດ");
        await fetchAll();
        return response.data;
    } catch (error: any) {
        message.error("ປ່ຽນສະຖານະບໍ່ສຳເລັດ");
        console.error("Error updating course status:", error);
        throw new Error(
            "An unexpected error occurred while updating course status"
        );
    }
};



const resetForm = () => {
    Object.assign(addForm, {
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
};

const handleSubmit = async () => {
    if (!addForm.title || !addForm.teacher_id || !addForm.category_id) {
        message.warning('ກະລຸນາກວດສອບຂໍ້ມູນກ່ອນບັນທຶກ');
        return;
    }

    isSubmitting.value = true;

    try {
        await createCourse(addForm);
        message.success('ສ້າງຄອສສຳເລັດ');
        isOpenModalAdd.value = false;
        resetForm();
        await fetchAll();
    } catch (error) {
        message.error('ສ້າງຄອສບໍ່ສຳເລັດ');
        console.error('Error creating course:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const fetchAll = async () => {
    const response = await fetchItems();
    data.courses = response.data;
};

const fetchOptions = async () => {
    const categoriesRes = await fetchCategories();
    data.categories = (categoriesRes?.data || []).map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    const getallTeachers = await fetchTeachers();
    data.teachers = (getallTeachers?.data || []).map((item: any) => ({
        label: item.user.username ?? 'ບໍ່ມີອາຈານ',
        value: item.id
    }));
};

onMounted(async () => {
    await fetchAll();
    await fetchOptions();
});

const columns = [
    {
        title: 'ລຳດັບ',
        key: 'no',
        customRender: ({ index }: { index: number }) => index + 1
    },
    {
        title: 'ໝວດໝູ່',
        dataIndex: 'category',
        key: 'category',
        customRender: ({ record }: { record: ICourseEntity }) => record.category?.name || '-'
    },
    {
        title: 'ຫົວຂໍ້',
        dataIndex: 'title',
        key: 'title'
    },
    {
        title: 'ຮັບຈຳນວນ',
        dataIndex: 'max_student',
        key: 'max_student',
        customRender: ({ record }: { record: ICourseEntity }) => `${record.max_student ?? 0} ຄົນ`
    },
    {
        title: 'ຊົ່ວໂມງຮຽນ',
        dataIndex: 'duration_hours',
        key: 'duration_hours',
        customRender: ({ record }: { record: ICourseEntity }) => `${record.duration_hours ?? 0} ຊົ່ວໂມງ`
    },
    {
        title: 'ລາຄາ',
        dataIndex: 'price',
        key: 'price',
        customRender: ({ record }: { record: ICourseEntity }) =>
            `${record.price?.toLocaleString('lo-LA') ?? 0} ກີບ`
    },
    {
        title: 'ເປີດລົງທະບຽນ',
        dataIndex: 'registration_start_date',
        key: 'registration_start_date'
    },
    {
        title: 'ປິດລົງທະບຽນ',
        dataIndex: 'registration_end_date',
        key: 'registration_end_date'
    },
    {
        title: 'ເປີດຮຽນ',
        dataIndex: 'start_date',
        key: 'start_date'
    },
    {
        title: 'ປິດຮຽນ',
        dataIndex: 'end_date',
        key: 'end_date'
    },
    {
        title: 'ສະຖານະ',
        dataIndex: 'status',
        key: 'status',
        customRender: ({ record }: { record: ICourseEntity }) => {
            const status = record.status ?? 'open';
            const color = status === 'open' ? 'green' : 'red';
            const text = status === 'open' ? 'ເປີດ' : 'ປິດ';
            return h('span', { style: { color, fontWeight: 'bold' } }, text);
        }
    },
    {
        title: 'Action',
        key: 'action',
    },
];

const ondelete = async (id: number) => {
    try {
        await deleteCourse(id);
        message.success('ລຶບ Course ສຳເລັດ');
        await fetchAll();
    } catch (error) {
        message.error('ລຶບ Course ບໍ່ສຳເລັດ');
        console.error('Error deleting course:', error);
    }
}

// Modal for editing course
const isOpenModalEdit = ref(false);
const formStateEdit = reactive({
    id: 0,
    teacher_id: 0,
    category_id: 0,
    title: '',
    max_students: 0,
    duration_hours: 0,
    price: 0,
    registration_start_date: '',
    registration_end_date: '',
    start_date: '',
    end_date: '',
    description: ''
});
const openEditModal = (record: ICourseEntity) => {
        formStateEdit.id = record.id;
        formStateEdit.teacher_id = record.teacher_id;
        formStateEdit.category_id = record.category_id;
        formStateEdit.title = record.title;
        formStateEdit.max_students = record.max_student;
        formStateEdit.duration_hours = record.duration_hours;
        formStateEdit.price = record.price;
        formStateEdit.registration_start_date = record.registration_start_date ? dayjs(record.registration_start_date).format('YYYY-MM-DD') : '';
        formStateEdit.registration_end_date = record.registration_end_date ? dayjs(record.registration_end_date).format('YYYY-MM-DD') : '';
        formStateEdit.start_date = record.start_date ? dayjs(record.start_date).format('YYYY-MM-DD') : '';
        formStateEdit.end_date = record.end_date ? dayjs(record.end_date).format('YYYY-MM-DD') : '';
        formStateEdit.description = record.description;

        console.log('Open Edit Modal with record:', formStateEdit);

        isOpenModalEdit.value = true;
    }



const onHandleEditSubmit = async () => {
    try {
        await updateCourse(formStateEdit); // <-- ส่ง form ไปอัปเดต
        isOpenModalEdit.value = false;
        await fetchAll(); // <-- รีโหลดข้อมูลใหม่จาก backend
        message.success('ແກ້ໄຂ Course ສຳເລັດ');
    } catch (error) {
        message.error('ແກ້ໄຂ Course ບໍ່ສຳເລັດ');
        console.error('Error updating course:', error);
    }
}

</script>

<template>
    <div>
        <div class="title">
            <p>ລາຍການ Course</p>
            <p><a-button type="primary" @click="openModalAdd">ເພີ່ມຂໍ້ມູນ</a-button></p>
        </div>

        <a-table :data-source="data.courses" :columns="columns">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span style="display: flex; gap: 8px; align-items: center; justify-content: flex-start;">
                        <!-- สวิตซ์เปิด/ปิด -->
                        <a-switch :checked="record.status === 'open'"
                            @change="(checked: boolean) => updateStatusChange(record.id, checked ? 'open' : 'closed')"
                            checked-children="ເປີດ" un-checked-children="ປິດ" />

                        <a-provider type="vertical" />
                        <!-- ปุ่ม Edit (อยู่ขวา) -->
                        <a @click="() => openEditModal(record)">Edit</a>

                        <a-provider type="vertical" />
                        <!-- ปุ่ม Delete (อยู๋ขวาสุด) -->
                        <a-popconfirm title="ທ່ານຕ້ອງການລຶບ Course ນີ້ບໍ່?" ok-text="ລຶບ" cancel-text="ຍົກເລີກ"
                            @confirm="ondelete(record.id)">
                            <a style="color: red; cursor: pointer;">Delete</a>
                        </a-popconfirm>
                    </span>
                </template>
            </template>
        </a-table>

        <!-- Modal for editing course -->
        <a-modal v-model:open="isOpenModalEdit" title="ເເກ້ໄຂ Course" @ok="onHandleEditSubmit">
            <!-- Teachers -->
            <div class="select-container">
                <label for="teacher-select">ອາຈານ</label>
                <a-select id="teacher-select" v-model:value="formStateEdit.teacher_id" show-search
                    placeholder="Select a teacher" style="width: 100%" :options="data.teachers"></a-select>
            </div>

            <!-- Categories -->
            <div class="select-container">
                <label for="category-select">ໝວດໝູ່</label>
                <a-select id="category-select" v-model:value="formStateEdit.category_id" show-search
                    placeholder="Select a category" style="width: 100%" :options="data.categories"></a-select>
            </div>

            <!-- Title -->
            <div class="select-container">
                <label for="title-input">ຫົວຂໍ້</label>
                <a-input v-model:value="formStateEdit.title" placeholder="ຫົວຂໍ້..."></a-input>
            </div>

            <!-- Max Students -->
            <div class="select-container">
                <label for="max-students-input">ຈຳນວນນັກສຶກສາ</label>
                <a-input type="number" v-model:value="formStateEdit.max_students"
                    placeholder="ຈຳນວນນັກສຶກສາ..."></a-input>
            </div>

            <!-- Max Duration -->
            <div class="select-container">
                <label for="max-duration-input">ຈຳນວນຊົ່ວໂມງ</label>
                <a-input type="number" v-model:value="formStateEdit.duration_hours"
                    placeholder="ຈຳນວນຊົ່ວໂມງ..."></a-input>
            </div>

            <!-- Price -->
            <div class="select-container">
                <label for="max-price-input">ລາຄາ</label>
                <a-input type="number" v-model:value="formStateEdit.price" placeholder="ລາຄາ..."></a-input>
            </div>

            <!-- Registration Start Date -->
            <div class="select-container">
                <label for="registration-start-date-input">ວັນທີ່ເປີດສະໝັກ</label>
                <a-date-picker :value-format="'YYYY-MM-DD'" v-model:value="formStateEdit.registration_start_date"
                    placeholder="ວັນທີ່ເປີດສະໝັກ" style="width: 100%"></a-date-picker>
            </div>

            <!-- Registration End Date -->
            <div class="select-container">
                <label for="registration-end-date-input">ວັນທີ່ປິດສະໝັກ</label>
                <a-date-picker :value-format="'YYYY-MM-DD'" v-model:value="formStateEdit.registration_end_date"
                    placeholder="ວັນທີ່ປິດສະໝັກ" style="width: 100%"></a-date-picker>
            </div>

            <!-- Start Date -->
            <div class="select-container">
                <label for="start-date-input">ວັນທີ່ເປີດສອນ</label>
                <a-date-picker :value-format="'YYYY-MM-DD'" v-model:value="formStateEdit.start_date"
                    placeholder="ວັນທີ່ເປີດສອນ" style="width: 100%"></a-date-picker>
            </div>

            <!-- End Date -->
            <div class="select-container">
                <label for="end-date-input">ວັນທີ່ປິດສອນ</label>
                <a-date-picker :value-format="'YYYY-MM-DD'" v-model:value="formStateEdit.end_date"
                    placeholder="ວັນທີ່ປິດສອນ" style="width: 100%"></a-date-picker>
            </div>

            <!-- Description -->
            <div class="select-container">
                <label for="description-input">ລາຍລະອຽດ</label>
                <a-textarea v-model:value="formStateEdit.description" placeholder="ລາຍລະອຽດ..." rows="4"></a-textarea>
            </div>
        </a-modal>
        <!-- Modal for adding new course -->
        <a-modal v-model:open="isOpenModalAdd" :confirm-loading="isSubmitting" title="ເພີ່ມຂໍ້ມູນ" @ok="handleSubmit"
            @cancel="isOpenModalAdd = false">
            <div class="select-container">
                <label>ອາຈານ</label>
                <a-select v-model:value="addForm.teacher_id" style="width: 100%" :options="data.teachers" />
            </div>

            <div class="select-container">
                <label>ໝວດໝູ່</label>
                <a-select v-model:value="addForm.category_id" style="width: 100%" :options="data.categories" />
            </div>

            <div class="select-container">
                <label>ຫົວຂໍ້</label>
                <a-input v-model:value="addForm.title" />
            </div>

            <div class="select-container">
                <label>ຈຳນວນນັກສຶກສາ</label>
                <a-input type="number" v-model:value="addForm.max_student" />
            </div>

            <div class="select-container">
                <label>ຈຳນວນຊົ່ວໂມງ</label>
                <a-input type="number" v-model:value="addForm.duration_hours" />
            </div>

            <div class="select-container">
                <label>ລາຄາ</label>
                <a-input type="number" v-model:value="addForm.price" />
            </div>

            <div class="select-container">
                <label>ວັນທີ່ເປີດສະໝັກ</label>
                <a-date-picker v-model:value="addForm.registration_start_date" style="width: 100%" />
            </div>

            <div class="select-container">
                <label>ວັນທີ່ປິດສະໝັກ</label>
                <a-date-picker v-model:value="addForm.registration_end_date" style="width: 100%" />
            </div>

            <div class="select-container">
                <label>ວັນທີ່ເປີດສອນ</label>
                <a-date-picker v-model:value="addForm.start_date" style="width: 100%" />
            </div>

            <div class="select-container">
                <label>ວັນທີ່ປິດສອນ</label>
                <a-date-picker v-model:value="addForm.end_date" style="width: 100%" />
            </div>

            <div class="select-container">
                <label>ລາຍລະອຽດ</label>
                <a-textarea v-model:value="addForm.description" rows="4" />
            </div>
        </a-modal>
    </div>
</template>

<style scoped lang="scss">
.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    p {
        font-size: 20px;
        font-weight: bold;
        color: #000000;
    }
}

.select-container {
    margin-bottom: 12px;

    label {
        display: block;
        font-weight: bold;
        margin-bottom: 4px;
    }
}
</style>
