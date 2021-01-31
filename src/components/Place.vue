<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>场地管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="place-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="searchPlace"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="success" @click="openAddPlaceDialog"
            >添加场地</el-button
          >
        </el-col>
      </el-row>
      <!-- 场地信息表格 -->
      <el-table
        :data="
          searchPlaceData.slice((currentPage - 1) * size, currentPage * size)
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
          label="场地"
          prop="placeName"
          align="center"
        ></el-table-column>
        <el-table-column label="是否被占用" align="center">
          <template slot-scope="scope">{{
            scope.row.occupied | occupiedFilter
          }}</template>
        </el-table-column>
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
                @click="openEditPlaceDialog(scope.row)"
              ></el-button
            ></el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除成员"
              placement="top-start"
            >
              <el-button
                v-show="scope.row.occupied === false"
                icon="el-icon-delete"
                type="danger"
                size="mini"
                @click="deletePlace(scope.row)"
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
          :total="placeList.length"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 展示添加场地对话框 -->
    <el-dialog title="添加场地" :visible.sync="showAddPlaceDialog" width="30%">
      <!-- 添加用户信息表单 -->
      <el-form
        :model="addPlaceForm"
        ref="addPlaceForm"
        class="add-place-form"
        :rules="addPlaceFormRules"
      >
        <el-form-item prop="placeName">
          <el-input
            v-model="addPlaceForm.placeName"
            prefix-icon="el-icon-office-building"
            placeholder="请输入场地名称"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="addPlace" class="addPlace"
            >添加</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 展示修改场地对话框 -->
    <el-dialog title="修改场地" :visible.sync="showEditPlaceDialog" width="30%">
      <!-- 添加用户信息表单 -->
      <el-form
        :model="editPlaceForm"
        ref="editPlaceForm"
        class="edit-place-form"
      >
        <el-form-item prop="placeName">
          <el-input
            v-model="editPlaceForm.placeName"
            prefix-icon="el-icon-office-building"
            placeholder="请输入场地名称"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="editPlaceData" class="editPlace"
            >修改</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { addPlace, editPlace } from "@/api/place";
import { getTableData, deleteItem, getItem } from "@/api/common";
export default {
  filters: {
    occupiedFilter(value) {
      return value ? "是" : "否";
    },
  },
  created() {
    this.getPlaceData();
  },
  data() {
    return {
      searchPlace: "",
      showEditPlaceDialog: false,
      editPlaceForm: {},
      currentPage: 1,
      size: 5,
      placeList: [],
      loading: true,
      // 控制添加场地对话框的显示
      showAddPlaceDialog: false,
      // 添加场地的表单
      addPlaceForm: {},
      // 表单验证规则
      addPlaceFormRules: {
        placeName: [
          {
            required: true,
            message: "请输入场地名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    searchPlaceData() {
      const searchData = this.searchPlace;
      if (searchData) {
        return this.placeList.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).indexOf(searchData) > -1;
          });
        });
      }
      return this.placeList;
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
    // 打开添加活动场地对话框栏
    openAddPlaceDialog() {
      this.showAddPlaceDialog = true;
    },
    deletePlace(placeData) {
      const { objectId, placeName } = placeData;
      this.$confirm(`确定要删除${placeName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const deleteResult = await deleteItem("Place", objectId);
        if (deleteResult) {
          this.$message.success("删除成功");
          this.getPlaceData();
        }
      });
    },
    // 获取场地信息
    async getPlaceData() {
      const placeData = await getTableData("Place");
      this.placeList = placeData;
      this.loading = false;
    },
    // 添加场地
    async addPlace() {
      this.$refs.addPlaceForm.validate(async (valid) => {
        // 如果未通过表单验证
        if (!valid) return this.$message.error("添加场地失败!");
        // 获取场地名称
        const { placeName } = this.addPlaceForm;
        const addPlaceResult = await addPlace(placeName);
        if (addPlaceResult) {
          this.showAddPlaceDialog = false;
          this.getPlaceData();
          this.$message.success("添加成功");
        }
      });
    },
    async openEditPlaceDialog(data) {
      const placeData = await getItem("Place", data.objectId);
      this.editPlaceForm = placeData;
      this.showEditPlaceDialog = true;
    },
    // 修改场地
    async editPlaceData() {
      const { placeName, objectId } = this.editPlaceForm;
      const editPlaceResult = await editPlace(placeName, objectId);
      if (editPlaceResult) {
        this.getPlaceData();
        this.showEditPlaceDialog = false;
        this.$message.success("修改成功");
      }
    },
  },
};
</script>
<style lang="less" scoped>
.place-content {
  margin-top: 20px;
}
.addPlace {
  display: flex;
  margin: 0 auto;
}
.pagination {
  text-align: center;
  margin-top: 20px;
}
.editPlace {
  display: flex;
  margin: 0 auto;
}
</style>