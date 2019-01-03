import falcon
from bs4 import BeautifulSoup
from wsgiref import simple_server  
import urllib
from datetime import date
import json
import re
 

# get the contents
def get_from_thermo_karelia(month=1, year=1881):
    response = urllib.request.urlopen(f'http://thermo.karelia.ru/weather/w_history.php?town=spb&month={month}&year={year}')
    html = response.read()
    #print(html)
    parsed_html = BeautifulSoup(html, features="html.parser")
    #print(parsed_html.body.find(''))
    info_list = []
    all_values = parsed_html.body.find_all('td', bgcolor={'#FFFFFF'})
    for i in range(len(all_values)//5):
        datalist = []
        for j in range(5):
            value = all_values[i*5+j].contents[0].contents[0].contents[0]
            if j:
                value = '{:.1f}'.format(float(value))
                #print(value)
            datalist.append(value)
            if not j:
                datalist[j] = datalist[j].contents[0]
                datalist[j] = (datalist[j].replace(' января ', '.01.')
                                        .replace(' февраля ', '.02.')
                                        .replace(' марта ', '.03.')
                                        .replace(' апреля ', '.04.')
                                        .replace(' мая ', '.05.')
                                        .replace(' июня ', '.06.')
                                        .replace(' июля ', '.07.')
                                        .replace(' августа ', '.08.')
                                        .replace(' сентября ', '.09.')
                                        .replace(' октября ', '.10.')
                                        .replace(' ноября ', '.11.')
                                        .replace(' декабря ', '.12.'))
                datalist[j] = re.sub(r'\.\d{4}', '', datalist[j])
        datatuple = tuple(datalist)
        info_list.append(datatuple)
    headers = ("date", "min", "avg", "max", "precip")
    list_for_json = []
    for info in info_list:
        list_for_json.append(dict(zip(headers, info)))    
    return list_for_json


def get_from_pogoda_i_klimat(month=11, year=2018):
    response = urllib.request.urlopen(f'http://pogodaiklimat.ru/monitor.php?id=26063&month={month}&year={year}')
    html = response.read()
    #print(html)
    parsed_html = BeautifulSoup(html, features="html.parser")
    info_list = []
    all_values = parsed_html.body.find_all('td', attrs={'blue1', 'green', 'red1', 'blue3'})
    #print(len(all_values))
    for i in range((len(all_values))//5):
        datalist = []
        if month < 10:
            datalist.append(f'{i+1}.0{month}')
        else:
            datalist.append(f'{i+1}.{month}')
        for j in range(5):
            
            if j != 3:
                #print(3+i*5+j)
                if all_values[3+i*5+j].contents != []:
                    datalist.append(all_values[3+i*5+j].contents[0])
                else:
                    datalist.append('')
        datatuple = tuple(datalist)
        info_list.append(datatuple)
    headers = ("date", "min", "avg", "max", "precip")
    list_for_json = []
    for info in info_list:
        list_for_json.append(dict(zip(headers, info)))    
    return list_for_json


def parse_archive(first_year=1881, last_year=date.today().year + 1):
    headers = ("date", "min", "avg", "max", "precip")
    month_headers = [str(i) for i in range(1, 13)]
    year_headers = [str(i) for i in range(first_year, last_year)]
    whole_json_data = []
    for i in range(first_year, last_year):
        list_of_data_by_months = []
        for j in range(1, 13):
            if i == 1882 or (i == 1883 and j in range(1, 9)) or i in range(1996, 2001):
                templist = []
                templist.append(dict(zip(headers, ['','','','',''])))
                list_of_data_by_months.append(templist)
            elif i <= 1995:
                list_of_data_by_months.append(get_from_thermo_karelia(j, i))
            else:
                list_of_data_by_months.append(get_from_pogoda_i_klimat(j, i))
        #print(month_headers[0])
        whole_json_data.append(dict(zip(month_headers, list_of_data_by_months)))
        print(i)
    whole_json_data = dict(zip(year_headers, whole_json_data))
    with open('./backend/json/weather_archive.json', 'w+') as archive_file:
        json.dump(whole_json_data, archive_file, indent=4)
    return


def update_archive(month=date.today().month, year=date.today().year):
    with open('./backend/json/weather_archive.json', 'r+') as jsonfile:
        dictdata = json.load(jsonfile)
    
    lastyearparsed = int(list(dictdata)[-1])
    lastmonthparsed = int(list(dictdata[str(lastyearparsed)])[-1])
    #print(lastyearparsed)
    #print(lastmonthparsed)
    if date.today().year > lastyearparsed:
        
        for i in range(lastyearparsed, date.today().year + 1):
            if i == lastyearparsed:
                for j in range(lastmonthparsed, 13):
                    dictdata[str(i)][str(j)] = get_from_pogoda_i_klimat(j, i)
            elif i < date.today().year:
                dictdata[str(i)] = {}
                for j in range(1, 13):
                    dictdata[str(i)][str(j)] = get_from_pogoda_i_klimat(j, i)
            else:
                dictdata[str(i)] = {}
                for j in range(1, date.today().month + 1):
                    dictdata[str(i)][str(j)] = get_from_pogoda_i_klimat(j, i)
        with open('./backend/json/weather_archive.json', 'w+') as archive_file:
            json.dump(dictdata, archive_file, indent=4)
    elif date.today().month > lastmonthparsed and date.today().day > 1:
        for j in range(lastmonthparsed, date.today().month + 1):
            dictdata[str(lastyearparsed)][j] = get_from_pogoda_i_klimat(j, lastyearparsed) 
        with open('./backend/json/weather_archive.json', 'w+') as archive_file:
            json.dump(dictdata, archive_file, indent=4)
    elif month == date.today().month and year == date.today().year:
        dictdata[str(lastyearparsed)][str(lastmonthparsed)] = get_from_pogoda_i_klimat(lastmonthparsed, lastyearparsed)
    return dictdata

def parse_averages():
    avg_full_data = []
    month_headers = [str(i) for i in range(1, 13)]
    for month in range(1, 13):
        response = urllib.request.urlopen(f'http://pogodaiklimat.ru/monitor.php?id=26063&month={month}&year=2016')
        html = response.read()
        #print(html)
        parsed_html = BeautifulSoup(html, features="html.parser")
        avg_daily_list = []
        all_values = parsed_html.body.find_all('td', attrs={'blue1', 'green', 'red1'})
        #print(deltas)
        
    #print(len(all_values))
        #print(len(all_values))
        for i in range((len(all_values))//4):
            delta = all_values[3+i*4+3].contents[0]
            avg_daily = float(all_values[1+i*4+3].contents[0])
            if '+' in delta:
                avg_daily -= float(delta.replace('+', ''))
            else:
                avg_daily -= float(delta)
            avg_daily_list.append('{:.1f}'.format(avg_daily))
        #print(deltas_list)
        #print(avg_daily_list)
        avg_full_data.append(avg_daily_list)
    avg_full_data = dict(zip(month_headers, avg_full_data))
    with open('./backend/json/averages.json', 'w+') as archive_file:
        json.dump(avg_full_data, archive_file, indent=4)
    return
    '''
    headers = ("date", "min", "avg", "max", "precip")
    list_for_json = []
    for info in info_list:
        list_for_json.append(dict(zip(headers, info)))    
    return list_for_json
    '''

def manual_get_extrema():
    month_headers = [str(i) for i in range(1, 13)]
    inner_headers = ["most_warm", "most_warm_year", "most_cold", "most_cold_year", "most_dry", "most_dry_year", "most_wet", "most_wet_year"]
    month_data = []
    month_data.append(["-0.3", "1925", "-21.4", "1814", "2", "1838", "82", "2011"])
    month_data.append(["1.7", "1990", "-19.5", "1799", "3", "1886", "92", "1990"])
    month_data.append(["3.6", "2007", "-11.6", "1942", "1", "1923", "90", "1763"])
    month_data.append(["8.4", "1921", "-2.6", "1810", "2", "1850", "99", "1764"])
    month_data.append(["16.2", "1897", "4.2", "1876", "2", "1978", "127", "2003"])
    month_data.append(["20.5", "1999", "11.1", "1810", "8", "1889", "199", "1742"])
    month_data.append(["24.4", "2010", "14.1", "1832", "5", "1919", "166", "1979"])
    month_data.append(["19.8", "1939", "12.6", "1835", "1", "1955", "197", "1869"])
    month_data.append(["14.9", "1938", "7.1", "1894", "2", "1851", "190", "1767"])
    month_data.append(["9.3", "1775", "-0.5", "1880", "5", "1987", "150", "1984"])
    month_data.append(["4.4", "2013", "-10.0", "1774", "2", "1993", "118", "2010"])
    month_data.append(["3.0", "2006", "-18.4", "1788", "4", "1852", "112", "1981"])
    for i in range(12):
        month_data[i] = dict(zip(inner_headers, month_data[i]))
    month_data = dict(zip(month_headers, month_data))
    with open('./backend/json/extrema.json', 'w+') as archive_file:
        json.dump(month_data, archive_file, indent=4)
    return

def get_extrema_by_month(month):
    with open('./backend/json/extrema.json', 'r+') as jsonfile:
        dictdata = json.load(jsonfile)
    return dictdata[str(month)]


def get_averages_by_month(month):
    with open('./backend/json/averages.json', 'r+') as jsonfile:
        dictdata = json.load(jsonfile)
    return dictdata[str(month)]

def get_current_weather():
    response = urllib.request.urlopen('https://www.gismeteo.ru/weather-sankt-peterburg-4079/now')
    html = response.read()
    #print(html)
    parsed_html = BeautifulSoup(html, features="html.parser")
    all_values = parsed_html.body.find_all('span', "nowvalue__text_l")
    #print(all_values)
    currtemp = all_values[0].contents[0].contents[0] + all_values[0].contents[1]
    if len(all_values[0].contents) > 2:
        currtemp += all_values[0].contents[2].contents[0]
    currtemp = currtemp.replace(',', '.').replace('−', '-')
    return currtemp
#parse_archive()
#parse_averages()
#print(get_averages_from_month(3))
#get_from_thermo_karelia(5, 1925)
#manual_get_extrema()
#print(get_current_weather())


#print(list_for_json)
class ThingsResource(object):
    def on_get(self, req, resp):
        """Handles GET requests"""
        #resp.status = falcon.HTTP_200  # This is the default status
        resp.body = ('\nTwo things awe me most, the starry sky '
                        'above me and the moral law within me.\n'
                        '\n'
                        '    ~ Immanuel Kant\n\n')

class WeatherArchive(object):
    def on_get(self, req, resp, month=date.today().month, year=date.today().year):
        dictdata = update_archive(month, year)
        #print(get_averages_from_month(month))
        for i in range(len(dictdata[str(year)][str(month)])):
            if dictdata[str(year)][str(month)][i]['avg'] != '':
                delta = float(dictdata[str(year)][str(month)][i]['avg']) - float(get_averages_by_month(month)[i])
                dictdata[str(year)][str(month)][i]['delta'] = '{:.1f}'.format(delta)
                if delta > 0:
                    dictdata[str(year)][str(month)][i]['delta'] = '+' + dictdata[str(year)][str(month)][i]['delta']
            
        result = dictdata[str(year)][str(month)]
        #print(result)
        resp.body = json.dumps(result)

class WeatherArchiveByDay(object):
    def on_get(self, req, resp, day=date.today().day, month=date.today().month, year=date.today().year):
        if int(month) == date.today().month and int(year) == date.today().year:
            dictdata = update_archive(int(month), int(year))
        else:
            dictdata = update_archive(month, year)
        if len(dictdata[year][month]) > 1:
            result = dictdata[year][month][int(day)-1]
        else:
            result = dictdata[year][month][0]
        #print(dictdata[year][month])
        resp.body = json.dumps(result)

class ParseArchive(object):
    def on_get(self, req, resp):
        parse_archive()
        resp.body = 'done'


class AveragesArchive(object):
    def on_get(self, req, resp, month=date.today().month):
        dictdata = get_averages_by_month(month)
        resp.body = json.dumps(dictdata)

class PrecipitationArchive(object):
     def on_get(self, req, resp):
        dictdata = ["44", "33", "37", "31", "46", "71", "79", "83", "64", "68", "55", "51"]
        resp.body = json.dumps(dictdata)

class ExtremaArchive(object):
    def on_get(self, req, resp, month=date.today().month):
        dictdata = get_extrema_by_month(month)
        resp.body = json.dumps(dictdata)

class CurrentWeather(object):
    def on_get(self, req, resp):
        result = get_current_weather()
        resp.body = result

class ThisDayArchive(object):
    def on_get(self, req, resp, day=date.today().day, month=date.today().month, year=date.today().year):
        datalist = []
        current_record = update_archive(month, year-1)
        if day != 29 and month != 2:
            if len(current_record[str(year-1)][str(month)]) > 1:
                datalist.append(current_record[str(year-1)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-1)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-5)][str(month)]) > 1:
                datalist.append(current_record[str(year-5)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-5)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-10)][str(month)]) > 1:
                datalist.append(current_record[str(year-10)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-10)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-50)][str(month)]) > 1:
                datalist.append(current_record[str(year-50)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-50)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-100)][str(month)]) > 1:
                datalist.append(current_record[str(year-100)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-100)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
        else:
            if len(current_record[str(year-4)][str(month)]) > 1:
                datalist.append(current_record[str(year-4)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-4)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-8)][str(month)]) > 1:
                datalist.append(current_record[str(year-8)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-8)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-20)][str(month)]) > 1:
                datalist.append(current_record[str(year-20)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-20)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-40)][str(month)]) > 1:
                datalist.append(current_record[str(year-40)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-40)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
            if len(current_record[str(year-100)][str(month)]) > 1:
                datalist.append(current_record[str(year-100)][str(month)][day-1]['min'])
                datalist.append(current_record[str(year-100)][str(month)][day-1]['max'])
            else:
                datalist.append('')
                datalist.append('')
        headers = ["min_1", "max_1", "min_2", "max_2", "min_3", "max_3", "min_4", "max_4", "min_5", "max_5"]
        datalist = dict(zip(headers, datalist))
        resp.body = json.dumps(datalist)
        

# falcon.API instances are callable WSGI apps
app = falcon.API()

# Resources are represented by long-lived class instances
things = ThingsResource()


# things will handle all requests to the '/things' URL path
app.add_route('/things', things)
app.add_route('/api/month={month}&year={year}', WeatherArchive())
app.add_route('/api/day={day}&month={month}&year={year}', WeatherArchiveByDay())
app.add_route('/api/averages/month={month}', AveragesArchive())
app.add_route('/api/extrema/month={month}', ExtremaArchive())
app.add_route('/api/current', WeatherArchive())
app.add_route('/api/parse', ParseArchive())
app.add_route('/api/precip', PrecipitationArchive())
app.add_route('/api/today_weather', CurrentWeather())
app.add_route('/api/this_day_history', ThisDayArchive())
if __name__ == '__main__':
    httpd = simple_server.make_server('localhost', 8000, app)
    httpd.serve_forever()