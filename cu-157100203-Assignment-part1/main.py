#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import webapp2
import jinja2
import random
import cgi
import urllib
import urllib2
import json
from google.appengine.ext import ndb
from google.appengine.api import users

back_link = '<br><br><a href="/" style="color:blue">Back</a>'

class MainPage(webapp2.RequestHandler):
	def get(self):
		page = []
		page.append(dict(link='/random10', text='Random 10'))
		page.append(dict(link='/userservices', text='Users Services'))
		page.append(dict(link='/guessnum', text='Guess Number'))
		page.append(dict(link='/guestmain', text='Guest Book'))
		page.append(dict(link='/geolocation', text='Geo Location'))

		self.response.write('<title>RAD Assignment Part One</title>')
		self.response.write('<div style="text-align:center">')
		self.response.write('<h2>RAD Assignment Part one</h2>')
		self.response.write('<b>Menu</b><br>')
		for i in range(len(page)):
			self.response.write('<a href="'+ page[i]['link'] +'" style="color:blue">'+ page[i]['text'] +'</a><br>')
		self.response.write('</div>')

class Random10(webapp2.RequestHandler):
    def get(self):
    	self.response.write('<title>Random 10</title>')
    	self.response.write('<div style="text-align:center">')
    	self.response.write('<h2>Random 10</h2>')
        self.response.write(random.sample(range(1, 11), 10))
        self.response.write(back_link)
        self.response.write('</div>')

class UserServices(webapp2.RequestHandler):
	def get(self):

		user = users.get_current_user()
		if user:
			url = users.create_logout_url(self.request.path)
			fail = self.request.get('f')
			self.response.write('<form action="/userservices" method="post">')
			self.response.write('<div style="text-align:center">')
			self.response.write('<div>Hi, '+ user.nickname() +'!</div><br>')
			self.response.write('Username: <input type="text" name="username" id="username">')
			if len(fail) > 0:
				self.response.write('<p style="color:red">Please enter your username.</p>')
				self.response.write('<script>document.getElementById("username").focus();</script>')
			else:
				self.response.write('<br><br>')
			self.response.write('<input type="submit" value="Submit"><br><br>')
			self.response.write('<a href="'+ url +'" style="color:blue">Log out</a>&nbsp;&nbsp;')
			self.response.write('<a href="/" style="color:blue">Back</a>')
			self.response.write('</div>')
			self.response.write('</form>')
		else:
			uri = users.create_login_url(self.request.uri)
			self.redirect(uri)

	def post(self):
		self.response.write('<title>Users Services</title>')
		username = self.request.get('username')
		if len(username) > 0:
			self.response.write('<div style="text-align:center">')
			self.response.write('<h2>Welcome, ' + username +'!</h2>')
			self.response.write('<a href="/userservices" style="color:blue">Back</a>')
			self.response.write('</div>')
		else:
			self.redirect('/userservices?f=f')

jinja_environment = jinja2.Environment(
	loader = jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
	extensions = ['jinja2.ext.autoescape']
)

def generateRandomNumber():
	rand_num = random.randint(1, 100)
	return rand_num

rand_num = None
minimum = None
maximum = None

class GuessNumber(webapp2.RequestHandler):
	def get(self):
		global rand_num, minimum, maximum
		rand_num = generateRandomNumber()
		minimum = 1
		maximum = 100
		values = {
			'random_num' : rand_num,
			'tips' : '',
			'minimum' : minimum,
			'maximum' : maximum
		}
		template = jinja_environment.get_template('guess_number.html')
		self.response.out.write(template.render(values))

	def post(self):
		global rand_num, minimum, maximum
		win = None
		try:
			guess = int(self.request.get('guess'))
			if guess > 0 and guess <= 100:
				if guess == rand_num:
					win = True
					tips = 'Bingo! Please click <a href="/guessnum">here</a> to reset the game.'
				elif guess > rand_num:
					maximum = guess - 1
					tips = 'Your number is greater.'
				elif guess < rand_num:
					minimum = guess + 1
					tips = 'Your number is less.'
			else:
				tips = 'Please enter a valid number!'
		except ValueError:
			tips = 'Please enter a number!'

		if rand_num is None:
			tips = 'Please click <a href="/guessnum">reset</a> to reset the game.'

		values = {
			'random_num' : rand_num,
			'tips' : tips,
			'minimum' : minimum,
			'maximum' : maximum,
			'win' : win
		}
		template = jinja_environment.get_template('guess_number.html')
		self.response.out.write(template.render(values))

guestbook_template = """\
			<form action="/guestbook?%s" method="post">
				<div><textarea name="content" rows="3" cols="60"></textarea></div>
				<br>
				<div><input type="submit" value="Sign Guestbook"></div>
			</form>
			<hr>
			<br>
			<form>Guestbook name:
				<input value="%s" name="guestbook_name">
				<input type="submit" value="Switch">
			</form>
			<a href="/" style="color:blue">Back</a>
		</div>
	</body>
</html>
"""
default_guestbook = 'default_guestbook'

def guestbook_key(guestbook_name = default_guestbook):
	return ndb.Key('Guestbook', guestbook_name)

class GuestBookMainPage(webapp2.RequestHandler):
	def get(self):
		self.response.write('<html>'+ 
			'<head><title>Guest Book</title></haed>'+
			'<body>')

		if users.get_current_user():
			url = users.create_logout_url(self.request.uri)
			url_linktext = 'Logout'
			name = users.get_current_user().nickname()
		else:
			url = users.create_login_url(self.request.uri)
			url_linktext = 'Login'
			name = 'Ananonymous'
		self.response.write('<div>Hello, %s!&nbsp;&nbsp;&nbsp;<a href="%s" style="color:blue">%s</a>&nbsp;&nbsp;&nbsp;<a href="/geolocation" style="color:blue">Your Location</a></div>' % (name, url, url_linktext))

		self.response.write('<div style="text-align:center">')
		guestbook_name = self.request.get('guestbook_name', default_guestbook)
		self.response.write('<h2>'+ guestbook_name +'</h2>')
		greetings_query = Greeting.query(ancestor = guestbook_key(guestbook_name)).order(-Greeting.date)
		greetings = greetings_query.fetch(10)

		for greeting in greetings:
			if greeting.author:
				self.response.write('<b>'+ greeting.author.nickname() +'</b> wrote at '+ greeting.date.strftime("%Y-%m-%d %H:%M:%S") +':')
			else:
				self.response.write('Ananonymous person wrote at '+ greeting.date.strftime("%Y-%m-%d %H:%M:%S") +':')
			self.response.write('<blockquote>%s</blockquote>' % cgi.escape(greeting.content))

		sign_query_params = urllib.urlencode({ 'guestbook_name' : guestbook_name })
		self.response.write(guestbook_template % (sign_query_params, cgi.escape(guestbook_name)))

class Guestbook(webapp2.RequestHandler):
    def post(self):
    	guestbook_name = self.request.get('guestbook_name', default_guestbook)
    	greeting = Greeting(parent = guestbook_key(guestbook_name))

    	if users.get_current_user():
    		greeting.author = users.get_current_user()

    	greeting.content = self.request.get('content')
    	greeting.put()

    	query_params = { 'guestbook_name' : guestbook_name }
    	self.redirect('/guestmain?' + urllib.urlencode(query_params))

class Greeting(ndb.Model):
	author = ndb.UserProperty()
	content = ndb.StringProperty(indexed = False)
	date = ndb.DateTimeProperty(auto_now_add = True)

class GeoLocation(webapp2.RequestHandler):
	def get(self):
		error = ''
		try:
			url = 'http://api.hostip.info/get_json.php'
			info = json.loads(urllib2.urlopen(url).read().decode('utf-8'))
			ip = info['ip']

			geourl = "http://www.geoplugin.net/json.gp?ip="
			location = geourl + ip
			content = json.loads(urllib2.urlopen(location).read().decode('utf-8'))
			lat = content['geoplugin_latitude']
			lng = content['geoplugin_longitude']

			GMAPS_URL = "http://maps.googleapis.com/maps/api/streetview?size=600x600&heading=235&sensor=false&"
			img = GMAPS_URL + ''.join('location=%s,%s' % (lat, lng))
		except urllib2.URLError:
			error = 'Some error may occured.'

		self.response.write('<title>Geo Location</title>')
		self.response.write('<div style="text-align:center">')
		self.response.write('<h2>My Location</h2>')
		self.response.write('<img src="%s"></img><br><br>' % img)
		self.response.write('<iframe width="600" height="600" frameborder="0" style="border:0"'+
			'src="https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBa6LYjyDAvK1okvTKUOa08aFTEggATFU0&location=%s,%s&heading=210&pitch=10&fov=35" allowfullscreen></iframe>' % (lat, lng))
		self.response.write('<br><br><a href="/" style="color:blue">Back</a>')
		self.response.write('</div>')


app = webapp2.WSGIApplication([
	('/', MainPage),
	('/random10', Random10),
	('/userservices', UserServices),
	('/guessnum', GuessNumber),
	('/guestmain', GuestBookMainPage),
	('/guestbook', Guestbook),
	('/geolocation', GeoLocation)
], debug=True)
































