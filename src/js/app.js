import Archive from './components/archive.vue'

import Vue from 'vue'

if (document.getElementById('archive')) {
  new Vue({
    el: "#archive",
    components: {
      Archive,
    },
  })
}
