<template>
  <div class="login-page" @keydown.enter="login">
    <img
      src="../../assets/banner.png"
      alt="Geek"
      title="Geek"
      class="geek-logo"
    />
    <el-form :model="loginForm" class="login-form">
      <h1>用户登录</h1>
      <el-form-item>
        <el-input
          v-model="loginForm.username"
          prefix-icon="el-icon-user"
          placeholder="请输入用户名"
          type="text"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="loginForm.password"
          placeholder="请输入密码"
          prefix-icon="el-icon-lock"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div class="button-group">
          <el-button type="success" @click="login">登录</el-button>
          <el-button type="primary" @click="goToRegsiter">注册</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { login } from "@/api/user";
export default {
  name: "Login",
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: "",
        password: "",
      },
    };
  },
  created() {},
  methods: {
    // 登录
    async login() {
      const loginForm = this.loginForm;
      // 加密
      let ciphertext = this.CryptoJS.AES.encrypt(
        this.loginForm.password,
        "secret key"
      ).toString();
      sessionStorage.setItem("reLoginCode", ciphertext);
      const result = await login(loginForm).catch((err) => {
        this.$message.error(err);
        return;
      });
      if (result) {
        this.$message.success("登录成功");
        this.$router.push("/home");
      }
    },
    // 跳转至注册界面
    goToRegsiter() {
      this.$router.push("/register");
    },
  },
};
</script>
<style lang="less">
// 设置页面整体样式
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: url("../../assets/user/login_bg.jpg");
  background-size: cover;
  .login-form {
    position: relative;
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(0, 0, 0, 0.15) 100%
      ),
      radial-gradient(
          at top center,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(0, 0, 0, 0.4) 120%
        )
        #989898;
    border-radius: 5%;
    background-blend-mode: multiply, multiply;
    padding: 30px 100px;
    h1 {
      text-align: center;
      letter-spacing: 8px;
    }
    .button-group {
      display: flex;
      justify-content: center;
    }
  }
  .geek-logo {
    background-color: #fff;
    z-index: 5;
    position: absolute;
    margin-top: -200px;
    border-radius: 50%;
  }
}
</style>