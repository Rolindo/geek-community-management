<template>
  <div class="register-page">
    <img
      src="../../assets/banner.png"
      alt="Geek"
      title="Geek"
      class="geek-logo"
      v-loading="loading"
    />
    <el-form
      :model="registerForm"
      :rules="registerFormRules"
      class="register-form"
      label-width="120px"
      ref="registerForm"
    >
      <h1>用户注册</h1>
      <el-form-item label="用户名：" prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="请输入用户名"
          type="text"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码：" prop="password">
        <el-input
          v-model="registerForm.password"
          placeholder="请输入密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="请确认密码：" prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          placeholder="请再次输入密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="手机号码：" prop="mobilePhoneNumber">
        <el-input
          v-model="registerForm.mobilePhoneNumber"
          placeholder="请输入手机号码"
          type="text"
        ></el-input>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button class="register-button" type="primary" @click="register"
          >注册</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// 引入封装的注册请求
import { register } from "@/api/user";
export default {
  data() {
    // 检测两次密码输入的一致性
    const checkPassword = (rule, value, cb) => {
      if (value === this.registerForm.password) {
        return cb();
      }
      cb(new Error("两次密码输入不一致,请重新输入"));
    };
    return {
      loading: false,
      // 注册表单数据
      registerForm: {
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
      // 注册表单验证
      registerFormRules: {
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
    // 用户注册
    async register() {
      this.$refs.registerForm.validate(async (valid) => {
        // 如果未通过表单验证
        if (!valid) return this.$message.error("注册失败!");
        this.loading = true;
        const registerParams = this.registerForm;
        // 删除验证密码的键值对
        delete registerParams.confirmPassword;
        // 获取注册返回结果
        const result = await register(registerParams).catch((err) => {
          this.loading = false;
          this.$message.error(err);
        });
        // 注册成功
        if (result.objectId) {
          this.loading = false;
          this.$message.success("注册成功");
          this.$router.push("/login");
        }
      });
    },
  },
};
</script>
<style lang="less">
// 设置页面整体样式
.register-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: url("../../assets/user/login_bg.jpg");
  background-size: cover;
  .register-form {
    .el-form-item__label,
    .el-radio {
      color: #fff;
    }
    margin-top: 40px;
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
    padding: 30px 80px;
    h1 {
      text-align: center;
      letter-spacing: 8px;
    }
  }
}
.geek-logo {
  background-color: #fff;
  z-index: 5;
  position: absolute;
  margin-top: -280px;
  border-radius: 50%;
}
.register-button {
  width: 100%;
}
</style>