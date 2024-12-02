import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000'; // 替换为你的 API URL


export const request = axios.create({
    baseURL: API_URL
});


// 请求拦截器
request.interceptors.request.use(
    function (config) {
        // 假设你的token存储在localStorage中，名为token
        const token = localStorage.getItem('token');
        if (token) {
            // 将token添加到请求头中
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

