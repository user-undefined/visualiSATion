from __future__ import print_function
from flask import Flask, render_template
import os
import socket
import json
from utils import problem

app = Flask(__name__)


@app.route("/")
def hello():
    html = "<h3>Hello {name}!</h3>" \
           "<b>Hostname:</b> {hostname}<br/>"
    return html.format(name=os.getenv('NAME', "world"), hostname=socket.gethostname())


@app.route("/sat/data")
def data():
    return json.dumps(problem.read("dubois20.cnf"))


@app.route("/load", methods=['GET', 'POST'])
def load():
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''


@app.route("/interaction")
def interactions():
    return render_template('interaction.html')

if __name__ == "__main__":
    cnf = problem.Problem("dubois20.cnf")
    problem.generate_interaction_graph(cnf)
    app.run(host='0.0.0.0', debug=True)

