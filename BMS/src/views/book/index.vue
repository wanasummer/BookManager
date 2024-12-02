<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams" label-width="80px">
      <el-form-item label="书名" prop="book_name">
        <el-input
          v-model="queryParams.book_name"
          style="width: 200px"
          clearable
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item label="书本ISBN" prop="book_isbn">
        <el-input
          v-model="queryParams.book_isbn"
          clearable
          style="width: 200px"
          placeholder="请输入发布者"
        />
      </el-form-item>
      <el-form-item label="出版社" prop="book_press">
        <el-input
          v-model="queryParams.book_press"
          style="width: 200px"
          clearable
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item label="作者" prop="book_author">
        <el-input
          v-model="queryParams.book_author"
          clearable
          style="width: 200px"
          placeholder="请输入发布者"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜 索</el-button
        >
        <el-button icon="Refresh" @click="refresh">重 置</el-button>
        <el-button type="success" icon="Plus" @click="handleAddBook"
          >新 增</el-button
        >
        <el-button
          type="danger"
          icon="Delete"
          @click="handleDelete"
          v-show="btn_show"
          >删 除</el-button
        >
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
          <el-button size="small" type="primary" @click="handle(scope.row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination @pagination="getList" :page="queryParams.pageNum" :limit="queryParams.pageSize" v-show="total > 0" :total="total">
    </pagination> 

    <el-dialog v-model="addBookVisible" :title="title" width="500">
      <el-form :model="bookForm" :rules="rules">
        <el-form-item label="图书名称" prop="book_name">
          <el-input v-model="bookForm.book_name"></el-input>
        </el-form-item>
        <el-form-item label="图书isbn" prop="book_isbn">
          <el-input v-model="bookForm.book_isbn"></el-input>
        </el-form-item>
        <el-form-item label="图书出版社" prop="book_press">
          <el-input v-model="bookForm.book_press"></el-input>
        </el-form-item>
        <el-form-item label="图书作者" prop="book_author">
          <el-input v-model="bookForm.book_author"></el-input>
        </el-form-item>
        <el-form-item label="图书页数" prop="book_pagination">
          <el-input v-model.number="bookForm.book_pagination"></el-input>
        </el-form-item>
        <el-form-item label="图书价格" prop="book_price">
          <el-input v-model.number="bookForm.book_price"></el-input>
        </el-form-item>
      </el-form>
      <el-row justify="end">
        <el-button type="primary" @click="confirm">确 认</el-button>
        <el-button @click="cancel">取 消</el-button>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import { bookList, addBook } from "@/api/book.js";
import { ref, onMounted } from "vue";
import Pagination from '@/components/Pagination/index.vue'
const total = ref(0);
const rules = ref({
  book_name: [{ required: true, message: "图书名称不能为空", trigger: "blur" }],
  book_isbn: [{ required: true, message: "图书isbn不能为空", trigger: "blur" }],
  book_press: [
    { required: true, message: "图书出版社不能为空", trigger: "blur" },
  ],
  book_author: [
    { required: true, message: "图书作者不能为空", trigger: "blur" },
  ],
  book_pagination: [
    {
      required: true,
      type: "number",
      message: "图书页数不能为空且只能是数字",
      trigger: "blur",
    },
  ],
  book_price: [
    {
      required: true,
      type: "number",
      message: "图书价格不能为空只能是数字",
      trigger: "blur",
    },
  ],
});
const addBookVisible = ref(false);
const title = ref("");
const bookForm = ref({
  book_name: "",
  book_isbn: "",
  book_press: "",
  book_author: "",
  book_pagination: "",
  book_price: "",
});

const formList = ref([]);
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

const handleAddBook = () => {
  title.value = "新增图书";
  addBookVisible.value = true;
};

const confirm = () => {
  addBook(bookForm.value)
    .then((res) => {
      ElMessage({
        message: "添加成功",
        type: "success",
      });
    })
    .catch((e) => {
      ElMessage({
        message: "添加失败",
        type: "error",
      });
    });
};

const cancel = () => {
  addBookVisible.value = false;
};

const getList = (p) =>{
  queryParams.value.pageSize = p.limit
  queryParams.value.pageNum = p.page
  bookList(queryParams.value).then((res) => {
    formList.value = res.data.data;
    total.value = res.data.total;
  });

}
</script>
