import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let dictParams = {};
let red = [];
let green = [];

function initColorsArr(){
    red = [];
    green = [];
}

function paramsToVal(codeAfterSymSubs, inputVector){
    let inputVectorArr = inputVector.split(',');
    let arrParam = '';
    let countParam = 0;
    for (let i = 0; i < inputVectorArr.length; i++) {
        if (inputVectorArr[i].includes('[')){
            arrParam += inputVectorArr[i] + ','; i++;
            while (!inputVectorArr[i].includes(']')){
                arrParam += inputVectorArr[i] + ','; i++;
            }
            dictParams[codeAfterSymSubs.body[0].params[countParam].name] = arrParam + inputVectorArr[i];
            arrParam = '';
        }
        else
            dictParams[codeAfterSymSubs.body[0].params[countParam].name] = inputVectorArr[i];
            // dictParams[codeAfterSymSubs.body[0].params[i].name] = inputVectorArr[i];
        countParam++;
    }
}

function findLinesToBeColored(codeAfterSymSubs, inputVector){
    paramsToVal(codeAfterSymSubs, inputVector);
    evalAndColor(esprima.parseScript(escodegen.generate(codeAfterSymSubs), {loc: true}));
}

function existsType(codengen) {
    return codengen != null && codengen.hasOwnProperty('type') && codengen.type == 'IfStatement';
}

function existsProperty(codengen) {
    return codengen != null && codengen.hasOwnProperty('body');
}

function replaceParamInVal(paramVal){
    for (var key in dictParams) {
        paramVal = paramVal.replace(new RegExp(key, 'g'), dictParams[key]);
    }
    return paramVal;
}

function ifEvalAndColor(codegen){
    if (eval(replaceParamInVal(escodegen.generate(codegen.test))))
        green.push(codegen.loc.start.line);
    else
        red.push(codegen.loc.start.line);
    evalAndColor(codegen.consequent);
    evalAndColor(codegen.alternate);
}

function evalAndColor(codegen){
    if (existsType(codegen))
        ifEvalAndColor(codegen);
    if (existsProperty(codegen)){
        if(Array.isArray(codegen.body))
            for (var row in codegen.body)
                evalAndColor(codegen.body[row]);
        else
            evalAndColor(codegen.body);
    }
}

export{findLinesToBeColored, initColorsArr, red, green};

// function replaceParamInVal(paramVal){
//     for (var key in dictParams) {
//         paramVal = paramVal.replace(new RegExp(key, 'g'), dictParams[key]);
//         paramVal = paramVal.replace(dictParams[key], key);
//     }
//     return paramVal;
// }

// function paramsToVal(codeAfterSymSubs, inputVector){
//     let inputVectorArr = inputVector.split(',');
//     for (var i = 0; i < codeAfterSymSubs.body[0].params.length; i++)
//         dictParams[codeAfterSymSubs.body[0].params[i].name] = inputVectorArr[i];
//     return replaceParamInVal(escodegen.generate(codeAfterSymSubs));
// }

// function findLinesToBeColored(codeAfterSymSubs, inputVector){
//     let codeAfterMapParams = paramsToVal(codeAfterSymSubs, inputVector);
//     evalAndColor(esprima.parseScript(codeAfterMapParams, {loc: true}));
// }