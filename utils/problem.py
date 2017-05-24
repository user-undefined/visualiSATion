#!/usr/bin/env python

from mxklabs import dimacs
import json
from sys import platform as _platform
from subprocess import call
import os.path

class Problem(object):
    interaction_variables = {}
    interaction_variables_cardinality = {}
    satelited = False

    def __init__(self, filename):
        cnf_problem = dimacs.read(filename)
        if 'satelited' in filename:
            self.satelited = True
        self.clauses = cnf_problem.clauses
        self.num_vars = cnf_problem.num_vars
        self.num_clauses = cnf_problem.num_clauses


def read(filename):
    cnf_problem = dimacs.read(filename)
    return cnf_problem.__dict__
 

def generate_interaction_graph(problem):
    clauses_only_positive_literals = []
    for clause in problem.clauses:
        c = [abs(v) for v in clause]
        clauses_only_positive_literals.append(c)

    relations = {}
    for variable in range(1, problem.num_vars):
        vars_associated_dirty = [v for c in clauses_only_positive_literals if variable in c for v in c]
        vars_associated_flat = list(set(vars_associated_dirty))
        vars_associated = [v for v in vars_associated_flat if v not in range(variable + 1)]
        relations[variable] = vars_associated
    relations[problem.num_vars] = []
    problem.interaction_variables = relations

    interaction_graph = dict(nodes=[], links=[])
    for v, i in problem.interaction_variables.iteritems():
        node = dict(id=str(v), group=1)
        interaction_graph["nodes"].append(node)
        links = [dict(source=str(v), target=str(item), weight=1) for item in i]
        interaction_graph["links"].extend(links)

    interaction_graph["num_vars"] = problem.num_vars
    interaction_graph["num_clauses"] = problem.num_clauses

    return interaction_graph

def satelite_it(dimacs_file_path):
    satelite_path = ''

    if _platform == "linux" or _platform == "linux2":
        satelite_path = 'bin/SatELite_v1.0_linux'

    elif _platform == "darwin":
        satelite_path = 'bin/SatELite_v1.0_macOS'

    flags = '+pre'
    call([satelite_path, dimacs_file_path, flags])
    call(['mv', 'pre-satelited.cnf', 'bin/'])
    return 'bin/pre-satelited.cnf'


# author: knerushkin@gmail.com
def transform(data):
    result = {}
    result.update({"nodes": nodes(data["clauses"], data["num_clauses"], data["num_vars"])})
    result.update({"links": links(data["clauses"])})
    result.update({"num_vars": data["num_vars"]})
    result.update({"num_clauses": data["num_clauses"]})
    return result


def sign(x):
    return 'positive' if x > 0 else 'negative'


def link(clause, count):
    result = []
    for literal in clause:
        result.append({"source": "L{l}".format(l=abs(literal)), "target": "C{c}".format(c=count), "value": 1,
                       "direction": sign(literal)})

    return result


def links(clauses):
    links = []
    for count, clause in enumerate(clauses):
        links.append(link(clause,count))

    return [item for sublist in links for item in sublist]


def nodes(clauses, num_clauses, num_literals):
    result = []
    for clause in range(0, num_clauses):
        result.append({"id": "C" + str(clause), "group": "clause"})

    for literal in range(1, num_literals + 1):
        result.append({"id": "L" + str(abs(literal)) + "",
                       "group":  "literal"})
    return result

def prepare_graph_data(file, graph_type, satelite):
    if satelite:
        cnf_file_path = satelite_it(''.join(["static/data/", file]))
    else:
        cnf_file_path = ''.join(["static/data/", file])

    if graph_type == "factor":
        cnf = read(cnf_file_path)
        graph_data = transform(cnf)
    elif graph_type == "interaction":
        cnf = Problem(cnf_file_path)
        graph_data = generate_interaction_graph(cnf)

    
    return graph_data
    

if __name__ == "__main__":
    data = read("../bin/dubois20.cnf")