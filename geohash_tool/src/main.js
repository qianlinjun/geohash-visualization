import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import axios from "axios";

//下面是将$axios和$qs挂在原型上，以便在实例中能用 this.$axios能够拿到
Vue.prototype.$axios = axios;
Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
