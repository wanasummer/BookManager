import { request } from "../utils/request"

export function getUserList(query){
    return request({
        url:'/api/getUserList',
        method:'get',
        params:query
    })
}

export function banUser(ids){
    return request({
        url:'/api/ban',
        method:'post',
        data:{user_id:[...ids]}
    })
}