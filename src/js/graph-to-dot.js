let graphCode = 'digraph {';

function initGraphCode(){
    graphCode = 'digraph {';
}

function createCodeGraph(graph){
    addNodesToGraph(graph);
    addAEdgesToGraph(graph);
    return graphCode += ' }';
}

function addNodesToGraph(graph){
    let i = 0;
    while (graph[i]){
        graphCode += 'node_' + i + ' [label="' + (i+1) + '\n' + graph[i].label + '"';
        (graph[i].true || graph[i].false) ? graphCode += ' shape= diamond' :  graphCode += ' shape= box';
        graph[i].isColor ? graphCode += ' style=filled fillcolor=green': '';
        graphCode += ']\n';
        i += 1;
    }
}

function addAEdgesToGraph(graph){
    let i = 0;
    while (graph[i]){
        graph[i].normal ? graphCode += 'node_' + i + ' -> ' + 'node_' +  graph.indexOf(graph[i].normal) + '\n' : '';
        graph[i].true ? graphCode += 'node_' + i + ' -> ' + 'node_' +  graph.indexOf(graph[i].true) + '[label="T"]' + '\n' : '';
        graph[i].false ? graphCode += 'node_' + i + ' -> ' + 'node_' +  graph.indexOf(graph[i].false) + '[label="F"]' + '\n' : '';
        i++;
    }
}

export {createCodeGraph, initGraphCode};