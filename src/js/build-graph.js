import * as esgraph from 'esgraph';
import * as escodegen from 'escodegen';


function buildGraph(codegen){
    let graph = esgraph(codegen)[2];
    fixEntryNode(graph);
    let newExitNode = findReturnStmt(graph);
    fixExitNode(graph, newExitNode);
    graph.forEach(function(node){
        node.label = escodegen.generate(node.astNode);
    });
    fixNodesInGraph(graph);
    return graph;
}

function fixEntryNode(graph) {
    let oldNode = graph[0];
    let newNode = oldNode.normal;
    newNode.prev = [];
    newNode.type = 'entry';
    graph.splice(0, 1);
}

function findReturnStmt(graph){
    for(let node in graph[graph.length - 1].prev)
        if(graph[graph.length - 1].prev[node].astNode.type == 'ReturnStatement')
            return graph[graph.length - 1].prev[node];
}


function fixExitNode(graph, newNode){
    let oldNode = graph[graph.length - 1];
    newNode.next = [];
    newNode.type = 'exit';
    delete newNode.normal;
    graph.splice(graph.length - 1, 1);
    for(let node in graph)
        if(graph[node].next.indexOf(oldNode) != -1)
            graph[node].next.splice(graph[node].next.indexOf(oldNode), 1);
}


function fixNodesInGraph(graph) {
    let i = 0;
    while (graph[i]) {
        if (graph[i].normal && graph[i].normal.normal) {
            let norm = graph[i].normal;
            graph[i].label += '\n' + graph[i].normal.label;
            graph[i].normal = graph[i].normal.normal;
            graph[i].next = norm.next;
            let toRemove = graph.indexOf(norm);
            i = i - 1;
            graph.splice(toRemove, 1);
        }
        i++;
    }
}

export {buildGraph};