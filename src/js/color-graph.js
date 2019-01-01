import {symSubstitution, dictParams, localVarDict} from './code-analyzer';
let whileStmt = [];
let localAndArgsDict = {};
import * as esprima from 'esprima';

function replaceVars(codegen){
    for (var key in localAndArgsDict)
        while (codegen.includes(key))
            codegen = codegen.replace(key, localAndArgsDict[key]);
    return codegen;
}

function colorGraph(node){
    localAndArgsDict = {};
    while(node){
        node.isColor = true;
        if(node.normal) {
            symSubstitution(esprima.parseScript(node.label));
            localAndArgsDict = Object.assign(localAndArgsDict, localVarDict, dictParams);
            node = node.normal;
        }
        else if(node.false || node.true){
            node = evalAndColorCond(node);
        }
        else break;
    }
}

function evalAndColorCond(node){
    if(eval(replaceVars(node.label)) && !whileStmt.includes(node.true)){
        whileStmt.push(node.true);
        node = node.true;
    }
    else
        node = node.false;
    return node;
}

export{colorGraph};
export {localAndArgsDict};