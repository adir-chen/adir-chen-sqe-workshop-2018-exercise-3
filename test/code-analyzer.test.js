import assert from 'assert';
import * as esprima from 'esprima';
import {symSubstitution, init, checkGlobalVars, paramsToVal, dictParams, localVarDict} from '../src/js/code-analyzer';
import {buildGraph} from '../src/js/build-graph';
import {colorGraph} from '../src/js/color-graph';
import {createCodeGraph, initGraphCode} from '../src/js/graph-to-dot';

function buildCodeTest1(){
    return esprima.parseScript('function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '        return x + y + z + c;\n' +
    '    }\n' +
    '}');
}

function buildCodeAfterSymSubsTest1(){
    return esprima.parseScript('function foo(x, y, z) {\n' +
        '    if (x + 1 + y < z) {\n' +
        '        return x + y + z + 5;\n' +
        '    } else if (x + 1 + y < z * 2) {\n' +
        '        return x + y + z + (0 + x + 5);\n' +
        '    } else {\n' +
        '        return x + y + z + (0 + z + 5);\n' +
        '    }\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test1', () => {
        init();
        assert.deepEqual(symSubstitution(buildCodeTest1()), buildCodeAfterSymSubsTest1());
    });
});


function buildCodeTest2(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    while (a < z) {\n' +
        '        c = a + b;\n' +
        '        z = c * 2;\n' +
        '    }\n' +
        '    \n' +
        '    return z;\n' +
        '}\n');
}

function buildCodeAfterSymSubsTest2(){
    return esprima.parseScript('function foo(x, y, z) {\n' +
        '    while (x + 1 < z) {\n' +
        '        z = (x + 1 + (x + 1 + y)) * 2;\n' +
        '    }\n' +
        '    return z;\n' +
        '}');

}

describe('The javascript parser', () => {
    it('test2', () => {
        init();
        assert.deepEqual(symSubstitution(buildCodeTest2()), buildCodeAfterSymSubsTest2());
    });
});


function buildCodeTest3(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    if (a > 2){\n' +
        '       return y;\n' +
        '    }\n' +
        '    else if (a == y + z){\n' +
        '       return y + z;\n' +
        '    }\n' +
        '    return a + x + z;\n' +
        '}\n');
}

function buildCodeAfterSymSubsTest3(){
    return esprima.parseScript('function foo(x, y, z) {\n' +
        '    if (x + 1 > 2) {\n' +
        '        return y;\n' +
        '    } else if (x + 1 == y + z) {\n' +
        '        return y + z;\n' +
        '    }\n' +
        '    return x + 1 + x + z;\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test3', () => {
        init();
        assert.deepEqual(symSubstitution(buildCodeTest3()), buildCodeAfterSymSubsTest3());
    });
});


function buildCodeTest4(){
    return esprima.parseScript('let d = 1;\n' +
        'let f = 2;\n' +
        'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    if (b > f + e) {\n' +
        '        c = d + f;\n' +
        '        return x + y + z + c;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = e;\n' +
        '        return x + y + z + c;\n' +
        '    }\n' +
        '    \n' +
        '\n' +
        '}\n' +
        'let e = 2;');
}

function buildCodeAfterSymSubsTest4(){
    return esprima.parseScript('function foo(x, y, z) {\n' +
        '    if (x + 1 + y > 2 + 2) {\n' +
        '        return x + y + z + 3;\n' +
        '    } else if (x + 1 + y < z * 2) {\n' +
        '        return x + y + z + 2;\n' +
        '    }\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test4', () => {
        init();
        assert.deepEqual(symSubstitution(checkGlobalVars(buildCodeTest4())), buildCodeAfterSymSubsTest4());
    });
});

function buildCodeTest5(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = x;\n' +
        '    let b = y + z[0];\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    while (a[0] < z[1]) {\n' +
        '        c = a[0] + a[1];\n' +
        '        z = c + b;\n' +
        '    }\n' +
        '    \n' +
        '    return z;\n' +
        '\n' +
        '}\n');
}

function buildCodeAfterSymSubsTest5(){
    return esprima.parseScript('function foo(x, y, z) {\n' +
        '    while (x[0] < z[1]) {\n' +
        '        z = x[0] + x[1] + (y + z[0]);\n' +
        '    }\n' +
        '    return z;\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test5', () => {
        init();
        assert.deepEqual(symSubstitution( (buildCodeTest5())), buildCodeAfterSymSubsTest5());
    });
});

function buildCodeTest6(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = 6;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    let d = [1,2,4]\n' +
        '    a = [1,2,3]\n' +
        '    if (b < z) {\n' +
        '        c = 4;\n' +
        '        b++;\n' +
        '    } else if (b < z * 2) {  \n' +
        '        c = 3;\n' +
        '        b--;\n' +
        '    } else {\n' +
        '        x = 1;\n' +
        '        c = a[2];\n' +
        '    }\n' +
        '    return x;\n' +
        '}');
}

function buildCodeAfterSymSubsTest6(){
    return esprima.parseScript('function foo(x, y, z) {\n' +
        '    if (6 + y < z) {\n' +
        '        b++;\n' +
        '    } else if (6 + y < z * 2) {\n' +
        '        b--;\n' +
        '    } else {\n' +
        '        x = 1;\n' +
        '    }\n' +
        '    return x;\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test6', () => {
        init();
        assert.deepEqual(symSubstitution(buildCodeTest6()), buildCodeAfterSymSubsTest6());
    });
});

/* --------------------------------- build-graph tests ---------------------------------*/
function getInputTest6(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = c + x + 5;\n' +
        '    } else {\n' +
        '        c = c + z + 5;\n' +
        '    }\n' +
        '    \n' +
        '    return c;\n' +
        '}\n', {loc: true}).body[0].body;
}

describe('The javascript parser', () => {
    it('test7', () => {
        init();
        let outGraph = buildGraph(getInputTest6());
        assert.equal(outGraph[0].label, 'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;');
        assert.equal(outGraph[1].label, 'b < z');
        assert.equal(outGraph[2].label, 'c = c + 5');
        assert.equal(outGraph[3].label, 'return c;');
        assert.equal(outGraph[4].label, 'b < z * 2');
        assert.equal(outGraph[5].label, 'c = c + x + 5');
        assert.equal(outGraph[6].label, 'c = c + z + 5');
        assert.equal(outGraph[1].true, outGraph[2]);
        assert.equal(outGraph[1].false, outGraph[4]);
        assert.equal(outGraph[4].true, outGraph[5]);
        assert.equal(outGraph[4].false, outGraph[6]);
    });
});

function getInputTest7(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '   let a = x + 1;\n' +
        '   let b = a + y;\n' +
        '   let c = 0;\n' +
        '   \n' +
        '   while (a < z) {\n' +
        '       c = a + b;\n' +
        '       z = c * 2;\n' +
        '       a++;\n' +
        '   }\n' +
        '   \n' +
        '   return z;\n' +
        '}\n', {loc: true}).body[0].body;
}

describe('The javascript parser', () => {
    it('test8', () => {
        init();
        let outGraph = buildGraph(getInputTest7());
        assert.equal(outGraph[0].label, 'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;');
        assert.equal(outGraph[1].label, 'a < z');
        assert.equal(outGraph[2].label, 'c = a + b\n' +
            'z = c * 2\n' +
            'a++');
        assert.equal(outGraph[3].label, 'return z;');
        assert.equal(outGraph[1].true, outGraph[2]);
        assert.equal(outGraph[1].false, outGraph[3]);
    });
});

function getInputTest8(){
    return esprima.parseScript('function foo(x){\n' +
        '   let a = x + 1;\n' +
        '   return a;\n' +
        '}\n', {loc: true}).body[0].body;

}

describe('The javascript parser', () => {
    it('test9', () => {
        init();
        let outGraph = buildGraph(getInputTest8());
        assert.equal(outGraph[0].label, 'let a = x + 1;');
        assert.equal(outGraph[1].label, 'return a;');
    });
});

function getInputTest9(){
    return esprima.parseScript('function foo(x){\n' +
        '   let a = x + 1;\n' +
        '   let b = a + 2;\n' +
        '   \n' +
        '   while (a < 5) {\n' +
        '       c = a + b;\n' +
        '       b = c * 2;\n' +
        '       a++;\n' +
        '   }\n' +
        '   if (a > 10)\n' +
        '      a = 6;\n' +
        '   else\n' +
        '      b = 9\n' +
        '\n' +
        '   \n' +
        '   return z;\n' +
        '}\n', {loc: true}).body[0].body;
}

describe('The javascript parser', () => {
    it('test10', () => {
        init();
        let outGraph = buildGraph(getInputTest9());
        assert.equal(outGraph[0].label, 'let a = x + 1;\n' +
            'let b = a + 2;');
        assert.equal(outGraph[1].label, 'a < 5');
        assert.equal(outGraph[2].label,'c = a + b\n' + 'b = c * 2\n' +
            'a++');
        assert.equal(outGraph[3].label,'a > 10');
        assert.equal(outGraph[4].label,'a = 6');
        assert.equal(outGraph[5].label,'return z;');
        assert.equal(outGraph[6].label,'b = 9');
        assert.equal(outGraph[1].true, outGraph[2]);
        assert.equal(outGraph[1].false, outGraph[3]);
        assert.equal(outGraph[3].true, outGraph[4]);
        assert.equal(outGraph[3].false, outGraph[6]);
    });
});

function getInputTest10(){
    return esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = 6\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    a = [1,2,3]\n' +
        '    if (b < z) {\n' +
        '        c = 4;\n' +
        '        b++;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = 3;\n' +
        '        b--;\n' +
        '    } else {\n' +
        '        x = 1;\n' +
        '        c = a[2];\n' +
        '    }\n' +
        '    \n' +
        '    return c;\n' +
        '}\n', {loc: true}).body[0].body;
}

describe('The javascript parser', () => {
    it('test11', () => {
        init();
        let outGraph = buildGraph(getInputTest10());
        assert.equal(outGraph[0].label, 'let a = 6;\n' +
            'let b = a + y;\n' + 'let c = 0;\n' + 'a = [\n' +
            '    1,\n' + '    2,\n' + '    3\n' + ']');
        assert.equal(outGraph[1].label, 'b < z');
        assert.equal(outGraph[2].label,  'c = 4\n' +
            'b++');
        assert.equal(outGraph[3].label, 'return c;');
        assert.equal(outGraph[4].label, 'b < z * 2');
        assert.equal(outGraph[5].label, 'c = 3\n' + 'b--');
        assert.equal(outGraph[6].label, 'x = 1\n' + 'c = a[2]');
        assert.equal(outGraph[1].true, outGraph[2]);
        assert.equal(outGraph[1].false, outGraph[4]);
        assert.equal(outGraph[4].true, outGraph[5]);
        assert.equal(outGraph[4].false, outGraph[6]);
    });
});
/* --------------------------------- paramsToVal tests ---------------------------------*/
function getInputParamsToVal(){
    return symSubstitution(checkGlobalVars(esprima.parseScript('function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '        return x + y + z + c;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = c + x + 5;\n' +
        '        return x + y + z + c;\n' +
        '    } else {\n' +
        '        c = c + z + 5;\n' +
        '        return x + y + z + c;\n' +
        '    }\n' +
        '}')));
}

describe('The javascript parser', () => {
    it('test12', () => {
        init();
        paramsToVal(getInputParamsToVal(), '1,2,3');
        assert.equal(dictParams['x'], '1');
        assert.equal(dictParams['y'], '2');
        assert.equal(dictParams['z'], '3');
    });
});

describe('The javascript parser', () => {
    it('test13', () => {
        init();
        paramsToVal(getInputParamsToVal(), '[1,2,3],hello,4');
        assert.equal(dictParams['x'], '[1,2,3]');
        assert.equal(dictParams['y'], 'hello');
        assert.equal(dictParams['z'], '4');
    });
});
/* --------------------------------- color-graph tests ---------------------------------*/
function buildDict1(){
    localVarDict['a'] = '(x + 1)';
    localVarDict['b'] = '((x + 1) + y)';
    localVarDict['c'] = 0;
    dictParams['x'] = '1';
    dictParams['y'] = '2';
    dictParams['z'] = '3';
}

describe('The javascript parser', () => {
    it('test14', () => {
        init();
        buildDict1();
        let outGraph = buildGraph(getInputTest6());
        colorGraph(outGraph[0]);
        assert.equal(outGraph[0].isColor, true);
        assert.equal(outGraph[1].isColor, true);
        assert.equal(outGraph[3].isColor, true);
        assert.equal(outGraph[4].isColor, true);
        assert.equal(outGraph[5].isColor, true);
    });
});

function buildDict2(){
    localVarDict['a'] = '(x + 1)';
    localVarDict['b'] = '((x + 1) + y)';
    localVarDict['c'] = 0;
    dictParams['x'] = '1';
    dictParams['y'] = '2';
    dictParams['z'] = '3';
}

describe('The javascript parser', () => {
    it('test15', () => {
        init();
        buildDict2();
        let outGraph = buildGraph(getInputTest7());
        colorGraph(outGraph[0]);
        assert.equal(outGraph[0].isColor, true);
        assert.equal(outGraph[1].isColor, true);
        assert.equal(outGraph[3].isColor, true);
    });
});
/* --------------------------------- graph-to-dot tests ---------------------------------*/
function getCodeGraph1(){
    return 'digraph {node_0 [label="1\n' +
        'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;" shape= box]\n' +
        'node_1 [label="2\n' + 'b < z" shape= diamond]\n' +
        'node_2 [label="3\n' + 'c = c + 5" shape= box]\n' +
        'node_3 [label="4\n' +
        'return c;" shape= box]\n' +
        'node_4 [label="5\n' +
        'b < z * 2" shape= diamond]\n' +
        'node_5 [label="6\n' +
        'c = c + x + 5" shape= box]\n' +
        'node_6 [label="7\n' +
        'c = c + z + 5" shape= box]\n' +
        'node_0 -> node_1\n' + 'node_1 -> node_2[label="T"]\n' + 'node_1 -> node_4[label="F"]\n' +
        'node_2 -> node_3\n' + 'node_4 -> node_5[label="T"]\n' +
        'node_4 -> node_6[label="F"]\n' + 'node_5 -> node_3\n' + 'node_6 -> node_3\n' +
        ' }';
}

describe('The javascript parser', () => {
    it('test16', () => {
        init();
        let outGraph = buildGraph(getInputTest6());
        assert.equal(getCodeGraph1(), createCodeGraph(outGraph));
    });
});

function getCodeGraph2(){
    return 'digraph {node_0 [label="1\n' +
        'let a = x + 1;\n' +
        'let b = a + y;\n' +
        'let c = 0;" shape= box]\n' +
        'node_1 [label="2\n' +
        'a < z" shape= diamond]\n' +
        'node_2 [label="3\n' +
        'c = a + b\n' +
        'z = c * 2\n' +
        'a++" shape= box]\n' +
        'node_3 [label="4\n' +
        'return z;" shape= box]\n' +
        'node_0 -> node_1\n' +
        'node_1 -> node_2[label="T"]\n' +
        'node_1 -> node_3[label="F"]\n' +
        'node_2 -> node_1\n' +
        ' }';
}

describe('The javascript parser', () => {
    it('test17', () => {
        init();
        initGraphCode();
        let outGraph = buildGraph(getInputTest7());
        assert.equal(getCodeGraph2(), createCodeGraph(outGraph));
    });
});

function getCodeGraph3(){
    return 'digraph {node_0 [label="1\n' +
        'let a = 6;\n' + 'let b = a + y;\n' + 'let c = 0;\n' +
        'a = [\n' + '    1,\n' + '    2,\n' + '    3\n' + ']" shape= box]\n' +
        'node_1 [label="2\n' +
        'b < z" shape= diamond]\n' +
        'node_2 [label="3\n' +
        'c = 4\n' +
        'b++" shape= box]\n' +
        'node_3 [label="4\n' +
        'return c;" shape= box]\n' +
        'node_4 [label="5\n' +
        'b < z * 2" shape= diamond]\n' +
        'node_5 [label="6\n' +
        'c = 3\n' + 'b--" shape= box]\n' +
        'node_6 [label="7\n' + 'x = 1\n' +
        'c = a[2]" shape= box]\n' + 'node_0 -> node_1\n' +
        'node_1 -> node_2[label="T"]\n' + 'node_1 -> node_4[label="F"]\n' + 'node_2 -> node_3\n' + 'node_4 -> node_5[label="T"]\n' +
        'node_4 -> node_6[label="F"]\n' + 'node_5 -> node_3\n' + 'node_6 -> node_3\n' + ' }';
}

describe('The javascript parser', () => {
    it('test18', () => {
        init();
        initGraphCode();
        let outGraph = buildGraph(getInputTest10());
        assert.equal(getCodeGraph3(), createCodeGraph(outGraph));
    });
});

function getCodeGraph4(){
    return 'digraph {node_0 [label="1\n' +
        'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;" shape= box style=filled fillcolor=green]\n' +
        'node_1 [label="2\n' + 'b < z" shape= diamond style=filled fillcolor=green]\n' +
        'node_2 [label="3\n' + 'c = c + 5" shape= box]\n' + 'node_3 [label="4\n' +
        'return c;" shape= box style=filled fillcolor=green]\n' +
        'node_4 [label="5\n' + 'b < z * 2" shape= diamond style=filled fillcolor=green]\n' +
        'node_5 [label="6\n' + 'c = c + x + 5" shape= box style=filled fillcolor=green]\n' +
        'node_6 [label="7\n' + 'c = c + z + 5" shape= box]\n' +
        'node_0 -> node_1\n' +
        'node_1 -> node_2[label="T"]\n' +
        'node_1 -> node_4[label="F"]\n' +
        'node_2 -> node_3\n' +
        'node_4 -> node_5[label="T"]\n' +
        'node_4 -> node_6[label="F"]\n' +
        'node_5 -> node_3\n' +
        'node_6 -> node_3\n' +
        ' }';
}

describe('The javascript parser', () => {
    it('test19', () => {
        init();
        initGraphCode();
        buildDict1();
        let outGraph = buildGraph(getInputTest6());
        colorGraph(outGraph[0]);
        assert.equal(getCodeGraph4(), createCodeGraph(outGraph));
    });
});

function getCodeGraph5(){
    return 'digraph {node_0 [label="1\n' +
        'let a = x + 1;\n' +
        'let b = a + y;\n' +
        'let c = 0;" shape= box style=filled fillcolor=green]\n' +
        'node_1 [label="2\n' +
        'a < z" shape= diamond style=filled fillcolor=green]\n' +
        'node_2 [label="3\n' +
        'c = a + b\n' +
        'z = c * 2\n' +
        'a++" shape= box style=filled fillcolor=green]\n' +
        'node_3 [label="4\n' +
        'return z;" shape= box style=filled fillcolor=green]\n' +
        'node_0 -> node_1\n' +
        'node_1 -> node_2[label="T"]\n' +
        'node_1 -> node_3[label="F"]\n' +
        'node_2 -> node_1\n' +
        ' }';
}

describe('The javascript parser', () => {
    it('test20', () => {
        init();
        initGraphCode();
        buildDict2();
        let outGraph = buildGraph(getInputTest7());
        colorGraph(outGraph[0]);
        assert.equal(getCodeGraph5(), createCodeGraph(outGraph));
    });
});