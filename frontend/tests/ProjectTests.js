describe('After mounting a tables page,', function () {
    beforeEach(function() {
        
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
          vm_tables.current_month = cur_month;
          vm_tables.selected_month = cur_month;
          vm_tables.selected_month_after_click = vm_tables.selected_month;

          vm_tables.current_year = today.getFullYear().toString();
          vm_tables.selected_year = today.getFullYear().toString();
          vm_tables.selected_year_after_click = vm_tables.selected_year;
      
    });

    it('1. the selected year should be the same as the current year and it should not be empty', function() {
        expect(vm_tables.selected_year).toEqual(vm_tables.current_year);
        expect(vm_tables.selected_year).not.toEqual({});
    });

    it('2. the selected month should not be empty and be a string', function() {
        expect(typeof(vm_tables.selected_month)).toEqual('string');
        expect(vm_tables.selected_month).not.toEqual('');
    });

    it('3. the average temp and precipitaion properties should be defined and numeric', function() {
        expect(typeof(vm_tables.avg)).toEqual('number')
        expect(typeof(vm_tables.precip)).toEqual('number')
    })

    describe('then, when the "select" button is clicked, ', function() {

    it('1. the table is not shown when the year selected is 1998', function() {
        vm_tables.selected_year = '1998'
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(false)
       
    });
    it('2. the table is shown when the year selected is 1881, 1941, 1991, 2018', function () {
        vm_tables.selected_year = '1881';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(true);
        vm_tables.selected_year = '1941';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(true);
        vm_tables.selected_year = '1991';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(true);
        vm_tables.selected_year = '2018';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(true);
    });
    it('3. when the invalid year or month selected, the table is not shown, but the warning is, and then gets back to the normal state', function() {
        vm_tables.selected_year = '100500';
        vm_tables.selected_month = 'Январь';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(false);
        expect(vm_tables.unexpected_select).toBe(true);
        vm_tables.selected_year = '2017';
        vm_tables.selected_month = 'Феврюнь';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(false);
        expect(vm_tables.unexpected_select).toBe(true);
        vm_tables.selected_year = '***';
        vm_tables.selected_month = 33;
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(false);
        expect(vm_tables.unexpected_select).toBe(true);
        vm_tables.selected_year = '2017';
        vm_tables.selected_month = 'Январь';
        vm_tables.get_table_needed();
        expect(vm_tables.not_absent).toBe(true);
        expect(vm_tables.unexpected_select).toBe(false);

    });
});
    describe('then, when the "select current" button is clicked, ', function() {

        it('1. selected month and year are equal to current ones regardless of previous choices', function() {
        vm_tables.selected_year = '1998';
        vm_tables.selected_month = 'Январь';
        vm_tables.get_table_needed();
        vm_tables.get_current_data();
        expect(vm_tables.selected_month).toEqual(vm_tables.current_month);
        expect(vm_tables.selected_year).toEqual(vm_tables.current_year);
        expect(vm_tables.not_absent).toBe(true);
        expect(vm_tables.unexpected_select).toBe(false);
        vm_tables.selected_year = '***';
        vm_tables.selected_month = 33;
        vm_tables.get_table_needed();
        vm_tables.get_current_data();
        expect(vm_tables.selected_month).toEqual(vm_tables.current_month);
        expect(vm_tables.selected_year).toEqual(vm_tables.current_year);
        expect(vm_tables.not_absent).toBe(true);
        expect(vm_tables.unexpected_select).toBe(false);
    });
});

});

describe('After mounting another page, "the_day",', function() {
    beforeEach(function() {
        vm_theday.historicals_loaded = false
        vm_theday.day_data_loaded = false
        var today = new Date();
        vm_theday.current_year = today.getFullYear();
    });

    it('1. the current year should be non-empty and numeric', function() {
         expect(typeof(vm_theday.current_year)).toEqual('number');
    });
    it('2. the current date should be defined and reactive', function() {
        vm_theday.current_date();
        expect(vm_theday.current_date().getFullYear()).toEqual(2018);
    });
    it('3. if the date is February 29th of a leap year, the different set of "years ago" is used', function() {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(2020, 1, 29));
        var today = new Date();
        if ((today.getMonth() + 1 == 2) && (today.getDate() == 29))
           numbers =  ['4', '8', '20', '40', '100']
        else
           numbers =  ['1', '5', '10', '50', '100']
        expect(numbers.indexOf('5')).toBe(-1);
        jasmine.clock().mockDate(new Date(2018, 11, 21));
        var today = new Date();
        if ((today.getMonth() + 1 == 2) && (today.getDate() == 29))
           numbers =  ['4', '8', '20', '40', '100']
        else
           numbers =  ['1', '5', '10', '50', '100']
        expect(numbers.indexOf('5')).not.toBe(-1);
        jasmine.clock().uninstall();
    })
    
    describe('4. my custom data parser should', () => {
        beforeEach(() => {
            jasmine.clock().install();
        jasmine.clock().mockDate(new Date(2019, 0, 1));
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('return a normal current date with dashes', () => {
            myresult = vm_theday.custom_date_parse('01-01-2019')
            expect(myresult).not.toEqual(null);
        });
        it('return a normal current date with dots', () => {
            myresult = vm_theday.custom_date_parse('01.01.2019')
            expect(myresult).not.toEqual(null);
        })
        it('return a normal current date with original format', () => {
            myresult = vm_theday.custom_date_parse('1/1/2019')
            expect(myresult).not.toEqual(null);
        })
        it("behave regardless of zeros in months' numbers", () => {
            myresult = vm_theday.custom_date_parse('01.1.2019')
            expect(myresult).not.toEqual(null);
        })
        it('disregard mixed inputs', () => {
            myresult = vm_theday.custom_date_parse('1.01-2019')
            expect(myresult).toEqual(null);
            //console.log(myresult)
        })
        it('disregard non-string inputs and not crash', () => {
            myresult = vm_theday.custom_date_parse(2018)
            expect(myresult).toEqual(null);
        })
        it('normally convert a date with month greater than the current one', () => {
            myresult = vm_theday.custom_date_parse('01-02-2016')
            expect(myresult).not.toEqual(null);
        })
        it('normally convert a date with day greater than the current one', () => {
            myresult = vm_theday.custom_date_parse('05-02-2016')
            expect(myresult).not.toEqual(null);
        })
        it('disregard dates before 1881', () => {
            myresult = vm_theday.custom_date_parse('31.12.1880')
            expect(myresult).toEqual(null);
        })
        
        it('disregard dates before 1881 when the year is still 1881', () => {
            myresult = vm_theday.custom_date_parse('32.12.1880')
            expect(myresult).toEqual(null);
        })
        it('disregard negative days values', () => {
            myresult = vm_theday.custom_date_parse('-1.12.2018')
            expect(myresult).toEqual(null);
        })
        it('disregard too great month values', () => {
            myresult = vm_theday.custom_date_parse('12.14.2017')
            expect(myresult).toEqual(null);
        })
        it('disregard too small month values', () => {
            myresult = vm_theday.custom_date_parse('12.0.2017')
            expect(myresult).toEqual(null);
        })
        it('not disregard dates later than today in order to show a special message', () => {
            myresult = vm_theday.custom_date_parse('3.1.2019')
            expect(myresult).not.toEqual(null);
        })
        it('apply February 29th of a leap year', () => {
            myresult = vm_theday.custom_date_parse('29.2.2016')
            expect(myresult).not.toEqual(null);
        })
        it('not apply February 29th of a non-leap year', () => {
            myresult = vm_theday.custom_date_parse('29.2.2017')
            expect(myresult).toEqual(null);
        })
        
    });
    describe('then, when the "select" button is clicked', () => {
        it('by default, clicking the button procs; if selected date is null, clicking the button does nothing', () => {
            vm_theday.get_date_needed();
            expect(vm_theday.pointless_click).toBe(false);
            vm_theday.selected_date = null;
            vm_theday.get_date_needed();
            expect(vm_theday.pointless_click).toBe(true);
        })
    })


})

