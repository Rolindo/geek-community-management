<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>社团管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="society-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入社团名称"
            class="input-with-select"
            v-model="searchSociety"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="success" @click="openAddSocietyDialog"
            >添加社团</el-button
          >
        </el-col>
      </el-row>
      <!-- 社团信息表格 -->
      <el-table
        :data="
          searchSocietyData.slice((currentPage - 1) * size, currentPage * size)
        "
        stripe
        v-loading="loading"
      >
        <el-table-column
          type="index"
          align="center"
          :index="indexMethod"
        ></el-table-column>
        <el-table-column
          label="社团名称"
          prop="societyName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="社团人数"
          prop="numberOfSociety"
          align="center"
        ></el-table-column>
        <el-table-column
          label="社长"
          prop="proprieterName"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <!-- 添加鼠标悬浮时候的文字提示 -->
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑社团"
              placement="top-start"
            >
              <el-button
                icon="el-icon-edit"
                type="warning"
                size="mini"
                @click="openEditSocietyDialog(scope.row)"
              ></el-button
            ></el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除社团"
              placement="top-start"
            >
              <el-button
                v-show="scope.row.activitiesId.length === 0"
                icon="el-icon-delete"
                type="danger"
                size="mini"
                @click="deleteSociety(scope.row)"
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
          :total="societyList.length"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 添加社团对话框 -->
    <el-dialog
      title="添加社团"
      :visible.sync="showAddSocietyDialog"
      width="30%"
    >
      <!-- 添加用户信息表单 -->
      <el-form
        :model="addSocietyForm"
        class="add-society-form"
        :rules="addSocietyFormRules"
      >
        <el-form-item prop="societyName">
          <el-input
            v-model="addSocietyForm.societyName"
            prefix-icon="el-icon-s-home"
            placeholder="请输入社团名称"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="addSocietyForm.proprieterData"
            placeholder="请选择社长"
            style="width: 100%"
            value-key="objectId"
          >
            <el-option
              v-for="item in userList"
              :key="item.objectId"
              :label="item.username"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" class="btn" @click="addSociety"
            >添加</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 编辑社团对话框 -->
    <el-dialog
      title="编辑社团"
      :visible.sync="showEditSocietyDialog"
      width="30%"
    >
      <!-- 编辑信息表单 -->
      <el-form
        :model="editSocietyForm"
        class="edit-society-form"
        :rules="addSocietyFormRules"
      >
        <el-form-item prop="societyName">
          <el-input
            v-model="editSocietyForm.societyName"
            prefix-icon="el-icon-s-home"
            placeholder="请输入社团名称"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="editSocietyForm.proprieterData"
            placeholder="请选择社长"
            style="width: 100%"
            value-key="objectId"
          >
            <el-option
              v-for="item in userList"
              :key="item.objectId"
              :label="item.username"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" class="btn" @click="editSociety"
            >修改</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getCurrentUser, getUserList } from "@/api/user";
import { getItem } from "@/api/common";

import {
  createSociety,
  getSocietyList,
  deleteSociety,
  editSociety,
} from "@/api/society";
export default {
  created() {
    this.getCurrentUserData();
    this.setSocietyList();
  },
  data() {
    return {
      searchSociety: "",
      loading: true,
      currentPage: 1,
      size: 5,
      reLoginCode: "",
      editSocietyForm: {},
      showEditSocietyDialog: false,
      currentUser: "",
      societyList: [],
      // 选择的社长Id
      selectedProprieterId: "",
      userList: [],
      showAddSocietyDialog: false,
      // 添加社团表单数据
      addSocietyForm: {
        // 社团名称
        societyName: "",
        // 社团人数
        numberOfSociety: 1,
        // 社长信息
        proprieterData: {},
      },
      // 添加用户表单验证
      addSocietyFormRules: {
        societyName: [
          {
            required: true,
            message: "请输入社团名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    searchSocietyData() {
      const searchData = this.searchSociety;
      if (searchData) {
        return this.societyList.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).indexOf(searchData) > -1;
          });
        });
      }
      return this.societyList;
    },
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
    async getCurrentUserData() {
      const reLoginCode = sessionStorage.getItem("reLoginCode");
      const { username } = await getCurrentUser();
      this.currentUser = username;
      this.reLoginCode = reLoginCode;
    },
    // 打开添加社团dialog
    openAddSocietyDialog() {
      this.showAddSocietyDialog = true;
      this.getUserListData();
    },
    // 打开修改社团dialog
    async openEditSocietyDialog(data) {
      this.getUserListData();
      this.showEditSocietyDialog = true;
      const societyData = await getItem("Society", data.objectId);
      this.editSocietyForm = societyData;
      // this.userList = userListRes;
    },
    async setSocietyList() {
      const societyListData = await getSocietyList().catch((err) => {
        this.$message.error(err);
      });
      this.societyList = societyListData;
      this.loading = false;
    },
    // 获取用户列表
    async getUserListData() {
      const currentUser = await getCurrentUser();
      const res = await getUserList(currentUser.identity, "member");
      if (res.length > 0) {
        this.userList = res;
        return true;
      }
      return false;
    },
    // 添加社团
    async addSociety() {
      const societyData = this.addSocietyForm;
      const reLoginCode = sessionStorage.getItem("reLoginCode");
      this.$confirm(`确定要添加${societyData.societyName}社团吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        // 判断用户是否选择社团社长
        if (societyData.proprieterId === "") {
          this.$message.error("请选择社团社长!");
          return;
        }
        const createResult = await createSociety(
          societyData,
          reLoginCode,
          this.currentUser
        ).catch((err) => {
          this.$message.error(err);
        });
        if (createResult) {
          this.$message.success("添加成功");
          this.showAddSocietyDialog = false;
          this.setSocietyList();
        }
      });
    },
    // 删除社团
    async deleteSociety(societyData) {
      console.log(societyData);
      // if (societyData.activitiesId) {
      //   this.$message.error("该社团有发布的活动，请先删除活动。");
      //   return;
      // }
      const reLoginCode = sessionStorage.getItem("reLoginCode");
      // 获取社团ID,社长ID,社团名称
      const { objectId, societyName, proprieterId } = societyData;
      this.$confirm(`确定要删除${societyName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const deleteRes = await deleteSociety(
          "Society",
          objectId,
          proprieterId,
          reLoginCode,
          this.currentUser
        );
        if (deleteRes) {
          this.$message.success("删除成功");
          this.setSocietyList();
        }
      });
    },
    // 编辑社团
    async editSociety() {
      const proprieterId = this.editSocietyForm.proprieterData.objectId;
      const proprieterName = this.editSocietyForm.proprieterData.username;
      // 前社长Id
      const preProprieterId = this.editSocietyForm.proprieterId;
      // 获取社团和社长的ID及社团名称
      const { objectId, societyName } = this.editSocietyForm;
      const editRes = await editSociety(
        objectId,
        proprieterId,
        proprieterName,
        societyName,
        preProprieterId,
        this.reLoginCode,
        this.currentUser
      );
      console.log(this.editSocietyForm);
      if (editRes) {
        this.showEditSocietyDialog = false;
        this.$message.success("修改成功！");
        this.setSocietyList();
      }
    },
  },
};
</script>
<style lang="less" scoped>
.society-content {
  margin-top: 20px;
}
.btn {
  display: flex;
  margin: 0 auto;
}
.pagination {
  text-align: center;
  margin-top: 20px;
}
</style>