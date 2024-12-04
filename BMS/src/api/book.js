import {
    request
} from '../utils/request';

// 获取列表
export function bookList(query) {
    return request({
        url: '/api/getBookInfo',
        method: 'get',
        params: query
    })
}

export function addBook(data) {
    return request({
        url: '/api/addBook',
        method: 'post',
        data: data
    })
}

export function updateBook(data) {
    return request({
        url: '/api/updateBookInfo',
        method: 'post',
        data: data
    })
}

export function delBook(id){
    return request({
        url:'/api/delete',
        method:'delete',
        data:{book_id:id}
    })
}

export function reservationBook(data){
    return request({
        url:'/api/booking',
        method:'post',
        data:data
    })
}

export function borrowBook(data){
    return request({
        url:'/api/book_borrow',
        method:'post',
        data:data
    })
}

export function returnBook(id){
    return request({
        url:'/api/book_return',
        method:'post',
        data:{book_id:id}
    })
}
