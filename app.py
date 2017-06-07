#!/usr/bin/env python

from __future__ import print_function

from flask import Flask, render_template, request, redirect, url_for
import os
import json
import re

from flask import send_from_directory

from utils import problem
import pycosat
from utils.problem import sign

app = Flask(__name__)

APP_ROOT_FOLDER = os.path.dirname(__file__)
TEMPLATE_FOLDER = os.path.join(APP_ROOT_FOLDER, 'templates')
STATIC_FOLDER = os.path.join(APP_ROOT_FOLDER, 'static')
DATA_FOLDER = os.path.join(STATIC_FOLDER, 'data')
RAW_FOLDER = os.path.join(DATA_FOLDER, 'raw')
SATELITED_FOLDER = os.path.join(DATA_FOLDER, 'satelited')
BIN_FOLDER = os.path.join(APP_ROOT_FOLDER, 'bin')
ALLOWED_EXTENSIONS = set(['cnf', 'dimacs'])

app.config['RAW_FOLDER'] = RAW_FOLDER


@app.route("/")
def hello():
    return "Hello, I love SAT solving!"


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


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def list_data(path):
    l = []
    for folder, subfolder, file in os.walk(path):
        l.extend(file)

    return l


@app.route('/download/<path:filename>', methods=['GET', 'POST'])
def download(filename):
    return send_from_directory(directory=DATA_FOLDER, filename=filename)


@app.route("/visualisation", methods=['GET', 'POST'])
def show():
    selected = request.args.get('file')
    if selected:
        selected_satelited = re.sub(r'.cnf', '_satelited.cnf', selected)
    else:
        selected_satelited = None
    original = json.loads(original_data(selected))
    file_list = list_data(RAW_FOLDER)
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = file.filename
            file.save(os.path.join(app.config['RAW_FOLDER'], filename))
            return redirect(url_for('show'))

    # Put selected file on first place in file_list
    if selected:
        f, s = 0, file_list.index(selected)
        file_list[s], file_list[f] = file_list[f], file_list[s]

    return render_template("visualisation.html",
                           file_list=file_list,
                           selected=selected,
                           selected_satelited=selected_satelited,
                           original=original)


@app.route("/sat/solve/<file>")
def solve(file):
    file_path = os.path.join(RAW_FOLDER, file)
    clauses = problem.read(file_path)["clauses"]
    solution = pycosat.solve(clauses)
    result = []
    if solution != "UNSAT":
        for value in solution:
            result.append({"id": "L" + str(abs(value)) + "",
                           "value":  sign(value)})
    else:
        result = solution
    return json.dumps(result)


@app.route("/load/data/original/<file>")
def original_data(file):
    problem_metadata = problem.get_metadata(file, satelite=False)
    return json.dumps(problem_metadata)


@app.route("/load/data/satelite/<file>")
def satelited_data(file):
    problem_metadata = problem.get_metadata(file, satelite=True)
    return json.dumps(problem_metadata)


@app.route("/visual/repr/factor/<file>")
def graph(file):
    graph_data = problem.prepare_graph_data(file, graph_type="factor", satelite=False)
    return json.dumps(graph_data)


@app.route("/visual/repr/factor/satelited/<file>")
def graph_satelited(file):
    graph_data = problem.prepare_graph_data(file, graph_type="factor", satelite=True)
    return json.dumps(graph_data)


@app.route("/visual/repr/interaction/<file>")
def graph_interaction(file):
    graph_data = problem.prepare_graph_data(file, graph_type="interaction", satelite=False)
    return json.dumps(graph_data)


@app.route("/visual/repr/interaction/satelited/<file>")
def graph_interaction_satelited(file):
    graph_data = problem.prepare_graph_data(file, graph_type="interaction", satelite=True)
    return json.dumps(graph_data)


if __name__ == "__main__":
    app.run(host='0.0.0.0')
