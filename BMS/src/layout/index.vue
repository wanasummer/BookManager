<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="210px">
                <Menu @menuItemSelected="handleMenuItemSelected"></Menu>
            </el-aside>
            <el-container>
                <el-header>
                    <Headers></Headers>
                </el-header>
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import Menu from './Menu/index.vue'
import Headers from './Headers/index.vue'
import { useRouter } from 'vue-router';

const router = useRouter();
const handleMenuItemSelected = (index) => {
    const path = index.index;
    router.push(path);
};
</script>

<style scoped>
body {
    height: 100vh;
}

.common-layout {
    background-color: white;
    height: 100%;
}

.el-container {
    height: 100%;
}

.el-aside {
    background-color: #304156;

}

.el-header {
    background-color: aliceblue;
}
</style>