<template>
  <div class="welcome-page">
    <h1>欢迎,{{ username }}</h1>
  </div>
</template>

<script>
import { getCurrentUser } from "@/api/user";
export default {
  created() {
    this.getUserData();
    this.setMenuState();
  },
  data() {
    return {
      username: "",
    };
  },
  methods: {
    async getUserData() {
      // 获取当前用户登录信息
      const { username } = await getCurrentUser();
      this.username = username;
    },
    // 清除sessionStorage中保存的菜单激活index
    setMenuState() {
      window.sessionStorage.removeItem("activePath");
    },
  },
};
</script>
<style lang="less">
.welcome-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  h1 {
    font-size: 50px;
  }
}
</style>