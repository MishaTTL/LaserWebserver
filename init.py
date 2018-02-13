#!/usr/bin/env python

"""
	Startup and top-level routing
"""

import socket
from flask import Flask
import subprocess
import atexit

SIMULATION = True
TCP_IP = '127.0.0.1'
TCP_PORT = 5005
BUFFER_SIZE = 1024

if not SIMULATION:
	p = subprocess.run('linuxcnc -v /path/to/config.ini', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
	#do sum stuff to wait for linuxcnc to start
	print(p.stdout)

	#connect to the laser cutter's linuxcncrsh server on localhost
	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	s.connect((TCP_IP, TCP_PORT))

# a wrapper for communicating with linuxcncrsh
# msg is <subcommand> [arg1, arg2, arg3...]
def talkToLaser(comm, msg):
	if SIMULATION:
		return "";
	s.send(comm + ' ' + msg)
	data = s.recv(BUFFER_SIZE)
	return data

app = Flask(__name__)

@app.route('/')
def root():
	return app.send_static_file('public/index.html')

@app.route('/<path:path>')
def sendFiles(path):
	return send_from_directory('public', path)

@app.route('/laser/<command>')
def sendCommand(command):
	if request.method == 'GET':
		return talkToLaser('get', command)
	#POST = SET for the laser
	if request.method == 'POST':
		return talkToLaser('set', command)


def cleanup():
	s.close()

atexit.register(cleanup)
