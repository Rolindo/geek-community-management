<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="activity-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="searchActivity"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="success" @click="openAddActivityDialog"
            >添加活动</el-button
          >
        </el-col>
      </el-row>
      <!-- 活动信息表格 -->
      <el-table
        :data="
          searchActivityData.slice((currentPage - 1) * size, currentPage * size)
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
          label="活动名称"
          prop="activityName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="活动地点"
          prop="placeName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="活动人数"
          prop="numberOfActivities"
          align="center"
        ></el-table-column>
        <el-table-column
          label="举办社团"
          prop="societyName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="开始时间"
          prop="startTime"
          align="center"
        ></el-table-column>
        <el-table-column
          label="结束时间"
          prop="endTime"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <!-- 添加鼠标悬浮时候的文字提示 -->
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑活动"
              placement="top-start"
            >
              <el-button
                icon="el-icon-edit"
                type="warning"
                size="mini"
                @click="openEditActivityDialog(scope.row)"
              ></el-button
            ></el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除活动"
              placement="top-start"
            >
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                @click="deleteActivity(scope.row)"
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
    <!-- 展示添加活动对话框 -->
    <el-dialog
      title="添加活动"
      :visible.sync="showAddActivityDialog"
      width="30%"
    >
      <!-- 添加用户信息表单 -->
      <el-form
        :model="addActivityForm"
        ref="addActivityForm"
        class="add-activity-form"
      >
        <el-form-item prop="activityName">
          <el-input
            v-model="addActivityForm.activityName"
            prefix-icon="el-icon-office-building"
            placeholder="请输入活动名称"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="addActivityForm.placeData"
            placeholder="请选择活动地点"
            style="width: 100%"
            value-key="objectId"
          >
            <el-option
              v-for="item in placeList"
              :key="item.objectId"
              :label="item.placeName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="addActivityForm.societyData"
            placeholder="请选择社团"
            style="width: 100%"
            value-key="objectId"
          >
            <el-option
              v-for="item in societyList"
              :key="item.objectId"
              :label="item.societyName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="addActivityForm.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="活动开始日期"
            end-placeholder="活动结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="addActivity" class="btn"
            >添加</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 展示修改活动对话框 -->
    <el-dialog
      title="修改活动"
      :visible.sync="showEditActivityDialog"
      width="30%"
    >
      <!-- 添加用户信息表单 -->
      <el-form
        :model="editActivityForm"
        ref="editActivityForm"
        class="edit-activity-form"
      >
        <el-form-item prop="activityName">
          <el-input
            v-model="editActivityForm.activityName"
            prefix-icon="el-icon-office-building"
            placeholder="请输入活动名称"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="editActivityForm.placeData"
            style="width: 100%"
            value-key="objectId"
            :placeholder="editActivityForm.placeName"
          >
            <el-option
              v-for="item in placeList"
              :key="item.objectId"
              :label="item.placeName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="editActivityForm.societyData"
            style="width: 100%"
            value-key="objectId"
            :placeholder="editActivityForm.societyName"
          >
            <el-option
              v-for="item in societyList"
              :key="item.objectId"
              :label="item.societyName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="editActivityForm.time"
            type="datetimerange"
            range-separator="至"
            :start-placeholder="editActivityForm.startTime"
            :end-placeholder="editActivityForm.endTime"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="editActivity" class="btn"
            >修改</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getTableData, deleteItem, getItem } from "@/api/common";
import { createActivity, deleteActivity, updateActivity } from "@/api/activity";
console.log();
export default {
  data() {
    return {
      searchActivity: "",
      loading: true,
      showAddActivityDialog: false,
      showEditActivityDialog: false,
      addActivityForm: {},
      editActivityForm: {},
      placeList: [],
      societyList: [],
      activityList: [],
      currentPage: 1,
      size: 5,
    };
  },
  computed: {
    searchActivityData() {
      const searchData = this.searchActivity;
      if (searchData) {
        return this.activityList.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).indexOf(searchData) > -1;
          });
        });
      }
      return this.activityList;
    },
  },
  created() {
    this.getActivityData();
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
    // 获取活动信息
    async getActivityData() {
      const activityList = await getTableData("Activity");
      this.activityList = activityList;
      this.loading = false;
    },
    // 获取社团信息
    async getSocietyData() {
      const societyList = await getTableData("Society");
      this.societyList = societyList;
    },
    // 获取地点信息
    async getPlaceData() {
      let placeList = await getTableData("Place");
      placeList = placeList.filter((data) => {
        return data.occupied === false;
      });
      this.placeList = placeList;
    },
    async openEditActivityDialog(data) {
      this.getSocietyData();
      let placeList = await getTableData("Place");
      let societyList = await getTableData("Society");
      this.showEditActivityDialog = true;
      const activityData = await getItem("Activity", data.objectId);
      this.placeList = placeList.filter((data) => {
        return (
          data.placeName !== activityData.placeName && data.occupied === false
        );
      });
      this.societyList = societyList.filter((data) => {
        return data.societyName !== activityData.societyName;
      });
      this.editActivityForm = activityData;
    },
    openAddActivityDialog() {
      this.showAddActivityDialog = true;
      this.getSocietyData();
      this.getPlaceData();
    },
    // 添加活动
    async addActivity() {
      const createActivityResult = await createActivity(this.addActivityForm);
      if (createActivityResult) {
        this.getActivityData();
        this.showAddActivityDialog = false;
        this.$message.success("添加成功");
        return;
      }
      this.$message.success("添加失败");
    },
    // 删除活动
    async deleteActivity(activityData) {
      this.$confirm(`确定要删除${activityData.activityName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const deleteResult = await deleteActivity(activityData);
        if (deleteResult) {
          this.$message.success("删除成功");
          this.getActivityData();
          return;
        }
        this.$message.success("删除失败");
      });
    },
    // 修改活动
    async editActivity() {
      const updateResult = await updateActivity(this.editActivityForm);
      console.log(updateResult);
      this.getActivityData();
    },
  },
};
</script>
<style lang="less" scoped>
.activity-content {
  margin-top: 20px;
}
.el-date-editor--datetimerange.el-input__inner /deep/ {
  width: 100%;
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