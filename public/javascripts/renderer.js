let cytoscape = require('cytoscape');
let coseBilkent = require('cytoscape-cose-bilkent');
let runQuery = require('./neo4jAPI.js');
let jquery = require('jquery');
let contextMenus = require('cytoscape-context-menus');
let cyqtip = require('cytoscape-qtip2');

//Register extensions of cytoscape
cytoscape.use( coseBilkent );
contextMenus( cytoscape, jquery );
cyqtip( cytoscape );

//Create an initial cytoscape display and manage the styles
let cyto = window.cyto = cytoscape({
    container: document.getElementById('cy'),
    elements: [
        // nodes
        {
            data: {
                id: '-1',
                name:'Actor'
            },
            classes: 'Actor'
        },
        {
            data: {
                id: '-2',
                title: 'Movie'
            },
            classes: 'Movie'
        },
        // edges
        {
            data: {
                id: '-3',
                source: '-1',
                target: '-2',
                directed: 'false'
            }
        }
    ],
    classes:['Actor', 'Movie'],
    style: [
        {
            selector: '.Actor',
            style: {
                'label': 'data(name)',
                'text-halign': 'center',
                'text-valign': 'center',
                'font-size': '9',
                'background-color': 'rgb(0, 214, 253)'
            }
        },
        {
            selector: '.Movie',
            style:{
                'shape': 'round-rectangle',
                'label': 'data(title)',
                'text-halign': 'center',
                'text-valign': 'center',
                'font-size': '9',
                'background-color': 'rgb(0, 191, 0)'
            }
        }
    ],
    layout:{
        name: 'cose-bilkent',
        fit: true,
        padding:320
    }
});

//Cose Bilkent Options
let CoSE_Options =
    {
        name: 'cose-bilkent',
        nodeDimensionsIncludeLabels: true,
        fit: true,
        numIter: 5000
    };
let CoSE_Options_ContextMenu =
    {
        name: 'cose-bilkent',
        randomize: false,
        nodeDimensionsIncludeLabels: true,
        fit: true,
        numIter: 2500
    };

//Contex Menu Options
let contextMenuOptions =
    { menuItems: [
        {
            id: 'Show movies',
            content: 'Show movies',
            selector: '.Actor',
            onClickFunction: function(event){
                let target = event.target || event.cyTarget;
                if(target.id() >= 0)
                    getNeighbours_ContextMenu( target.id() );
            }
        },
        {
            id: 'Show actors',
            content: 'Show actors',
            selector: '.Movie',
            onClickFunction: function(event){
                let target = event.target || event.cyTarget;
                if(target.id() >= 0)
                    getNeighbours_ContextMenu( target.id() );
            }
        }]
    };

cyto.contextMenus( contextMenuOptions );



async function getNeighbours_ContextMenu(s_id){
    document.getElementById("loader").style.display = "block";
    cyto.startBatch();

    let results = await runQuery("MATCH ({id : {idParam}})-[:ACTS_IN]-(n) return n", {idParam: s_id});
    for(var i in results){
        //Whether node already exists
        if(cyto.nodes("[id = '" + results[i].id +"']").length == 0){
            //Is node actor or movie?
            if(results[i].imdbId) {
                cyto.add(
                    {
                        data: results[i],
                        classes: 'Movie'
                    }
                );
            } else{
                cyto.add(
                    {
                        data: results[i],
                        classes: 'Actor'
                    }
                );
            }

        }

        //If there is already an edge. Might be unnecessary checking?
        if(cyto.edges("[id = '" + s_id + "-" + results[i].id + "']").length == 0) {
            //Adding undirected edges from s to S's neighbours
            cyto.add({
                data: {
                    id: s_id + "-" + results[i].id,
                    source: s_id,
                    target: results[i].id,
                    directed: 'false'
                }
            });
        }
    }

    cyto.endBatch();
    document.getElementById("loader").style.display = "none";
    cyto.layout(CoSE_Options_ContextMenu).run();
    qtipDetails();
}

//Pressing Submit-Button
document.getElementById('submitButton').addEventListener('click', function() {
    //Get values form the textfields
    let userActorName = document.getElementById('actor_textfield').value;
    let userActorNumber = parseInt(document.getElementById('actor_number').value);

    //Whether user entered empty string
    if(userActorName) {
        addGraphViaBFS(userActorName, userActorNumber);
    } else
        window.alert("Please enter a name");
});

//Adds movies and nodes by breadth first search
async function addGraphViaBFS(actorName, actorNumber=0){
    let queue = [];

    //Get first element
    let firstNode = await runQuery("MATCH (n:Actor {name : {nameParam}}) return n", {nameParam: actorName});

    //Batch for performance
    cyto.startBatch();

    //Whether username is valid
    if(firstNode.length == 0) {
        window.alert("The name you entered is not valid");
        return;
    }

    //Clear cytoscape
    cyto.elements().remove();

    //Loader
    document.getElementById("loader").style.display = "block";

    //Add first element to queue and cytoscape
    cyto.add(
        {
            data: firstNode[0],
            classes: 'Actor'
        }
    );
    queue.push(
        {
            id: firstNode[0].id,
            depth: 0
        }
    );

    //Main bfs algorithm
    while(queue.length > 0){
        //Dequeue
        let s = queue.shift();

        //Neighbours of S
        let results = await runQuery("MATCH ({id : {idParam}})-[:ACTS_IN]-(n) return n", {idParam: s.id});
        for(var i in results){
            //Whether node already exists
            if(cyto.nodes("[id = '" + results[i].id +"']").length == 0){
                //Is node actor or movie?
                if(results[i].imdbId) {
                    cyto.add(
                        {
                            data: results[i],
                            classes: 'Movie'
                        }
                    );
                } else{
                    cyto.add(
                        {
                            data: results[i],
                            classes: 'Actor'
                        }
                    );
                }

                //Enqueueu S's neighbours IF depth is not enough
                let dp = parseInt(s.depth) + 1;
                if(dp < actorNumber * 2) {
                    queue.push(
                        {
                            id: results[i].id,
                            depth: dp
                        }
                    );
                }
            }

            //If there is already an edge. Might be unnecessary checking?
            if(cyto.edges("[id = '" + s.id + "-" + results[i].id + "']").length == 0) {
                //Adding undirected edges from s to S's neighbours
                cyto.add({
                    data: {
                        id: s.id + "-" + results[i].id,
                        source: s.id,
                        target: results[i].id,
                        directed: 'false'
                    }
                });
            }
        }
    }

    //Loader
    document.getElementById("loader").style.display = "none";

    cyto.endBatch();
    cyto.layout(CoSE_Options).run();
    qtipDetails();
}

//Manage what to display
function qtipDetails() {
    function qtipMovieText(node) {
        let genre = "<p><b>Genre:</b> " + node.data("genre") + "</p>";
        let studio = "<p><b>Studio:</b> " + node.data("studio") + "</p>";
        let runTime = "<p><b>Run Time:</b> " + node.data("runtime") + "</p>";
        let tagLine = "<p><b>Tag Line:</b> " + node.data("tagline") + "</p>";
        return genre + studio + runTime + tagLine;
    }

    function qtipActorText(node) {
        let birthPlace = "<p><b>Birth Place:</b> " + node.data("birthplace") + "</p>";
        let biography = "<p><b>Biography:</b> " + node.data("biography") + "</p>";
        return birthPlace + biography;
    }

    cyto.nodes(".Movie").forEach(function(ele) {
        ele.qtip({
            content: {
                text: qtipMovieText(ele),
                title: ele.data("title")
            },
            style: {
                classes: 'qtip-bootstrap'
            },
            position: {
                my: 'bottom center',
                at: 'top center',
                target: ele
            }
        });
    });

    cyto.nodes(".Actor").forEach(function(ele) {
        ele.qtip({
            content: {
                text: qtipActorText(ele),
                title: ele.data("name")
            },
            style: {
                classes: 'qtip-bootstrap'
            },
            position: {
                my: 'bottom center',
                at: 'top center',
                target: ele
            }
        });
    });
}