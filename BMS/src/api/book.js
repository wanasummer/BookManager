import { request } from '../utils/request';

// 获取列表
export function bookList(query) {
    return request({
        url: '/api/getBookInfo',
        method: 'get',
        params: query
    })
}

export function addBook(data){
    return request({
        url:'/api/addBook',
        method:'post',
        data:data
    })
}