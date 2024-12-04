<template>
    <div>
        <el-form :inline="true" :model="queryParams" label-width="80px">
            <el-form-item label="书名" prop="book_name">
                <el-input v-model="queryParams.book_name" style="width: 200px" clearable placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="书本ISBN" prop="book_isbn">
                <el-input v-model="queryParams.book_isbn" clearable style="width: 200px" placeholder="请输入发布者" />
            </el-form-item>
            <el-form-item label="出版社" prop="book_press">
                <el-input v-model="queryParams.book_press" style="width: 200px" clearable placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="作者" prop="book_author">
                <el-input v-model="queryParams.book_author" clearable style="width: 200px" placeholder="请输入发布者" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜 索</el-button>
                <el-button icon="Refresh" @click="refresh">重 置</el-button>
            </el-form-item>
        </el-form>
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
                    <el-button size="small" type="success" @click="handleReservation(scope.row)"
                        v-if="!scope.row.booking_id">
                        预 约
                    </el-button>
                    <el-button size="small" type="success" plain @click="handelBorrow(scope.row)"
                        v-if="scope.row.booking_id">
                        借 阅
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
import { ElMessage } from 'element-plus'
import { ref, onMounted } from "vue";
import { bookList, borrowBook, reservationBook } from "@/api/book.js";
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
    bookList(queryParams.value).then((res) => {
        formList.value = res.data.data;
        total.value = res.data.total;
    });
};

const refresh = () => {
    queryParams.value = {
        pageSize: 10,
        pageNum: 1,
        book_name: null,
        book_isbn: null,
        book_press: null,
        book_author: null,
    };
    bookList(queryParams.value).then((res) => {
        formList.value = res.data.data;
        total.value = res.data.total;
    });
};

const getList = (p) => {
    queryParams.value.pageSize = p.limit
    queryParams.value.pageNum = p.page
    bookList(queryParams.value).then((res) => {
        formList.value = res.data.data;
        total.value = res.data.total;
    });

}

const handleReservation = (row) => {
    const book_id = row.book_id
    const user_id = localStorage.getItem('userId')
    const book_borrower = localStorage.getItem('name')
    reservationBook({ book_id, user_id })
        .then(res => {
            ElMessage({
                message: "预约成功",
                type: "success",
            });
        })
        .catch(e => {
            ElMessage({
                message: "预约失败",
                type: "error",
            });
        })
        .finally(()=>{
            handleQuery()
        })
}

const handelBorrow = (row) => {
    const book_id = row.book_id
    const user_id = localStorage.getItem('userId')
    const book_borrower = localStorage.getItem('name')
    borrowBook({ book_borrower, user_id, book_id })
        .then(res => {
            ElMessage({
                message: "借阅成功",
                type: "success",
            });
        })
        .catch(e => {
            ElMessage({
                message: "借阅失败",
                type: "error",
            });
        })
        .finally(()=>{
            handleQuery()
        })
}
</script>

<style lang="scss" scoped></style>