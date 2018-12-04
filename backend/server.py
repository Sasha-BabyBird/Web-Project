import falcon
from bs4 import BeautifulSoup
from wsgiref import simple_server  
import urllib
 
'''
# get the contents
response = urllib.request.urlopen('http://thermo.karelia.ru/weather/w_history.php?town=spb&month=1&year=1948')
html = response.read()
#print(html)
parsed_html = BeautifulSoup(html)
#print(parsed_html.body.find(''))
info_list = []
all_values = parsed_html.body.find_all('td', bgcolor={'#FFFFFF'})
for i in range(len(all_values)//5):
    datalist = []
    for j in range(5):
        datalist.append(all_values[i*5+j].contents[0].contents[0].contents[0])
        if not j:
            datalist[j] = datalist[j].contents[0]
    datatuple = tuple(datalist)
    info_list.append(datatuple)
print(info_list)
response = urllib.request.urlopen('http://pogodaiklimat.ru/monitor.php?id=26063&month=11&year=2018')
html = response.read()
#print(html)
parsed_html = BeautifulSoup(html)
all_values = parsed_html.body.find_all('td', attrs={'blue1', 'green', 'red1', 'blue3'})
for value in all_values:
    print(value.contents[0])

'''
class ThingsResource(object):
    def on_get(self, req, resp):
        """Handles GET requests"""
        #resp.status = falcon.HTTP_200  # This is the default status
        resp.body = ('\nTwo things awe me most, the starry sky '
                        'above me and the moral law within me.\n'
                        '\n'
                        '    ~ Immanuel Kant\n\n')

# falcon.API instances are callable WSGI apps
app = falcon.API()

# Resources are represented by long-lived class instances
things = ThingsResource()

# things will handle all requests to the '/things' URL path
app.add_route('/things', things)
if __name__ == '__main__':
    httpd = simple_server.make_server('localhost', 8000, app)
    httpd.serve_forever()