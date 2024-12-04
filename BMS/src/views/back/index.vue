<template>
    <div>
        <el-table :data="formList" style="width: 100%">
            <el-table-column label="id" prop="book_id" align="center" width="50" />
            <el-table-column label="书名" prop="book_name" align="center" />
            <el-table-column label="书本ISBN" prop="book_isbn" align="center" />
            <el-table-column label="出版社" prop="book_press" align="center" />
            <el-table-column label="作者" prop="book_author" align="center" />
            <el-table-column label="页数" prop="book_pagination" align="center" />
            <el-table-column label="价格" prop="book_price" align="center" />
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button size="small" type="primary" @click="handelReturn(scope.row)">
                        归 还
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination @pagination="getList" :page="queryParams.pageNum" :limit="queryParams.pageSize" v-show="total > 0"
            :total="total">
        </pagination>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
import { ref, onMounted } from "vue";
import { bookList, returnBook } from "@/api/book.js";
import Pagination from '@/components/Pagination/index.vue'

const formList = ref([]);
const total = ref(0)
const queryParams = ref({
    pageSize: 10,
    pageNum: 1,
    book_name: null,
    book_isbn: null,
    book_press: null,
    book_author: null,
});

onMounted(() => {
    handleQuery();
});

const handleQuery = () => {
    const user_id = localStorage.getItem('userId')
    bookList({ ...queryParams.value, status: 'placeholder' }).then((res) => {
        formList.value = res.data.data.filter(item => { return item.booking_id != null && item.booking_id == user_id });
        total.value = res.data.total;
    });
};

const getList = (p) => {
    queryParams.value.pageSize = p.limit
    queryParams.value.pageNum = p.page
    bookList({ ...queryParams.value, status: 'placeholder' }).then((res) => {
        formList.value = res.data.data.filter(item => { return item.booking_id != null && item.booking_id == user_id });
        total.value = res.data.total;
    });
}

const handelReturn = (row) => {
    returnBook(row.book_id)
        .then(res => {
            proxy.ElMessage({
                message: "归还成功",
                type: "success",
            });
        })
        .catch(e => {
            proxy.ElMessage({
                message: "归还失败",
                type: "error",
            });
        })
        .finally(()=>{
            handleQuery()
        })
}
</script>

<style lang="scss" scoped></style>