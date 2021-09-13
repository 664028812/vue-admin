import Cookies from 'js-cookie'

const TokenKey = 'Bearer'
const userid='userid'
const user='user'
export function getToken() {
  //return Cookies.get(TokenKey)
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  //return Cookies.set(TokenKey, token)
  return localStorage.setItem(TokenKey,token)
}

export function setUserId(data) {
  //return Cookies.set(TokenKey, token)
  return localStorage.setItem(userid,data)
}

export function setUser(data) {
  //return Cookies.set(TokenKey, token)
  return localStorage.setItem(user,data)
}

export function getUserId() {
  //return Cookies.get(TokenKey)
  return localStorage.getItem(userid)
}


export function removeToken() {
  //return Cookies.remove(TokenKey)
  return localStorage.removeItem(TokenKey)
}
