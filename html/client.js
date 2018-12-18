var mydata = JSON.parse(text)
var vm = new Vue({
  el: '#app',
  data() {
      return {
              mydata
  }
  }
  })