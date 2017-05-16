from mxklabs import dimacs


def read(filename):
    cnf_problem = dimacs.read(filename)
    return cnf_problem.__dict__

if __name__ == "__main__":
    print(read("../dubois20.cnf"));