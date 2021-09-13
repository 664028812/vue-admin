<template>
  <div class="app-container">
    <!--   接口管理       -->
    <el-col class="toolbar" style="padding-bottom: 20px;">
      <el-col :span="5">
        <el-input v-model="searchVal" placeholder="请输入内容"></el-input>
      </el-col>
      <el-col :span="11">
        <el-row style="margin-left:20px">
          <el-button type="primary" @click="Search()">查询</el-button>
          <el-button type="primary" @click="handleAdd()">新增</el-button>
          <el-button type="primary" @click="handleEdit()">编辑</el-button>
          <el-button type="danger" @click="handleDel()">删除</el-button>
        </el-row>
      </el-col>
    </el-col>

    <!--列表-->
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
      <el-table-column prop="linkUrl" label="接口地址" width="" sortable>
      </el-table-column>
      <el-table-column prop="name" label="描述" width="300" sortable>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        :formatter="formatCreateTime"
        width=""
        sortable
      >
      </el-table-column>
      <el-table-column prop="createBy" label="创建者" width="" sortable>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="" sortable>
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.enabled ? 'success' : 'danger'"
            disable-transitions
            >{{ scope.row.enabled ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column> -->
    </el-table>

    <!--工具条-->
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
        :page-size="page_size"
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
        <el-form-item label="接口地址" prop="linkUrl">
          <el-input v-model="editForm.linkUrl" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="接口描述" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="editForm.enabled" placeholder="请选择状态">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.linkUrl"
              :value="item.value"
            ></el-option>
          </el-select>
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
        <el-form-item label="接口地址" prop="linkUrl">
          <el-input v-model="addForm.linkUrl" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="接口描述" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="addForm.enabled" placeholder="请选择状态">
            <el-option label="激活" value="true"></el-option>
            <el-option label="禁用" value="false"></el-option>
          </el-select>
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
import { Get, Post, Put, Delete } from "@/api/requestmethod";
import util from "../../utils/date.js";
import { getUserId } from "@/utils/auth"; // get token from cookie
export default {
  name: "interface",
  computed: {
    ...mapGetters(["name"])
  },
  data() {
    return {
      searchVal: "",
      buttonList: [],
      currentRow: null,
      filters: {
        LinkUrl: ""
      },
      users: [],
      statusList: [
        { linkUrl: "激活", value: true },
        { linkUrl: "禁用", value: false }
      ],
      total: 0,
      page: 1,
      page_size: 50,
      listLoading: false,
      sels: [], //列表选中列

      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        linkUrl: [
          { required: true, message: "请输入接口地址", trigger: "blur" }
        ]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        createBy: "",
        linkUrl: "",
        name: "",
        enabled: false
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        LinkUrl: [
          { required: true, message: "请输入接口地址", trigger: "blur" }
        ]
      },
      //新增界面数据
      addForm: {
        createBy: "",
        createId: "",
        linkUrl: "",
        name: "",
        enabled: true
      }
    };
  },
  methods: {
    selectCurrentRow(val) {
      this.currentRow = val;
    },
    callFunction(item) {},
    //性别显示转换
    formatEnabled: function(row, column) {
      return row.Enabled ? "正常" : "未知";
    },
    formatCreateTime: function(row, column) {
      return !row.createTime || row.createTime == ""
        ? ""
        : util.formatDate.format(new Date(row.createTime), "yyyy-MM-dd");
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getModules();
    },
    //获取用户列表
    getModules() {
      let para = {
        page: this.page,
        key: this.searchVal
      };
      this.listLoading = true;

      //NProgress.start();
      Get("getInterface", para).then(res => {
        this.total = res.response.dataCount;
        this.users = res.response.data;
        this.page_size = res.response.pageSize;
        this.listLoading = false;
        //NProgress.done();
      });
    },
    //删除
    handleDel() {
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要删除的一行数据！",
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
          let para = { id: row.id };
          Delete("DeleteInterface", para).then(res => {
            if (util.isEmt.format(res)) {
              this.listLoading = false;
              return;
            }
            this.listLoading = false;
            //NProgress.done();
            if (res.success) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
            } else {
              this.$message({
                message: res.msg,
                type: "error"
              });
            }

            this.getModules();
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
      console.log("------row      ", row);
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
      console.log("------row ----------     ", this.editForm);
    },
    //显示新增界面
    handleAdd() {
      this.addFormVisible = true;
      this.addForm = {
        createBy: "",
        linkUrl: "",
        name: "",
        enabled: "true"
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

            para.modifyTime = util.formatDate.format(new Date(), "yyyy-MM-dd");

            console.log("更新的角色数据---------------", para);
            Put("putInterface", para).then(res => {
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
                this.getModules();
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
    //新增
    addSubmit: function() {
      let _this = this;
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);

            para.createTime = util.formatDate.format(new Date(), "yyyy-MM-dd");
            para.modifyTime = para.createTime;
            para.isDeleted = false;

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
            if (para.enabled == "true") {
              para.enabled = true;
            } else {
              para.enabled = false;
            }

            console.log("POST 提交数据", para);

            Post("postInterface", para).then(res => {
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
                this.getModules();
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
    selsChange: function(sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function() {
      this.$message({
        message: "该功能未开放",
        type: "warning"
      });
    },
    Search() {
      this.getModules();
    }
  },
  mounted() {
    this.getModules();
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
