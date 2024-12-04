<template>
  <div class="login-container">
    <el-form ref="formRef" :model="form" @keydown.enter="loginHandle">
      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>
      <el-form-item class="el-from-item">
        <el-icon color="white">
          <User />
        </el-icon>
        <el-input v-model="form.user_email" style="widthf: 300px" placeholder="请输入账户" clearable />
      </el-form-item>
      <el-form-item class="el-from-item">
        <el-icon color="white">
          <Lock />
        </el-icon>
        <el-input v-model="form.user_password" style="width: 300px" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-button type="primary" @click="loginHandle">登录</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "../../api/login";
import { ref } from "vue";
const router = useRouter();
const route = useRoute();
const form = ref({
  user_email: "",
  user_password: "",
});

const loginHandle = async () => {
  try {
    const res = await login(form.value);
    if (res.status === 200) {
      localStorage.setItem('isAuthenticated', 'true');
      const role = res.data.data.user_role
      const name = res.data.data.user_name
      const token = res.data.data.token
      const userId = res.data.data.user_id
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('token',token)
      localStorage.setItem('userId',userId)
      console.log(res)
      const redirect = route.query.redirect || '/book';
      await router.push(redirect);
      ElMessage({
        message: '登录成功',
        type: 'success',
      });
    } else {
      ElMessage({
        message: '用户名或密码错误',
        type: 'error',
      });
    }
  } catch (error) {
    ElMessage({
      message: "用户名或密码错误",
      type: 'error',
    });
  }
};

</script>

<style scoped>
.login-container {
  background-color: rgb(48, 65, 86);
  width: 400px;
  height: 300px;
  margin: 250px auto;
  display: flex;
  justify-content: center;
  border-radius: 10px;
}

.title-container {
  display: flex;
  justify-content: center;
}

.title {
  color: white;
}

.el-form-item {
  display: flex;
  align-items: center;
}

.el-input {
  box-sizing: border-box;
  padding: 10px;
}

.el-button {
  width: 300px;
  margin-top: 10px;
}
</style>
