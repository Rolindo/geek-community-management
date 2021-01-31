<template>
  <div>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div class="header">
          <img src="../../assets/banner.png" alt="logo" />
          <span>Geek社团管理</span>
        </div>
        <el-button type="warning" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px">
          <!-- 菜单栏 -->
          <el-menu
            :default-active="activePath"
            class="el-menu-vertical-demo"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#ffd04b"
            router
          >
            <el-menu-item
              index="/home/members"
              @click="saveMenuItemState('/home/members')"
            >
              <i class="el-icon-user"></i>
              <span slot="title">人员管理</span>
            </el-menu-item>
            <el-menu-item
              index="/home/society"
              @click="saveMenuItemState('/home/society')"
            >
              <i class="el-icon-s-home"></i>
              <span slot="title">社团管理</span>
            </el-menu-item>
            <el-menu-item
              index="/home/activity"
              @click="saveMenuItemState('/home/activity')"
            >
              <i class="el-icon-coordinate"></i>
              <span slot="title">活动管理</span>
            </el-menu-item>
            <el-menu-item
              index="/home/place"
              @click="saveMenuItemState('/home/place')"
            >
              <i class="el-icon-location-information"></i>
              <span slot="title">场地管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activePath: "",
    };
  },
  created() {
    this.getMenuItemState();
  },
  methods: {
    //退出登录
    logout() {
      this.$confirm("确定要退出登录吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.Bmob.User.logout();
        this.$message({
          type: "success",
          message: "登出成功!",
        });
        this.$router.push("/login");
      });
    },
    // 保存菜单项的激活状态
    saveMenuItemState(path) {
      window.sessionStorage.setItem("activePath", path);
    },
    // 从sessionStorage中获取激活的菜单项index
    getMenuItemState() {
      this.activePath = window.sessionStorage.getItem("activePath");
    },
  },
};
</script>
<style lang="less">
.home-container {
  height: 100vh;
  min-width: 1024px;
  .header {
    display: flex;
    align-items: center;
    img {
      width: 70px;
    }
    span {
      margin-left: 5px;
    }
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
  }
  .el-aside {
    background-color: #333744;
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>