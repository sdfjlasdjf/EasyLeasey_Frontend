<script setup>
import { User, Lock } from "@element-plus/icons-vue";
import { ref } from "vue";
import { ElMessage } from "element-plus";
//控制注册与登录表单的显示， 默认显示注册
const isRegister = ref(false);
//定义数据模型
const registerData = ref({
  username: "",
  password: "",
  rePassword: "",
});

//校验密码的函数
const checkRePassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("Please reenter the password"));
  } else if (value !== registerData.value.password) {
    callback(new Error("Passwords don't match"));
  } else {
    callback();
  }
};

//定义表单校验规则
const rules = {
  username: [
    { required: true, message: "Please enter username", trigger: "blur" },
    {
      min: 5,
      max: 16,
      message: "Please enter username of length 5-16",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Please enter password", trigger: "blur" },
    {
      min: 5,
      max: 16,
      message: "The password needs to be of length 5-16",
      trigger: "blur",
    },
  ],
  rePassword: [{ validator: checkRePassword, trigger: "blur" }],
};

//调用后台接口,完成注册
import { userRegisterService, userLoginService } from "@/api/user.js";
const register = async () => {
  //registerData是一个响应式对象,如果要获取值,需要.value
  let result = await userRegisterService(registerData.value);
  /* if (result.code === 0) {
        //成功了
        alert(result.msg ? result.msg : 'Registered!');
    }else{
        //失败了
        alert('Register Failed')
    } */
  //alert(result.msg ? result.msg : 'Successfully Registered');
  ElMessage.success(result.msg ? result.msg : "Successfully Registered");
};

//绑定数据,复用注册表单的数据模型
//表单数据校验
//登录函数
import { useTokenStore } from "@/stores/token.js";
import { useRouter } from "vue-router";
const router = useRouter();
const tokenStore = useTokenStore();
const login = async () => {
  //调用接口,完成登录
  let result = await userLoginService(registerData.value);
  /*
  if (result.code === 0) {
    alert(result.msg ? result.msg : "Logged in!");
  } else {
    alert("登录失败");
  }
  */
  //alert(result.msg? result.msg : 'Logged In')
  ElMessage.success(result.msg ? result.msg : "Logged In");
  //把得到的token存储到pinia中
  tokenStore.setToken(result.data.token);
  //跳转到首页 路由完成跳转
  router.push("/");
};

//定义函数,清空数据模型的数据
const clearRegisterData = () => {
  registerData.value = {
    username: "",
    password: "",
    rePassword: "",
  };
};
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 注册表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="off"
        v-if="isRegister"
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1>Register</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="Please enter username"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="Please enter password"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="Please reenter password"
            v-model="registerData.rePassword"
          ></el-input>
        </el-form-item>
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="register"
          >
            Register
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link
            type="info"
            :underline="false"
            @click="
              isRegister = false;
              clearRegisterData();
            "
          >
            ← Go back
          </el-link>
        </el-form-item>
      </el-form>
      <!-- 登录表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="off"
        v-else
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1>Login</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="Please enter username"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="Please enter password"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox class="text">Remember me</el-checkbox>
            <el-link class="text" type="primary" :underline="false"
              >Forget password?</el-link
            >
          </div>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="login"
            >Login</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link
            class="text"
            type="info"
            :underline="false"
            @click="
              isRegister = true;
              clearRegisterData();
            "
          >
            Register →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url("@/assets/Untitled Project.png") no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }

  .text {
    color: grey;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
      background-color: black;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
