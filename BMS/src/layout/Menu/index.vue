<template>

    <el-menu active-text-color="rgb(64, 158, 255)" background-color="#304156" text-color="rgb(191, 203, 217)">
        <el-menu-item index="/book" @click="handleMenuSelect">
            <el-icon>
                <Reading />
            </el-icon>
            <span>图书列表</span>
        </el-menu-item>
        <el-menu-item index="/borrow" @click="handleMenuSelect">
            <el-icon>
                <Upload />
            </el-icon>
            <span>图书借阅</span>
        </el-menu-item>
        <el-menu-item index="/back" @click="handleMenuSelect">
            <el-icon>
                <Download />
            </el-icon>
            <span>图书归还</span>
        </el-menu-item>
        <el-menu-item index="/my" @click="handleMenuSelect">
            <el-icon>
                <Grid />
            </el-icon>
            <span>我的借阅</span>
        </el-menu-item>
        <el-menu-item index="/setting" @click="handleMenuSelect">
            <el-icon>
                <setting />
            </el-icon>
            <span>系统设置</span>
        </el-menu-item>
    </el-menu>

</template>

<script setup>
const emit = defineEmits();
const handleMenuSelect = (index) => {
    emit('menuItemSelected', index);
};
</script>

<style>
.el-menu {
    height: 100%;
}
</style>