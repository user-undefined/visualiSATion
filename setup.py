#!/usr/bin/env python

from setuptools import setup, find_packages

setup(
    name='VisualiSATion',
    version='0.1',
    description='SAT graph representation',
    author='Kanstatsin Nerushkin, Marcin Kasprowocz',
    url="https://github.com/knerushkin/visualiSATion",
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),
    install_requires=['flask', 'mxklabs', 'pycosat'],
)
