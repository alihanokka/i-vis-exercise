# An exercise on Cytoscape 

The main idea of this exercise is to gain experience on [Cytoscape](http://js.cytoscape.org/), [Neo4j](https://neo4j.com/why-graph-databases/) and [Nodejs](https://nodejs.org/en/about/).

The application works on the Neo4j's movie-actor database. The main functionality of the application is that given an actor name and a positive integer as input, this application will render the subgraph that consists of actors that has "actor number" of at most the given integer and movies that cause those actor numbers by accessing to and making required queries on the movie dataset stored in Neo4j. 

The "actor number" of an actor is the number of degrees of separation s/he has from a given actor. For instance if Laz Alonso and 1 is given; the subgraph should be Laz Alonso, movies that he actored in (e.g. Fast & Furious) and the actors that were in these movies (e.g. Gal Gadot, Paul Walker..).  

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

* Neo4j's installation file can be found on their [website](https://nodejs.org/en/). The database however has to be downloaded from [here](https://neo4j.com/developer/example-data/). Note that the database is from an old Neo4j version, and thus the config file has to be tweaked in order for the database to work on newer versions. The process is described in detail in the previous link. 

* Nodejs and NPM Packages can be installed with the following command.

```
$ sudo apt-get install nodejs
$ sudo apt-get install npm
```
The versions that I used are as follows.

```
$ nodejs -v
 v8.10.0
$ npm -v
 3.5.2
```

### Deployment

* Make sure Neo4j is up and running. The database interface at http://localhost:7474/ will require you to enter your credentials (Default is username:neo4j, password: neo4j). When logging in the first time it will force you to change your password. Remember this password as you will need it.
* Extract this application's ZIP and enter your credentials that you defined above into /public/javascripts/neo4jAPI.js. Currently, this is hard-coded.
* On ~/i-vis-exercise/ run

```
$ npm install
$ webpack
$ ./bin/www
```

After that, you can access the interface at http://localhost:3000/. Note that, /bin/www is for starting the server and thus has to be running in order to service the html request call. [Webpack](https://webpack.js.org/) is used to bundle the code with its dependencies and service it to the html request call.

### Issues

* Database credentials are hard-coded.

* Objects on the database has 'Id' properties which are not unique for some reason. Thus, some queries return with wrong objects. 

