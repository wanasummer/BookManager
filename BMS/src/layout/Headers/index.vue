<template>
    <div class="header">
        <div class="logo">
            <h3>图书预约管理系统</h3>
        </div>
        <div class="exit">
            <span>欢迎您：{{ user_name }}</span>&nbsp;
            <el-button @click="logout" type="text" icon="RemoveFilled">退出</el-button>
        </div>
    </div>
</template>


<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
import { ref, onMounted } from 'vue';

const user_name = ref('')

onMounted(() => {
    const name = localStorage.getItem('name');
    user_name.value = name
})

//退出登录
const logout = () => {
    localStorage.removeItem('name');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    router.push('/login')
};
</script>


<style>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    width: 80px;
    border: 0cap;
    background-color: aliceblue;
}
</style>