from mxklabs import dimacs
import json
from sys import platform as _platform
from subprocess import call


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
        # delete the variable itself from the set
        vars_associated = [v for v in vars_associated_flat if v not in range(variable + 1)]
        relations[variable] = vars_associated
    relations[problem.num_vars] = []
    problem.interaction_variables = relations

    cardinality = {}
    for variable, items in problem.interaction_variables.iteritems():
        cardinality[variable] = len(items)
        counter = 0
        for v, i in problem.interaction_variables.iteritems():
            if v != variable and variable in i:
                counter += 1
        cardinality[variable] += counter
    problem.interaction_variables_cardinality = cardinality

    interaction_graph = dict(nodes=[], links=[])
    for v, i in problem.interaction_variables.iteritems():
        node = dict(id=str(v), group=1)
        interaction_graph['nodes'].append(node)
        links = [dict(source=str(v), target=str(item), weight=1) for item in i]
        interaction_graph['links'].extend(links)

    if problem.satelited:
        graph_file_path = 'static/interaction_graph_satelited.json'
    else:
        graph_file_path = 'static/interaction_graph.json'

    with open(graph_file_path, 'w') as outfile:
        json.dump(interaction_graph, outfile)


def satelite_it(dimacs_file_path):
    if _platform == "linux" or _platform == "linux2":
        satelite_path = 'bin/SatELite_v1.0_linux'
    elif _platform == "darwin":
        satelite_path = 'bin/SatELite_v1.macOS'

    flags = '+pre'
    call([satelite_path, dimacs_file_path, flags])
    call(['mv', 'pre-satelited.cnf', 'bin'])
