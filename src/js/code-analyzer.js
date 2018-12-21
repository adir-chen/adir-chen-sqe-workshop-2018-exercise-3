import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {init, checkGlobalVars, symSubstitution, globBeforeFunc, globAfterFunc, localVarDict};

let localVarDict = {};
let rowNo = 0;
let globBeforeFunc = [];
let globAfterFunc = [];

function init(){
    localVarDict = {};
    globBeforeFunc = [];
    globAfterFunc = [];
}

function replaceLocalVars(codegen){
    for (var key in localVarDict)
        while (codegen.includes(key))
            codegen = codegen.replace(key, localVarDict[key]);
    return codegen;
}

function parseVariableDeclaration(codegen, root) {
    for (var variableDecl in codegen.declarations) {
        if (codegen.declarations[variableDecl].init.type == 'ArrayExpression')
            for (let i = 0; i < codegen.declarations[variableDecl].init.elements.length; i++) {
                localVarDict[codegen.declarations[variableDecl].id.name + '[' + i + ']'] = '(' + replaceLocalVars(escodegen.generate(codegen.declarations[variableDecl].init.elements[i])) + ')';
                evalVar(codegen.declarations[variableDecl].id.name + '[' + i + ']');
            }
        else {
            localVarDict[codegen.declarations[variableDecl].id.name] = '(' + replaceLocalVars(escodegen.generate(codegen.declarations[variableDecl].init)) + ')';
            evalVar(codegen.declarations[variableDecl].id.name);
        }
    }
    deleteFromRoot(codegen, root, true);
}

function parseExpressionStatement(codegen, root){
    if ((escodegen.generate(codegen.expression.left) in localVarDict)){
        if (codegen.expression.right.type == 'ArrayExpression') {
            delete localVarDict[escodegen.generate(codegen.expression.left)];
            for (let i = 0; i < codegen.expression.right.elements.length; i++) {
                localVarDict[codegen.expression.left.name + '[' + i + ']'] = '(' + replaceLocalVars(escodegen.generate(codegen.expression.right.elements[i])) + ')';
                evalVar(codegen.expression.left.name + '[' + i + ']');
            }
            localVarDict[escodegen.generate(codegen.expression.left)] = '(' + replaceLocalVars(escodegen.generate(codegen.expression.right)) + ')';
        }
        else{
            localVarDict[escodegen.generate(codegen.expression.left)] = '(' + replaceLocalVars(escodegen.generate(codegen.expression.right)) + ')';
            evalVar(escodegen.generate(codegen.expression.left));
        }
        deleteFromRoot(codegen, root, false);
    }
    else{
        codegen.expression.right = esprima.parseScript(replaceLocalVars(escodegen.generate(codegen.expression.right))).body[0].expression;
    }
}

function evalVar(itemInDict){
    try {
        localVarDict[itemInDict] = eval(localVarDict[itemInDict]);
    } catch (e){
        e.toString();
    }
}

function deleteFromRoot(codegen, root, toDel){
    for (var row in root){
        if (JSON.stringify(root[row]) ===  JSON.stringify(codegen)){
            root.splice(row, 1);
            toDel == true ? rowNo-- : rowNo;
        }
    }
}

function parseBlockStatement(codegen, root){
    let tempDict = {};
    Object.assign(tempDict, localVarDict);
    for (var row in codegen.body) {
        symSubstitution(codegen.body[row], root);
    }
    Object.assign(localVarDict, tempDict);
}

function parseWhileStatement(codegen, root){
    codegen.test = esprima.parseScript(replaceLocalVars(escodegen.generate(codegen.test))).body[0].expression;
    let tempDict = {};
    Object.assign(tempDict, localVarDict);
    symSubstitution(codegen.body, root);
    Object.assign(localVarDict, tempDict);
}

function parseIfStatement(codegen, root){
    codegen.test = esprima.parseScript(replaceLocalVars(escodegen.generate(codegen.test))).body[0].expression;
    let tempDict = {};
    Object.assign(tempDict, localVarDict);
    symSubstitution(codegen.consequent, root);
    Object.assign(localVarDict, tempDict);
    symSubstitution(codegen.alternate, root);
}

function parseReturnStatement(codegen){
    codegen.argument = esprima.parseScript(replaceLocalVars(escodegen.generate(codegen.argument))).body[0].expression;
}

let dictDataType = {
    'VariableDeclaration': parseVariableDeclaration,
    'ExpressionStatement': parseExpressionStatement,
    'BlockStatement' : parseBlockStatement,
    'WhileStatement' : parseWhileStatement,
    'IfStatement' : parseIfStatement,
    'ReturnStatement': parseReturnStatement,
};

function searchForType(codengen) {
    return codengen != null && codengen.type in dictDataType;
}

function existsProperty(codengen) {
    return codengen != null && codengen.hasOwnProperty('body');
}

function bodySubstitution(codegen) {
    if (Array.isArray(codegen.body)) {
        for (rowNo = 0; rowNo < codegen.body.length; rowNo++) {
            symSubstitution(codegen.body[rowNo], codegen.body);
            if (codegen.type == 'Program') return codegen;
        }
    }
    else {
        symSubstitution(codegen.body, codegen);
    }
}

function symSubstitution(codegen, root=null){
    if (searchForType(codegen)) {
        dictDataType[codegen.type](codegen, root);
    }
    if (existsProperty(codegen)){
        let res = bodySubstitution(codegen) ;
        if (codegen.type == 'Program') return res;
    }
}

function checkGlobalVars(codeToParse){
    let funcIndex;
    let i = 0;
    while (codeToParse.body[i] && codeToParse.body[i].type != 'FunctionDeclaration'){
        globBeforeFunc.push(codeToParse.body[i]);
        i++;
    }
    funcIndex = i;
    i++;
    while (codeToParse.body[i]) {
        globAfterFunc.push(codeToParse.body[i]);
        i++;
    }
    addGlobalVarsToDict();
    return esprima.parseScript(escodegen.generate(codeToParse.body[funcIndex]));
}

function addGlobalVarsToDict(){
    for (var i = 0; i < globBeforeFunc.length; i++) {
        for (var globVarBef in  globBeforeFunc[i].declarations) {
            localVarDict[globBeforeFunc[i].declarations[globVarBef].id.name] = escodegen.generate(globBeforeFunc[i].declarations[globVarBef].init);
        }
    }
    for (var j = 0; j < globAfterFunc.length; j++) {
        for (var globVarAfter in  globAfterFunc[j].declarations) {
            localVarDict[globAfterFunc[j].declarations[globVarAfter].id.name] = escodegen.generate(globAfterFunc[j].declarations[globVarAfter].init);
        }
    }
}