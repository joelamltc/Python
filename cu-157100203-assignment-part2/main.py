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
youtube_search_query = None
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
        youtube_search_query = urllib2.quote(self.request.get('query'))
        youtube_search_api_url = 'https://www.googleapis.com/youtube/v3/search?key=%s&part=%s&q=%s&type=%s&order=%s&maxResults=%s' % ( youtube_api_key, youtube_search_part, youtube_search_query, youtube_search_type, youtube_search_order, youtube_search_maxResult )
        msg_error = ''
        try:
            youtube_search_content = urllib2.urlopen(youtube_search_api_url.encode('utf-8')).read()
            youtube_search_result = json.loads(youtube_search_content)
            youtube_next_page_token = youtube_search_result['nextPageToken']
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

app = webapp2.WSGIApplication([
    ('/', MainHandler)
], debug=True)
