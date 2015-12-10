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
import webapp2
import urllib2
import json
import urllib
import cgi
import jinja2
import os
import logging

JINJA_ENVIRONMENT = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
	extensions=['jinja2.ext.autoescape'])

class MainHandler(webapp2.RequestHandler):
	def get(self):
		template = JINJA_ENVIRONMENT.get_template('main.html')
		self.response.write(template.render())

class SearchArtistHandler(webapp2.RequestHandler):
	def post(self):
		artistName 			= urllib2.quote(self.request.get('artist_name').encode('utf-8'))
		getArtistInfoURL 	= 'http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=%s&api_key=d5adeaee26ea9f9621f4be79ce14950b&format=json' % artistName
		result 				= json.loads(urllib2.urlopen(getArtistInfoURL).read().decode('utf-8'))
		printresult 		= json.dumps( json.loads(urllib2.urlopen(getArtistInfoURL).read().decode('utf-8')), indent=4, separators=(',',': ') )
		
		if 'error' in result:
			self.response.write(result['message'])
		else:
			artistImage 		= result['artist']['image'][2]['#text']
			artistName 			= result['artist']['name']
			artistInfo 			= result['artist']['bio']['content']
			jsonAlbumsDetail	= {}
			albumsArray			= []
			tracksArray			= []

			topAlbumsURL	= 'http://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&artist=%s&api_key=d5adeaee26ea9f9621f4be79ce14950b&format=json' % artistName
			topAlburmsResult= json.loads(urllib2.urlopen(topAlbumsURL).read().decode('utf-8'))
			if not 'error' in topAlburmsResult:
				for album in topAlburmsResult['topalbums']['album']:
					if 'mbid' in album:
						getAlbumInfoURL = 'http://ws.audioscrobbler.com/2.0/?method=album.getInfo&mbid=%s&api_key=d5adeaee26ea9f9621f4be79ce14950b&format=json' % album['mbid']
						albumResult 	= json.loads(urllib2.urlopen(getAlbumInfoURL).read().decode('utf-8'))
						tracksArray		= []

						if 'wiki' in albumResult['album']:
							publishedDate 	= albumResult['album']['wiki']['published']
							summary 		= albumResult['album']['wiki']['content']
						else:
							publishedDate 	= 'unknown'
							summary 		= ''

						for track in albumResult['album']['tracks']['track']:
							queryString 	= '%s %s' % (artistName,track['name'])
							tracksArray.append( { 'name' : track['name'].encode('utf-8'), 'query' : urllib2.quote(queryString.encode('utf-8')) } )
						albumsArray.append( { 'album' : { 'albumName' : album['name'].encode('utf-8'), 'image' : album['image'][2]['#text'], 'tracks' : tracksArray, 'published' : publishedDate.encode('utf-8'), 'summary' : summary.encode('utf-8') } } )
				jsonAlbumsDetail['albums'] = albumsArray

			content 		= json.loads(json.dumps(jsonAlbumsDetail))
			contentArray	= []
			for album in content["albums"]:
				contentArray.append(album)

			template = JINJA_ENVIRONMENT.get_template('artistResult.html')
			template_values = {
				'artistImage'	: artistImage,
				'artistName'	: artistName,
				'artistInfo'	: artistInfo,
				'Albums'		: contentArray
			}
			self.response.write(template.render(template_values))

class SearchTrackHandler(webapp2.RequestHandler):
	def post(self):
		keyWords 			= urllib2.quote(self.request.get('key_words').encode('utf-8'))
		trackSearchURL 		= 'http://ws.audioscrobbler.com/2.0/?method=track.search&track=%s&api_key=d5adeaee26ea9f9621f4be79ce14950b&format=json' % keyWords
		result 				= json.loads(urllib2.urlopen(trackSearchURL).read().decode('utf-8'))

		if not result['results']['trackmatches']['track']:
			template = JINJA_ENVIRONMENT.get_template('noTracksResult.html')
			template_values = {
				'keyWords'	: self.request.get('key_words')
			}
			self.response.write(template.render(template_values))
		else:
			resultsArray	= []
			for queryResult in result['results']['trackmatches']['track']:
				queryString 	= '%s %s' % (queryResult['artist'],queryResult['name'])
				resultsArray.append( { 'track' : queryResult['name'], 'artist' : queryResult['artist'], 'query' : urllib2.quote(queryString.encode('utf-8')), 'artistQuery' : urllib2.quote(queryResult['artist'].encode('utf-8')) } )

			template = JINJA_ENVIRONMENT.get_template('tracksResult.html')
			template_values = {
				'keyWords'	: self.request.get('key_words'),
				'results'	: resultsArray
			}

			self.response.write(template.render(template_values))

youtube_api_key = 'AIzaSyB1r0jX4KJj7Hw9NdzsEigrxRbv-Obd3Uw'
youtube_search_part = 'snippet'
youtube_search_type = 'video'
youtube_search_order = 'relevance'
youtube_search_maxResult = '1'

musixmatch_lyrics_api_key = 'd8a8cc1c7da1505e7552ec6e56e66ee7'
musixmatch_lyrics_format = 'json'

class SearchYoutube(webapp2.RequestHandler):
	def post(self):
		youtube_search_query = self.request.get('query')
		if isinstance(youtube_search_query, unicode):
			youtube_search_query = urllib2.quote(self.request.get('query').encode('utf-8'))
		else:
			youtube_search_query = urllib2.quote(self.request.get('query'))
		youtube_search_api_url = 'https://www.googleapis.com/youtube/v3/search?key=%s&part=%s&q=%s&type=%s&order=%s&maxResults=%s' % ( youtube_api_key, youtube_search_part, youtube_search_query, youtube_search_type, youtube_search_order, youtube_search_maxResult )
		musixmatch_lyrics_api_url = 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?apikey=%s&q_track=%s&format=%s' % (musixmatch_lyrics_api_key, youtube_search_query, musixmatch_lyrics_format)
		msg_error = ''
		try:
			youtube_search_content = urllib2.urlopen(youtube_search_api_url.encode('utf-8')).read()
			youtube_search_result = json.loads(youtube_search_content)
			youtube_video_id = youtube_search_result['items'][0]['id']['videoId']
			youtube_video_thumbnail = youtube_search_result['items'][0]['snippet']['thumbnails']['medium']['url']

			musixmatch_search_content = urllib2.urlopen(musixmatch_lyrics_api_url.encode('utf-8')).read()
			musixmatch_search_result = json.loads(musixmatch_search_content)
			if 'lyrics' in musixmatch_search_result['message']['body']:
				musixmatch_lyrics = musixmatch_search_result['message']['body']['lyrics']['lyrics_body']
			else:
				musixmatch_lyrics = 'No lyrics found.'

			result = '%s<joelamltc>%s<joelamltc>%s' % (youtube_video_id, youtube_video_thumbnail, musixmatch_lyrics)
			self.response.write(result)
		except urllib2.URLError, e:
			msg_error = e
		self.response.write(msg_error)

app = webapp2.WSGIApplication([
	('/', MainHandler),
	('/result', SearchTrackHandler),
	('/artist', SearchArtistHandler),
	('/searchYoutube', SearchYoutube)
], debug=True)
