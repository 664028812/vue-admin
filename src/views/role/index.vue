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

    <!--列表-->
    <el-table
      :data="users"
      highlight-current-row
      v-loading="listLoading"
      @current-change="selectCurrentRow"
      style="width: 100%;"
    >
      <el-table-column type="index" width="80"></el-table-column>
      <el-table-column
        prop="name"
        label="角色名"
        width
        sortable
      ></el-table-column>
      <el-table-column
        prop="description"
        label="说明"
        width
        sortable
      ></el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        :formatter="formatCreateTime"
        width
        sortable
      ></el-table-column>
      <!--<el-table-column prop="CreateBy" label="创建者" width="" sortable>-->
      <!--</el-table-column>-->
      <el-table-column prop="enabled" label="状态" width="200" sortable>
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.enabled ? 'success' : 'danger'"
            disable-transitions
            >{{ scope.row.enabled ? "正常" : "禁用" }}</el-tag
          >
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" width="150">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>-->
    </el-table>
    <!--分页-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage3"
      :page-size="page_size"
      layout="prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

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
        <el-form-item label="角色名" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="editForm.enabled" placeholder="请选择角色状态">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input
            v-model="editForm.description"
            auto-complete="off"
          ></el-input>
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
      title="新增"
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
        <el-form-item label="角色名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="addForm.enabled" placeholder="请选择角色状态">
            <el-option label="激活" value="true"></el-option>
            <el-option label="禁用" value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input
            v-model="addForm.description"
            auto-complete="off"
          ></el-input>
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
import { mapGetters } from "vuex";
import util from "../../utils/date.js";
import { Get, Post, Put, Delete } from "@/api/requestmethod";
import ResizeHandler from "@/layout/mixin/ResizeHandler.js";
export default {
  name: "Role",
  computed: {
    ...mapGetters(["name"])
  },
  data() {
    return {
      searchVal: "", //查询条件
      currentPage3: 1, //分页相关
      filters: {
        name: ""
      },
      buttonList: [],
      users: [],
      statusList: [
        { name: "激活", value: true },
        { name: "禁用", value: false }
      ],
      total: 0,
      page: 1,
      page_size: 50,
      listLoading: false,
      sels: [], //列表选中列
      currentRow: null,
      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [{ required: true, message: "请输入角色名", trigger: "blur" }],
        enabled: [{ required: true, message: "请选择状态", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        createBy: "",
        name: "",
        enabled: false
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入角色名", trigger: "blur" }],
        enabled: [{ required: true, message: "请选择状态", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        createBy: "",
        createId: "",
        name: "",
        enabled: true
      }
    };
  },
  methods: {
    selectCurrentRow(val) {
      this.currentRow = val;
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers();
    },
    //性别显示转换
    formatEnabled: function(row, column) {
      return row.Enabled ? "正常" : "未知";
    },
    formatCreateTime: function(row, column) {
      return !row.createTime || row.createTime == ""
        ? ""
        : util.formatDate.format(new Date(row.createTime), "yyyy-MM-dd");
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
    //获取用户列表
    getRoles() {
      let _this = this;
      let para = {
        page: this.page,
        key: this.searchVal
      };
      this.listLoading = true;
      //NProgress.start();
      Get("getRoles", para).then(res => {
        if (res.success) {
          this.total = res.response.dataCount;
          this.users = res.response.data;
          this.page_size = res.response.pageSize;
          this.listLoading = false;

          //NProgress.done();
        } else {
          console.log("获取角色列表失败");
        }
      });
    },
    //查询
    Search() {
      this.getRoles();
    },
    //删除
    handleDel() {
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要编辑的一行数据！",
          type: "error"
        });

        return;
      }
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { id: row.Id };
          removeRole(para).then(res => {
            if (util.isEmt.format(res)) {
              this.listLoading = false;
              return;
            }
            this.listLoading = false;
            //NProgress.done();
            if (res.data.success) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
            } else {
              this.$message({
                message: res.data.msg,
                type: "error"
              });
            }

            this.getRoles();
          });
        })
        .catch(() => {});
    },
    //显示编辑界面
    handleEdit() {
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
    },
    //显示新增界面
    handleAdd() {
      console.log("显示新增界面");
      this.addFormVisible = true;
      this.addForm = {
        createBy: "",
        name: "",
        enabled: ""
      };
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);

            // para.birth =
            //   !para.birth || para.birth == ""
            //     ? util.formatDate.format(new Date(), "yyyy-MM-dd")
            //     : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

            debugger;
            console.log("更新数据 所", para);
            var Data = JSON.stringify(para);
            Put("putRole", para).then(res => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }

              if (res.success) {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.msg,
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.editFormVisible = false;
                this.getRoles();
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
      let _this = this;
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            console.log("ROLE 提交数据   addForm      ", this.addForm);
            let para = Object.assign({}, this.addForm);
            // para.birth =
            //   !para.birth || para.birth == ""
            //     ? util.formatDate.format(new Date(), "yyyy-MM-dd")
            //     : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

            console.log("ROLE 提交数据         ", para);
            var user = JSON.parse(window.localStorage.user);

            if (user && user.id > 0) {
              para.createId = user.id;
              para.createBy = user.realName;
            } else {
              this.$message({
                message: "用户信息为空，先登录",
                type: "error"
              });
              _this.$router.replace(
                _this.$route.query.redirect ? _this.$route.query.redirect : "/"
              );
            }
            var postData = JSON.stringify(para);
            Post("PostRole", postData).then(res => {
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
                this.getRoles();
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
          Delete("DeleteRole", { id: row.id }).then(res => {
            this.getRoles();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getRoles();
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
