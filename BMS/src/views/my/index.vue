<template>
    <div>
        <el-table :data="formList" style="width: 100%">
            <el-table-column label="id" prop="user_id" align="center" width="50" />
            <el-table-column label="用户名" prop="user_name" align="center" />
            <el-table-column label="用户邮箱" prop="user_email" align="center" />
            <el-table-column label="用户角色" prop="user_role" align="center" />
            <el-table-column label="用户状态" prop="user_status" align="center">
                <template #default="scope">
                    {{ scope.row.user_status == 0 ? '正常' : '封禁' }}
                </template>
            </el-table-column>
            <el-table-column label="创建日期" prop="created_at" align="center">
                <template #default="scope">
                    {{ formatDate(scope.row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button size="small" type="danger" @click="handleBan(scope.row)" v-if="scope.row.user_status == 0">
                        封 禁
                    </el-button>
                    <el-button size="small" type="danger" plain @click="handelUnBan(scope.row)"
                        v-if="scope.row.user_status == 1">
                        解 封
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getUserList, banUser } from '@/api/user.js'
import { formatDate } from '@/utils/formatDate.js'

onMounted(() => {
    handleQuery();
});

const formList = ref([])
const total = ref(0)

const queryParams = ref({
    pageSize: 10,
    pageNum: 1,
});

const handleQuery = () => {
    getUserList(queryParams.value).then((res) => {
        formList.value = res.data.data;
        total.value = res.data.total;
    });
};


const handleBan = (row) => {
    banUser([row.user_id])
        .then(res => {
            ElMessage({
                message: "封禁成功",
                type: "success",
            });
        })
        .catch(e => {
            ElMessage({
                message: "封禁失败",
                type: "error",
            });
        })
        .finally(() => {
            handleQuery()
        })
}
</script>

<style lang="scss" scoped></style>