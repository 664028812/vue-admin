import request from '@/utils/request'
import { urls } from "./urls";
var  baseUrl ="http://127.0.0.1:5000"
export function Post(url,data) {
  // return request({
  //   url:`${baseUrl}${urls[url]}`,
  //   method: 'post',
  //   data
  // })
   return new Promise((resolve, reject) => {
    request({
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8;"
      },
      data: { ...data }, // 用 qs 将js对象转换为字符串 'name=edward&age=25'
      url: `${baseUrl}${urls[url]}`,
    }).then(
      (response) => {
        if (response.status === 200) {
          resolve(response.data);
        } else {
        }
      },
      (err) => {
        console.log("系统异常，稍后再试");
        reject(err);
      }
    );
  });
}

export function Get(url,data) {
  // return request({
  //   url:`${baseUrl}${urls[url]}`,
  //   method: 'get',
  //   params: { data }
  // })
    return new Promise((resolve, reject) => {
    request({
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      params: { ...data }, // 用 qs 将js对象转换为字符串 'name=edward&age=25'
      url: `${baseUrl}${urls[url]}`,
    }).then(
      (response) => {
        //loading.clear();
        if (response.status === 200) {
          resolve(response.data);
        } else {
        }
      },
      (err) => {
        //loading.clear();
        console.log("系统异常，稍后再试");
        reject(err);
      }
    );
  });
}