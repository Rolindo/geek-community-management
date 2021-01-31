<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>人员管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="member-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入用户信息"
            class="input-with-select"
            v-model="searchMembers"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="success" @click="showAddUserDialog = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户信息表格 -->
      <el-table
        :data="
          searchMembersData.slice((currentPage - 1) * size, currentPage * size)
        "
        stripe
        v-loading="loading"
      >
        <el-table-column
          type="index"
          :index="indexMethod"
          align="center"
        ></el-table-column>
        <el-table-column
          label="用户名"
          prop="username"
          align="center"
        ></el-table-column>
        <el-table-column
          label="身份"
          prop="identity"
          align="center"
        ></el-table-column>
        <el-table-column
          label="电话号码"
          prop="mobilePhoneNumber"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <!-- 添加鼠标悬浮时候的文字提示 -->
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑成员"
              placement="top-start"
            >
              <el-button
                icon="el-icon-edit"
                type="warning"
                size="mini"
                @click="openEditUserDialog(scope.row)"
              ></el-button
            ></el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除成员"
              placement="top-start"
            >
              <el-button
                v-show="scope.row.identity !== '社长'"
                icon="el-icon-delete"
                type="danger"
                size="mini"
                @click="deleteUser(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="size"
          layout="prev, pager, next"
          :total="userList.length"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 展示添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="showAddUserDialog" width="30%">
      <!-- 添加用户信息表单 -->
      <el-form
        :model="addUserForm"
        ref="addUserForm"
        class="add-user-form"
        :rules="addUserFormRules"
      >
        <el-form-item prop="username">
          <el-input
            v-model="addUserForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="addUserForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            prefix-icon="el-icon-key"
            v-model="addUserForm.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="mobilePhoneNumber">
          <el-input
            v-model="addUserForm.mobilePhoneNumber"
            placeholder="请输入手机号码"
            type="text"
            prefix-icon="el-icon-phone"
          ></el-input>
        </el-form-item>
        <el-form-item label="选择身份：" prop="identity">
          <el-radio-group v-model="addUserForm.identity">
            <el-radio label="管理员">管理员</el-radio>
            <el-radio label="社长">社长</el-radio>
            <el-radio label="游客">游客</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="addUser" class="addUser"
            >添加</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 展示修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="showEditUserDialog" width="30%">
      <!-- 添加用户信息表单 -->
      <el-form :model="editUserForm" ref="editUserForm" class="edit-user-form">
        <el-form-item prop="username">
          <el-input
            v-model="editUserForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item prop="mobilePhoneNumber">
          <el-input
            v-model="editUserForm.mobilePhoneNumber"
            placeholder="请输入手机号码"
            type="text"
            prefix-icon="el-icon-phone"
          ></el-input>
        </el-form-item>
        <el-form-item label="选择身份：" prop="identity">
          <el-radio-group v-model="editUserForm.identity">
            <el-radio label="社长">社长</el-radio>
            <el-radio label="游客">游客</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="editUserData" class="addUser"
            >修改</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, register, getCurrentUser } from "@/api/user";
import { deleteItem, updateItem, getItem } from "@/api/common";

export default {
  name: "Members",
  created() {
    this.getUserListData();
  },
  computed: {
    searchMembersData() {
      const searchData = this.searchMembers;
      if (searchData) {
        return this.userList.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).indexOf(searchData) > -1;
          });
        });
      }
      return this.userList;
    },
  },
  data() {
    // 检测两次密码输入的一致性
    const checkPassword = (rule, value, cb) => {
      if (value === this.addUserForm.password) {
        return cb();
      }
      cb(new Error("两次密码输入不一致,请重新输入"));
    };
    return {
      // 查找用户信息
      searchMembers: "",
      // 用户信息表
      userList: [],
      // 控制加载条显示隐藏
      loading: true,
      // 控制修改用户dialog的显隐
      showEditUserDialog: false,
      // 控制添加用户dialog的显隐
      showAddUserDialog: false,
      // 修改用户表单
      editUserForm: {},
      currentPage: 1,
      size: 5,
      // 添加用户表单数据
      addUserForm: {
        // 用户名
        username: "",
        // 密码
        password: "",
        // 确认密码
        confirmPassword: "",
        // 手机号码
        mobilePhoneNumber: "",
        // 用户身份
        identity: "管理员",
      },
      // 添加用户表单验证
      addUserFormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
        ],
        confirmPassword: [
          {
            required: true,
            message: "请再次输入密码",
            trigger: "blur",
          },
          {
            validator: checkPassword,
            trigger: "blur",
          },
        ],
        mobilePhoneNumber: [
          {
            required: true,
            message: "请输入手机号",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    indexMethod(index) {
      return (this.currentPage - 1) * this.size + index + 1;
    },
    handleSizeChange(val) {
      this.size = val;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    // 获取用户信息
    async getUserListData() {
      const currentUser = await getCurrentUser();
      const res = await getUserList(currentUser.identity);
      this.loading = false;
      if (res.length > 0) {
        this.userList = res;
        return true;
      }
      return false;
    },
    async openEditUserDialog(userData) {
      this.showEditUserDialog = true;
      const userDataResult = await getItem("_User", userData.objectId);
      this.editUserForm = userDataResult;
    },
    // 修改用户信息
    async editUserData() {
      const currentUser = await getCurrentUser();
      let {
        username,
        mobilePhoneNumber,
        objectId,
        identity,
      } = this.editUserForm;
      let editedUserForm = {
        username,
        mobilePhoneNumber,
        identity,
      };
      // 从sessionStorage中获取reLoginCode
      const reLoginCode = sessionStorage.getItem("reLoginCode");
      const res = await updateItem(
        "_User",
        editedUserForm,
        objectId,
        reLoginCode,
        currentUser.username
      );
      this.loading = true;
      // 修改后重新获取用户信息
      this.getUserListData().then((res) => {
        if (res) {
          this.showEditUserDialog = false;
          this.$message.success("修改成功");
          this.loading = false;
          return;
        }
        this.$message.success("修改失败");
      });
    },
    // 添加用户
    addUser() {
      this.$refs.addUserForm.validate(async (valid) => {
        // 如果未通过表单验证
        if (!valid) return this.$message.error("添加用户失败!");
        const addUserParams = this.addUserForm;
        // 删除验证密码的键值对
        delete addUserParams.confirmPassword;
        // 获取注册返回结果
        const result = await register(addUserParams).catch((err) => {
          this.$message.error(err);
        });
        // 注册成功
        if (result.objectId) {
          this.getUserListData().then((res) => {
            if (res) {
              console.log(res);
              this.$message.success("添加成功");
              this.showAddUserDialog = false;
              return;
            }
            this.$message.success("添加失败");
          });
        }
      });
    },
    // 删除用户
    deleteUser(userData) {
      const { objectId, username } = userData;
      this.$confirm(`确定要删除${username}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const deleteResult = await deleteItem("_User", objectId);
        if (deleteResult.msg === "ok") {
          this.getUserListData();
          this.$message.success("删除成功");
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
.member-content {
  margin-top: 20px;
}
.addUser {
  display: flex;
  margin: 0 auto;
}
.pagination {
  text-align: center;
  margin-top: 20px;
}
</style>