var vm_theday = new Vue({
   data() {
      const today = new Date()
      return {
         selected_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
         pointless_click: false,
         previous_selected_date: '',
         selected_date_after_click: '',
         current_temp: '',
         clicked: false,
         historicals_of_the_day: {},
         historicals_loaded: false,
         current_loaded: false,
         day_data_loaded: false,
         current_year: '',
         current_date: function () {

            return new Date(today.getFullYear(), today.getMonth(), today.getDate())
         },
         isCollapsedOpen: false,
         day_data: [{ 'min': '' }],
         day_names: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
         month_names: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
         numbers: function () {
            var today = new Date();
            if ((today.getMonth() + 1 == 2) && (today.getDate() == 29))
               return ['4', '8', '20', '40', '100']
            else
               return ['1', '5', '10', '50', '100']
         }
      }

   },
   mounted() {
      this.historicals_loaded = false
      this.day_data_loaded = false
      var today = new Date();
      this.current_year = today.getFullYear();
      axios.get('http://localhost:8000/api/this_day_history').then(response => {
         this.historicals_of_the_day = response.data
         this.historicals_loaded = true
         this.selected_date_after_click = this.selected_date
         this.day_data_loaded = true
      }).catch(function (error) {
         console.log(error)
      })
      axios.get('http://localhost:8000/api/today_weather').then(response => {
         this.current_temp = response.data.toString()
         this.current_loaded = true

      })



   },
   methods: {
      custom_date_parse: function (datestring) {
         function daysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
         }
         var today = new Date()
         if (typeof (datestring) != 'string')
            return null

         var parts = datestring.split('.')
         if (parts.length == 1) {
            var parts = datestring.split('-')
            if (parts.length == 1) {
               var parts = datestring.split('/')
               //console.log(parts)
               if ((parts[0] > 12) || (parts[0] < 1))
                  return null
               if ((parts[1] > daysInMonth(parts[0], parts[2])) || (parts[1] < 1))
                  return null
               var mydate = new Date(parts[2], parts[0] - 1, parts[1])
               //console.log(mydate)

               if (mydate.getFullYear() > today.getFullYear())
                  return null

               if ((mydate.getFullYear() == today.getFullYear()) && (mydate.getMonth() > today.getMonth()))
                  return null

               if (mydate.getFullYear() < 1881)
                  return null


               if (isNaN(mydate.getTime()))
                  return null
               return mydate
            }
            if ((parts[1] > 12) || (parts[1] < 1))
               return null
            if ((parts[0] > daysInMonth(parts[1], parts[2])) || (parts[0] < 1))
               return null
            var mydate = new Date(parts[2], parts[1] - 1, parts[0]);
            if (mydate.getFullYear() > today.getFullYear())
               return null

            if ((mydate.getFullYear() == today.getFullYear()) && (mydate.getMonth() > today.getMonth()))
               return null

            if (mydate.getFullYear() < 1881)
               return null


            if (isNaN(mydate.getTime()))
               return null
            return mydate
         }
         if ((parts[1] > 12) || (parts[1] < 1))
            return null
         if ((parts[0] > daysInMonth(parts[1], parts[2])) || (parts[0] < 1))
            return null
         var mydate = new Date(parts[2], parts[1] - 1, parts[0]);
         if (mydate.getFullYear() > today.getFullYear())
            return null

         if ((mydate.getFullYear() == today.getFullYear()) && (mydate.getMonth() > today.getMonth()))
            return null

         if (mydate.getFullYear() < 1881)
            return null


         if (isNaN(mydate.getTime()))
            return null
         return mydate
      },
      get_date_needed: function () {
         if (this.selected_date != null) {

            this.day_data_loaded = false
            this.pointless_click = false
            var day = this.selected_date.getDate();
            var month = this.selected_date.getMonth() + 1;
            var year = this.selected_date.getFullYear();
            if (this.previous_selected_date != this.selected_date) {
               axios.get('http://localhost:8000/api/day=' + day + '&month=' + month + '&year=' + year).then(response => {
                  this.day_data = response.data;
                  this.day_data.date += '.' + year.toString();
                  this.day_data = [this.day_data]
                  this.previous_selected_date = this.selected_date;
                  this.selected_date_after_click = this.selected_date;
                  this.day_data_loaded = true
                  this.clicked = true
                  //console.log(this.day_data)
               })

            }
         }
         else {
            this.pointless_click = true
         }


      }
   }
})