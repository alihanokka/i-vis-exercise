let neo4j = require('neo4j-driver');

let username = "USER_NAME";
let password = "PASSWORD";

//Connection to Neo4j database
const driver = neo4j.v1.driver("bolt://localhost:7687", neo4j.v1.auth.basic('username', 'password'));
const session = driver.session();

// Method perform all queries to the database, HOWEVER it returns a promise!!
module.exports = function (query, parameter) {
    return new Promise(function (resolve, reject) {
        let collection = [];

        session
            .run(query, parameter)
            .subscribe({
                onNext: function (record) {
                    collection.push(record.get(0).properties);
                },
                onCompleted: function () {
                    resolve(collection);
                },
                onError: function (error) {
                    window.alert("Query returned with error");
                    console.log(error);
                    reject(true);
                }
            });
    });
};