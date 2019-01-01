import $ from 'jquery';
import {symSubstitution, checkGlobalVars, paramsToVal, init} from './code-analyzer';
import {buildGraph} from './build-graph';
import {colorGraph} from './color-graph';
import {createCodeGraph, initGraphCode} from './graph-to-dot.js';
import * as esprima from 'esprima';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        init();
        initGraphCode();
        let codeToParse = $('#codePlaceholder').val();
        let graph = buildGraph(esprima.parseScript(codeToParse, {loc: true}).body[0].body);
        let codeAfterSymSubs = symSubstitution(checkGlobalVars(esprima.parseScript(codeToParse)));
        let inputVector = $('#inputVector').val();
        paramsToVal(codeAfterSymSubs, inputVector);
        colorGraph(graph[0]);
        plotGraph(createCodeGraph(graph));
    });
});


function plotGraph(graph){
    var d3_graphviz = require('d3-graphviz');
    d3_graphviz.graphviz('#graph').renderDot(graph);
}
