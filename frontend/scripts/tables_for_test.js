var vm_tables = new Vue({
    data() {
        return {
            showContent: false,
            data: [],
            deltas_visible: true,
            not_absent: true,
            not_latest: false,
            unexpected_select: false,
            //toggle: true,
            current_month: {},
            current_year: {},
            extrema: {},
            listOfYears: function () {
                var today = new Date();
                var curyear = today.getFullYear();
                return [...Array(curyear - 1881 + 1).keys()].map(i => i + 1881).reverse();
            },
            listOfMonths: function () {
                return [
                    { id: 1, name: 'Январь' },
                    { id: 2, name: 'Февраль' },
                    { id: 3, name: 'Март' },
                    { id: 4, name: 'Апрель' },
                    { id: 5, name: 'Май' },
                    { id: 6, name: 'Июнь' },
                    { id: 7, name: 'Июль' },
                    { id: 8, name: 'Август' },
                    { id: 9, name: 'Сентябрь' },
                    { id: 10, name: 'Октябрь' },
                    { id: 11, name: 'Ноябрь' },
                    { id: 12, name: 'Декабрь' },
                ]

            },
            selected_month: {},
            selected_year: {},
            selected_month_after_click: {},
            selected_year_after_click: {},
            avg: 0.0,
            precip: 0.0,
            normal_avg: 0.0,
            normal_precip: 0
        }
    },

    mounted() {
        /*
        if (this.toggle) {
            axios.get('http://localhost:8000/api/current').then(response => {
                this.data = response.data
            })
        }
        else {
            axios.get('http://localhost:8000/api/month=9&year=2011').then(response => {
                this.data = response.data
            })
        }
        */
       axios.get('http://localhost:8000/api/current').then(response => {
        this.data = response.data;


        var i = 0;
        for (; i < response.data.length; i++) {
            if (response.data[i].avg != "") {
                this.avg += parseFloat(response.data[i].avg);
                this.precip += parseFloat(response.data[i].precip);
            }
            else
                break;

        }
        if (i > 0)
            this.avg /= i;
        this.avg = parseFloat(this.avg.toFixed(1));
        this.precip = parseFloat(this.precip.toFixed(1))
        var today = new Date();
        cur_month = (today.getMonth() + 1).toString();
        switch (cur_month) {
            case '1':
                cur_month = "Январь";
                break;
            case '2':
                cur_month = "Февраль";
                break;
            case '3':
                cur_month = "Март";
                break;
            case '4':
                cur_month = "Апрель";
                break;
            case '5':
                cur_month = "Май";
                break;
            case '6':
                cur_month = "Июнь";
                break;
            case '7':
                cur_month = "Июль";
                break;
            case '8':
                cur_month = "Август";
                break;
            case '9':
                cur_month = "Сентябрь";
                break;
            case '10':
                cur_month = "Октябрь";
                break;
            case '11':
                cur_month = "Ноябрь";
                break;
            case '12':
                cur_month = "Декабрь";
                break;
        }
        this.current_month = cur_month;
        this.selected_month = cur_month;
        this.selected_month_after_click = this.selected_month;

        this.current_year = today.getFullYear().toString();
        this.selected_year = today.getFullYear().toString();
        this.selected_year_after_click = this.selected_year;
        //month_id = today.getMonth() + 1
        /*
        axios.get('http://localhost:8000/api/averages/month=' + month_id).then(response => {
                    for (var i = 0; i < response.data.length; i++) 
                        this.normal_avg += parseFloat(response.data[i]);
                    
                    this.normal_avg /= response.data.length
                    //alert(this.normal_avg)

                    axios.get('http://localhost:8000/api/precip').then(response => {
                    
                    this.normal_precip = parseInt(response.data[month_id - 1])
                    */
        /*   
       }).catch(function (error) {
           console.log(error)
       })
       */
        axios.get('http://localhost:8000/api/extrema/month=' + (today.getMonth() + 1)).then(response => {
            this.extrema = response.data;
        }).catch(function (error) {
            console.log(error)
        })
        this.showContent = true;
    }).catch(function (error) {
        this.showContent = true;
        console.log(error)
    })
        






    },
    methods: {
        get_table_needed: function () {
            this.unexpected_select = false;
            this.not_absent = true;
            this.showContent = false;
            if ((this.current_month != this.selected_month) || (this.current_year != this.selected_year)) {
                this.not_latest = true
                if (((parseInt(this.selected_year) < 2001) && (parseInt(this.selected_year) > 1995)) || ((parseInt(this.selected_year) == 1882)))
                    this.not_absent = false
                else {
                    if (this.listOfYears().indexOf(parseInt(this.selected_year)) === -1)
                        this.unexpected_select = true;
                    else
                        this.not_absent = true
                }

            }
            else
                this.not_latest = false

            month_id = this.listOfMonths().find(x => x.name === this.selected_month);

            if (typeof (month_id) == 'undefined') {
                this.unexpected_select = true;
            }
            if (this.unexpected_select == false) {
                month_id = month_id.id;
                axios.get('http://localhost:8000/api/month=' + month_id + '&year=' + this.selected_year).then(response => {
                    this.data = response.data;

                    this.avg = 0.0;
                    this.precip = 0.0;
                    var i = 0;
                    for (; i < response.data.length; i++) {
                        if (response.data[i].avg != "") {
                            this.avg += parseFloat(response.data[i].avg);
                            this.precip += parseFloat(response.data[i].precip);
                        }
                        else
                            break;

                    }

                    this.normal_avg = 0.0
                    this.normal_precip = 0

                    axios.get('http://localhost:8000/api/averages/month=' + month_id).then(response => {
                        for (var i = 0; i < response.data.length; i++)
                            this.normal_avg += parseFloat(response.data[i]);

                        this.normal_avg /= response.data.length
                        //alert(this.normal_avg)

                        axios.get('http://localhost:8000/api/precip').then(response => {

                            this.normal_precip = parseInt(response.data[month_id - 1])
                        }).catch(function (error) {
                            console.log(error)
                        })
                    }).catch(function (error) {
                        console.log(error)
                    })


                    if (i > 0)
                        this.avg /= i;
                    this.avg = parseFloat(this.avg.toFixed(1));
                    this.precip = parseFloat(this.precip.toFixed(1))
                    if (this.selected_month_after_click != this.selected_month) {
                        axios.get('http://localhost:8000/api/extrema/month=' + month_id).then(response => {
                            this.extrema = response.data;
                        }).catch(function (error) {
                            this.showContent = true;
                            console.log(error)
                        })
                    }
                    this.selected_month_after_click = this.selected_month;
                    this.selected_year_after_click = this.selected_year;
                    setTimeout(() => {
                        this.showContent = true
                    }, 800)


                    //this.showContent = true;
                    //alert(this.precip)
                }).catch(function (error) {
                    this.showContent = true;
                    console.log(error)
                })
            }
            else {
                this.not_absent = false;
                this.showContent = true;
            }
        },
        get_current_data: function () {
            this.selected_month = this.current_month;
            this.selected_year = this.current_year;
            this.get_table_needed();

        }

    }

})
