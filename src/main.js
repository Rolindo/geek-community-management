import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Bmob from 'hydrogen-js-sdk'
import CryptoJS from 'crypto-js'
// 引入CSS(解决全局高度问题)
import '@/css/all.css'
// 引入elementUI
import 'element-ui/lib/theme-chalk/index.css';
import '@/plugins/element.js'
// 初始化Bmob
Bmob.initialize("d7a451719dc09e87", "600586", "d160ae5672e6b9942f2f39ece380d775")
// 将Bmob挂载到Vue原型上
Vue.prototype.Bmob = Bmob;
Vue.prototype.CryptoJS = CryptoJS;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')