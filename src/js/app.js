import $ from 'jquery';
import {init, symSubstitution, checkGlobalVars, globBeforeFunc, globAfterFunc} from './code-analyzer';
import {findLinesToBeColored, initColorsArr, red, green} from './color-path';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        init();
        initColorsArr();
        $('#codeToBeColored').empty();
        let codeToParse = $('#codePlaceholder').val();
        let codeAfterSymSubs = symSubstitution(checkGlobalVars(esprima.parseScript(codeToParse)));
        // let codeAfterSymSubs = symSubstitution(esprima.parseScript(codeToParse));
        // console.log(escodegen.generate(codeAfterSymSubs));
        // console.log(localVarDict);
        let inputVector = $('#inputVector').val();
        findLinesToBeColored(codeAfterSymSubs, inputVector);
        addRowBeforeFunc();
        colorCode(escodegen.generate(codeAfterSymSubs), red, green);
        addRowAfterFunc();
    });
});

function addRowBeforeFunc(){
    for (var i = 0; i < globBeforeFunc.length; i++)
        $('#codeToBeColored').append('<xmp style=\'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size:20px;\'>' + escodegen.generate(globBeforeFunc[i]) + '</xmp>');
}

function colorCode(codeAfterSymSubs){
    let codeAfterSymSubsArr = codeAfterSymSubs.split('\n');
    for (var i = 0; i < codeAfterSymSubsArr.length; i++){
        if (red.includes(i+1))
            $('#codeToBeColored').append('<xmp style=\'background-color: red; font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size:20px; width:350px\'>' + codeAfterSymSubsArr[i] + '</xmp>');
        else if (green.includes(i+1))
            $('#codeToBeColored').append('<xmp style=\'background-color: green; font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size:20px; width:350px\'>' + codeAfterSymSubsArr[i] + '</xmp>');
        else
            $('#codeToBeColored').append('<xmp style=\'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size:20px;\'>' + codeAfterSymSubsArr[i] + '</xmp>');

    }
}

function addRowAfterFunc(){
    for (var i = 0; i < globAfterFunc.length; i++)
        $('#codeToBeColored').append('<xmp style=\'font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; font-size:20px;\'>' + escodegen.generate(globAfterFunc[i]) + '</xmp>');
}