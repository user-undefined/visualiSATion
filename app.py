from __future__ import print_function
from flask import Flask, render_template
import os
import socket
import json
from utils import problem
from subprocess import call

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
    cnf = problem.Problem(dimacs_file_path)
    problem.generate_interaction_graph(cnf)
    return render_template('interaction.html',
                            cnf=cnf,
                            graph_json='interaction_graph.json')


@app.route("/interaction/satelited")
def interactions_satelited():
    problem.satelite_it(dimacs_file_path)
    cnf_satelited = problem.Problem('bin/pre-satelited.cnf')
    problem.generate_interaction_graph(cnf_satelited)
    return render_template('interaction.html',
                            cnf=cnf_satelited,
                            graph_json='interaction_graph_satelited.json')


if __name__ == "__main__":
    dimacs_file_path = 'bin/dubois20.cnf'
    app.run()

