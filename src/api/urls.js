const urls = {
  getUserById:"/api/User/GetById",//通过id 获取用户信息
  getToken: "/api/Login/JWTToken3.0",//获取 token
  getUsers:"/api/User/Get",//获取全部用户
  DeleteUser:"/api/User/Delete",//删除用户信息
  postUsers:"/api/User/Post",//增加一个用户
  getRoles:"/api/Role/Get",//获取用户角色
  putUser:"/api/User/Put",//编辑一个用户
  PostRole:"/api/Role/Post",//添加角色
  DeleteRole:"/api/Role/Delete",//删除校色
  putRole:"/api/Role/Put",//更新角色

  getInterface:"/api/Module/Get",//获取全部接口
  DeleteInterface:"/api/Module/Delete",//删除接口
  postInterface:"/api/Module/Post",//增加接口
  putInterface:"/api/Module/Put",//更新接口
  getInterfaceById:"/api​/Module​/GetById",//id 获取

  postAssig:"/api/Permission/Assign",//保存菜单权限分配
  DeletePermission:"/api/Permission/Delete",//删除菜单
  getPermission:"/api/Permission/Get",//获取菜单
  getNavigationBar:"/api/Permission/GetNavigationBar",//获取路由树
  getPermissionIdByRoleId:"/api/Permission/GetPermissionIdByRoleId",//通过角色获取菜单【无权限】
  getPermissionTree:"/api/Permission/GetPermissionTree",//获取菜单树
  getTreeTable:"/api/Permission/GetTreeTable",//查询树形table
  postPermission:"/api/Permission/Post",//添加一个菜单
  putPermission:"/api/Permission/Put",//更新菜单
};
export { urls };
