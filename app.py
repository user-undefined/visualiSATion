from __future__ import print_function

import urllib2

from flask import Flask, render_template, request, redirect, url_for
import os
import socket
import json
from utils import problem
from subprocess import call
import pycosat
from utils.problem import sign

app = Flask(__name__)
UPLOAD_FOLDER = 'static/data'
ALLOWED_EXTENSIONS = set(['cnf'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def hello():
    html = "<h3>Hello {name}!</h3>" \
           "<b>Hostname:</b> {hostname}<br/>"
    return html.format(name=os.getenv('NAME', "world"), hostname=socket.gethostname())


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
    print(dimacs_file_path[2])
    cnf = problem.Problem(dimacs_file_path[2])
    problem.generate_interaction_graph(cnf)
    return render_template('interaction.html',
                            cnf=cnf,
                            graph_json='interaction_graph.json')



@app.route("/interaction/satelited")
def interactions_satelited():
    problem.satelite_it(dimacs_file_path[2])
    cnf_satelited = problem.Problem('bin/pre-satelited.cnf')
    problem.generate_interaction_graph(cnf_satelited)
    return render_template('interaction.html',
                            cnf=cnf_satelited,
                            graph_json='interaction_graph_satelited.json')


@app.route("/sat/data/satelited")
def data_satelited():
    problem.satelite_it(dimacs_file_path)
    return json.dumps(problem.read("bin/dubois20.cnf"))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def list_data(path):
    l = []
    for folder, subfolder, file in os.walk(path):
        print(file)
        l.extend(file)

    return l


@app.route("/visualisation", methods=['GET', 'POST'])
def show():
    selected = request.args.get('file')
    file_list = list_data('static/data')
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('show'))

    return render_template("visualisation.html", file_list=file_list, selected=selected)


@app.route("/sat/solve/<file>")
def solve(file):
    print(file)
    solution = pycosat.solve(problem.read('static/data/' + file)["clauses"])
    result = []
    if solution != "UNSAT":
        for value in solution:
            result.append({"id": "L" + str(abs(value)) + "",
                           "value":  sign(value)})
    else:
        result = solution
    return json.dumps(result)



@app.route("/visual/repr/factor/<file>")
def graph(file):
    return json.dumps(problem.transform(problem.satelite_it("static/data/" + file)))


@app.route("/visual/repr/factor/<file>")
def graph(file):
    return json.dumps(problem.transform(problem.satelite_it("static/data/" + file)))


@app.route("/visual/repr/interaction/<file>")
def graph_interaction(file):
    return json.dumps(problem.generate_interaction_graph(problem.Problem("static/data/" + file)))



@app.route("/visual/repr/interaction/satelited/<file>")
def graph_interaction(file):
    return json.dumps(problem.generate_interaction_graph(problem.satelite_it("static/data/" + file)))



@app.route("/solvers")
def solvers():
    print(urllib2.urlopen("http://baldur.iti.kit.edu/sat-competition-2016/solvers/main/").read())
    # print(graph())
    return '''
        <!doctype html>
        <title>Solvers</title>
        <h1>Solvers</h1>
        '''

@app.route("/visual/repr/satelited")
def graph_satelited():
    problem.satelite_it(dimacs_file_path)
    cnf_satelited = problem.Problem('bin/pre-satelited.cnf')
    return json.dumps(problem.transform(problem.read("bin/dubois20.cnf")))


if __name__ == "__main__":
    dimacs_file_path = ["bin/dubois20.cnf", "bin/aim-100-1_6-no-1.cnf", "bin/par8-1-c.cnf"]
    print(problem.read(dimacs_file_path[1])["clauses"])
    cnf = [[1, -3], [2, 3, -1]]
    print(pycosat.solve(problem.read(dimacs_file_path[1])["clauses"]))

    print(pycosat.solve(problem.read(dimacs_file_path[2])["clauses"]))
    print(pycosat.solve(problem.read(dimacs_file_path[0])["clauses"]))
    print(pycosat.solve(cnf))
    app.run()

