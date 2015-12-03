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
import cgi
import json
import jinja2
import webapp2
import urllib2

youtube_api_key = 'AIzaSyB1r0jX4KJj7Hw9NdzsEigrxRbv-Obd3Uw'
youtube_search_part = 'snippet'
youtube_search_query = ''
youtube_search_type = 'video'
youtube_search_order = 'viewCount'
youtube_search_maxResult = '10'
youtube_next_page_token = None
youtube_prev_page_token = None
youtube_videos = {}

jinja_environment = jinja2.Environment(
	loader = jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
	extensions = ['jinja2.ext.autoescape']
)

class MainHandler(webapp2.RequestHandler):
    def get(self):
        values = {
            'youtube_videos' : cgi.escape(json.dumps(youtube_videos)),
            'next_page' : youtube_next_page_token,
            'prev_page' : youtube_prev_page_token
        }
        main_html = jinja_environment.get_template('main.html')
        self.response.out.write(main_html.render(values))

    def post(self):
        global youtube_search_query, youtube_next_page_token, youtube_prev_page_token, youtube_videos

        page_token = self.request.get('token')

        if urllib2.quote(self.request.get('query').encode('utf-8')):
            youtube_search_query = urllib2.quote(self.request.get('query').encode('utf-8'))

        if page_token:
            youtube_search_api_url = 'https://www.googleapis.com/youtube/v3/search?key=%s&part=%s&q=%s&type=%s&order=%s&maxResults=%s&pageToken=%s' % ( youtube_api_key, youtube_search_part, youtube_search_query, youtube_search_type, youtube_search_order, youtube_search_maxResult, page_token )
        else:
            youtube_search_api_url = 'https://www.googleapis.com/youtube/v3/search?key=%s&part=%s&q=%s&type=%s&order=%s&maxResults=%s' % ( youtube_api_key, youtube_search_part, youtube_search_query, youtube_search_type, youtube_search_order, youtube_search_maxResult )
        
        msg_error = ''
        try:
            youtube_search_content = urllib2.urlopen(youtube_search_api_url.encode('utf-8')).read()
            youtube_search_result = json.loads(youtube_search_content)

            if 'nextPageToken' in youtube_search_result:
                youtube_next_page_token = youtube_search_result['nextPageToken']
            if 'prevPageToken' in youtube_search_result:
                youtube_prev_page_token = youtube_search_result['prevPageToken']

            youtube_video_list = youtube_search_result['items']
            for x in range(len(youtube_video_list)):
                youtube_video_id = youtube_video_list[x]['id']['videoId']
                youtube_video_detail = youtube_video_list[x]['snippet']
                youtube_video_title = youtube_video_detail['title']
                youtube_video_thumbnails = youtube_video_detail['thumbnails']['high']['url']
                youtube_videos_json = {}
                youtube_videos_json['id'] = youtube_video_id
                youtube_videos_json['title'] = youtube_video_title
                youtube_videos_json['thumbnails'] = youtube_video_thumbnails
                youtube_videos[x] = youtube_videos_json

            values = {
                'youtube_videos' : cgi.escape(json.dumps(youtube_videos)),
                'next_page' : youtube_next_page_token,
                'prev_page' : youtube_prev_page_token
            }
            main_html = jinja_environment.get_template('main.html')
            self.response.out.write(main_html.render(values))
        except urllib2.URLError, e:
            msg_error = e

        self.response.write(msg_error)

class AjaxHandler(webapp2.RequestHandler):
    def get(self):
        values = {
            'youtube_videos' : cgi.escape(json.dumps(youtube_videos)),
            'next_page' : youtube_next_page_token,
            'prev_page' : youtube_prev_page_token
        }
        main_html = jinja_environment.get_template('main.html')
        self.response.out.write(main_html.render(values))

    def post(self):
        global youtube_search_query, youtube_next_page_token, youtube_prev_page_token, youtube_videos

        page_token = self.request.get('token')

        if urllib2.quote(self.request.get('query')):
            youtube_search_query = urllib2.quote(self.request.get('query'))

        if page_token:
            youtube_search_api_url = 'https://www.googleapis.com/youtube/v3/search?key=%s&part=%s&q=%s&type=%s&order=%s&maxResults=%s&pageToken=%s' % ( youtube_api_key, youtube_search_part, youtube_search_query, youtube_search_type, youtube_search_order, youtube_search_maxResult, page_token )
        else:
            youtube_search_api_url = 'https://www.googleapis.com/youtube/v3/search?key=%s&part=%s&q=%s&type=%s&order=%s&maxResults=%s' % ( youtube_api_key, youtube_search_part, youtube_search_query, youtube_search_type, youtube_search_order, youtube_search_maxResult )
        
        msg_error = ''
        try:
            youtube_search_content = urllib2.urlopen(youtube_search_api_url.encode('utf-8')).read()
            youtube_search_result = json.loads(youtube_search_content)

            if 'nextPageToken' in youtube_search_result:
                youtube_next_page_token = youtube_search_result['nextPageToken']
            if 'prevPageToken' in youtube_search_result:
                youtube_prev_page_token = youtube_search_result['prevPageToken']

            youtube_video_list = youtube_search_result['items']
            for x in range(len(youtube_video_list)):
                youtube_video_id = youtube_video_list[x]['id']['videoId']
                youtube_video_detail = youtube_video_list[x]['snippet']
                youtube_video_title = youtube_video_detail['title']
                youtube_video_thumbnails = youtube_video_detail['thumbnails']['high']['url']
                youtube_videos_json = {}
                youtube_videos_json['id'] = youtube_video_id
                youtube_videos_json['title'] = youtube_video_title
                youtube_videos_json['thumbnails'] = youtube_video_thumbnails
                youtube_videos[x] = youtube_videos_json

            youtube_videos['next_page'] = youtube_next_page_token
            youtube_videos['prev_page'] = youtube_prev_page_token

            # main_html = jinja_environment.get_template('main.html')
            self.response.out.write(cgi.escape(json.dumps(youtube_videos)))
        except urllib2.URLError, e:
            msg_error = e

        self.response.write(msg_error)

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/ajax', AjaxHandler)
], debug=True)
