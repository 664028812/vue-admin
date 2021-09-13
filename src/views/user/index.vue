<template>
  <div class="app-container">
    <el-col class="toolbar" style="padding-bottom: 20px;">
      <el-col :span="5">
        <el-input v-model="searchVal" placeholder="请输入内容"></el-input>
      </el-col>
      <el-col :span="11">
        <el-row style="margin-left:20px">
          <el-button type="primary" @click="Search()">查询</el-button>
          <el-button type="primary" @click="handleAdd()">新增</el-button>
          <el-button type="primary" @click="handleEdit()">编辑</el-button>
          <el-button type="danger" @click="handleDelete()">删除</el-button>
        </el-row>
      </el-col>
    </el-col>

    <el-table
      :data="users"
      highlight-current-row
      @current-change="selectCurrentRow"
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <el-table-column type="selection" width="50"> </el-table-column>
      <el-table-column type="index" width="80"> </el-table-column>
      <el-table-column prop="realName" label="昵称" width="" sortable>
      </el-table-column>
      <el-table-column prop="account" label="登录名" width="" sortable>
      </el-table-column>
      <el-table-column prop="roleNames" label="角色" width="" sortable>
        <template slot-scope="scope">
          <el-tag v-for="item in scope.row.roleNames" :key="item.Id"
            >{{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <!--<el-table-column prop="name" label="姓名" width="" sortable>-->
      <!--</el-table-column>-->
      <el-table-column prop="gender" label="性别" width="" sortable>
        <template slot-scope="scope">
          <el-tag>
            {{
              scope.row.gender === 1
                ? "男"
                : scope.row.gender === 0
                ? "女"
                : "未知"
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="birth"
        label="生日"
        :formatter="formatBirth"
        width=""
        sortable
      >
      </el-table-column>
      <el-table-column prop="status" label="状态" width="" sortable>
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 0 ? 'success' : 'danger'"
            disable-transitions
            >{{ scope.row.status === 0 ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage3"
      :page-size="20"
      layout="prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <el-col :span="24" class="toolbar">
      <el-button
        type="danger"
        @click="batchRemove"
        :disabled="this.sels.length === 0"
        >批量删除</el-button
      >
      <el-pagination
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
        :page-size="50"
        :total="total"
        style="float:right;"
      >
      </el-pagination>
    </el-col>
    <!--编辑界面-->
    <el-dialog
      title="编辑"
      :visible.sync="editFormVisible"
      v-model="editFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        label-width="80px"
        :rules="editFormRules"
        ref="editForm"
      >
        <el-form-item label="昵称" prop="realName">
          <el-input v-model="editForm.realName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="登录名" prop="account">
          <el-input v-model="editForm.account" auto-complete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="密码" prop="uLoginPWD">-->
        <!--<el-input v-model="editForm.uLoginPWD" show-password  auto-complete="off"></el-input>-->
        <!--</el-form-item>-->

        <el-form-item label="角色" prop="RIDs">
          <el-select multiple v-model="editForm.riDs" placeholder="请选择角色">
            <el-option :key="0" :label="'未选择角色'" :value="0"></el-option>
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number
            v-model="editForm.age"
            :min="0"
            :max="200"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.birth"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click.native="editSubmit"
          :loading="editLoading"
          >提交</el-button
        >
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog
      title="新增用户"
      :visible.sync="addFormVisible"
      v-model="addFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
        ref="addForm"
      >
        <el-form-item label="昵称" prop="realName">
          <el-input v-model="addForm.realName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="登录名" prop="account">
          <el-input v-model="addForm.account" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addForm.password"
            show-password
            auto-complete="off"
          ></el-input>
        </el-form-item>
        <!--<el-form-item label="姓名" prop="name">-->
        <!--<el-input v-model="addForm.name" auto-complete="off"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="性别">
          <el-radio-group v-model="addForm.gender">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number
            v-model="addForm.age"
            :min="0"
            :max="200"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="addForm.birth"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="addForm.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click.native="addSubmit"
          :loading="addLoading"
          >提交</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { getList } from "@/api/table";
import { Get, Post, Put, Delete } from "@/api/requestmethod";
import util from "../../utils/date.js";
import { getUserId } from "@/utils/auth"; // get token from cookie
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "gray",
        deleted: "danger"
      };
      return statusMap[status];
    }
  },
  data() {
    return {
      addLoading: false,
      editLoading: false,
      addFormVisible: false, //新增界面是否显示
      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      users: [], //所有用户的数据
      sels: [], //列表选中列
      listLoading: false,
      currentRow: null,
      page: 1, //当前页数
      total: 0, //当前数据总数
      buttonList: [],
      list: [],
      roles: [],
      searchVal: "",
      currentPage3: 1, //跳转的当前页数
      //新增界面数据
      addForm: {
        realName: "",
        account: "",
        name: "",
        password: "",
        gender: -1,
        age: 0,
        birth: "",
        addr: ""
      },
      addFormRules: {
        uLoginName: [
          { required: true, message: "请输入登录名", trigger: "blur" }
        ],
        uRealName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        uLoginPWD: [{ required: true, message: "请输入密码", trigger: "blur" }],
        birth: [{ required: true, message: "请填写生日", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        uID: 0,
        riDs: 0,
        account: "",
        name: "",
        realName: "",
        gender: -1,
        age: 0,
        birth: "",
        addr: "",
        roleNames: ""
      },
      editFormRules: {
        uLoginName: [
          { required: true, message: "请输入登录名", trigger: "blur" }
        ],
        uRealName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        birth: [{ required: true, message: "请填写生日", trigger: "blur" }]
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    callFunction() {},
    fetchData() {
      //this.listLoading = true;
      // getList().then(response => {
      //   this.list = response.data.items;
      //   this.listLoading = false;
      // });
    },
    formatSex: function(row, column) {
      return row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知";
    },
    formatBirth: function(row, column) {
      return !row.birth || row.birth == ""
        ? ""
        : util.formatDate.format(new Date(row.birth), "yyyy-MM-dd");
    },
    cfunction() {
      console.log("打印信息");
    },
    selectCurrentRow(val) {
      this.currentRow = val;
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
    //获取用户列表
    getUsers() {
      let param = {
        page: this.page,
        key: this.searchVal
      };
      this.listLoading = true;
      Get("getUsers", param).then(res => {
        console.log(`获取用户信息 ${res}`);
        this.total = res.response.dataCount;
        this.users = res.response.data;
        this.listLoading = false;
      });
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers();
    },
    Search() {
      this.getUsers();
    },
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);

            para.birth =
              !para.birth || para.birth == ""
                ? util.formatDate.format(new Date(), "yyyy-MM-dd")
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

            editUser(para).then(res => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }
              if (res.data.success) {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.editFormVisible = false;
                this.getUsers();
              } else {
                this.$message({
                  message: res.data.msg,
                  type: "error"
                });
              }
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);
            para.birth =
              !para.birth || para.birth == ""
                ? util.formatDate.format(new Date(), "yyyy-MM-dd")
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");
            Post("postUsers", para).then(res => {
              console.log("增加用户数据", res);
              if (util.isEmt.format(res)) {
                this.addLoading = false;
                return;
              }

              if (res.success) {
                this.addLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.msg,
                  type: "success"
                });
                this.$refs["addForm"].resetFields();
                this.addFormVisible = false;
                this.getUsers();
              } else {
                this.$message({
                  message: res.msg,
                  type: "error"
                });
              }
            });
          });
        }
      });
    },
    //显示新增界面
    handleAdd() {
      this.addFormVisible = true;
      this.addForm = {
        uLoginName: "",
        uRealName: "",
        uLoginPWD: "",
        name: "",
        sex: -1,
        age: 0,
        birth: "",
        addr: ""
      };
    },
    //显示编辑界面
    handleEdit() {
      console.log("当前页面", this.currentRow);
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要编辑的一行数据！",
          type: "error"
        });

        return;
      }
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
      console.log("赋值后的编辑数据", this.editForm);
      // getRoleListPage().then(res => {
      //   this.roles = res.data.response.data;
      // });
      // 获取用户角色

      Get("getRoles", { CurrentPage: false }).then(res => {
        console.log("获取到所有角色信息：", res);

        this.roles = res.response.data;
        console.log("获取到所有角色信息221321：", this.roles);
      });
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);

            console.log("提交代码");
            para.birth =
              !para.birth || para.birth == ""
                ? util.formatDate.format(new Date(), "yyyy-MM-dd")
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

            console.log("PUT 请求的数据”：", para);
            Put("putUser", para).then(res => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }
              console.log("PUT 请求回应的数据”：", res);
              if (res.success) {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.msg,
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.editFormVisible = false;
                this.getUsers();
              } else {
                this.$message({
                  message: res.msg,
                  type: "error"
                });
              }
            });
          });
        }
      });
    },
    //批量删除
    batchRemove: function() {
      // return;

      var ids = this.sels.map(item => item.uID).toString();
      this.$confirm("该功能还未开放？", "提示", {
        type: "warning"
      })
        .then(() => {
          // this.listLoading = true;
          // let para = { ids: ids };
        })
        .catch(() => {});
    },
    handleDelete() {
      console.log("当前页面", this.currentRow);
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要删除一行的数据！",
          type: "error"
        });

        return;
      }

      this.$confirm("确认删除？", "提示", {
        type: "warning"
      })
        .then(() => {
          Delete("DeleteUser", { id: row.id }).then(res => {
            console.log("删除用户信息", res);

            this.roles = res.response.data;
            this.getUsers();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getUsers();
  }
};
</script>
