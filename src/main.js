import Vue from 'vue'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import JQuery from 'jquery'
window.$ = JQuery

import {  faTrashAlt} from '@fortawesome/free-regular-svg-icons';// far
library.add(faTrashAlt);

Vue.config.productionTip = false

Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  render: h => h(App),
}).$mount('#app')
