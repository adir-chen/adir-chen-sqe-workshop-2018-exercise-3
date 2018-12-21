import assert from 'assert';
import * as escodegen from 'escodegen';
import * as esprima from 'esprima';
import {symSubstitution, init, checkGlobalVars, globBeforeFunc, globAfterFunc} from '../src/js/code-analyzer';
import {findLinesToBeColored, initColorsArr, red, green} from '../src/js/color-path';

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
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test2', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(buildCodeTest1()), '1,2,3');
        assert(red.length == 1);
        assert(red.includes(2));
        assert(green.length == 1);
        assert(green.includes(4));
    });
});

describe('The javascript parser', () => {
    it('test3', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(buildCodeTest1()), '3,2,1');
        assert(red.length == 2);
        assert(red.includes(2));
        assert(red.includes(4));
        assert(green.length == 0);
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
    it('test4', () => {
        init();
        assert.deepEqual(symSubstitution(buildCodeTest2()), buildCodeAfterSymSubsTest2());
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test5', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(buildCodeTest2()), '1,2,3');
        assert(red.length == 0);
        assert(green.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test6', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(buildCodeTest2()), '3,2,1');
        assert(red.length == 0);
        assert(green.length == 0);
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
    it('test6', () => {
        init();
        assert.deepEqual(symSubstitution(buildCodeTest3()), buildCodeAfterSymSubsTest3());
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test7', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(buildCodeTest3()), '1,2,3');
        assert(red.length == 2);
        assert(red.includes(2));
        assert(red.includes(4));
        assert(green.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test8', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(buildCodeTest3()), '2,2,0');
        assert(red.length == 1);
        assert(red.includes(4));
        assert(green.length == 1);
        assert(green.includes(2));
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
    it('test9', () => {
        init();
        assert.deepEqual(symSubstitution(checkGlobalVars(buildCodeTest4())), buildCodeAfterSymSubsTest4());
        assert(globBeforeFunc.length == 2);
        assert.equal(escodegen.generate(globBeforeFunc[0]), 'let d = 1;');
        assert.equal(escodegen.generate(globBeforeFunc[1]), 'let f = 2;');
        assert(globAfterFunc.length == 1);
        assert.equal(escodegen.generate(globAfterFunc[0]), 'let e = 2;');
    });
});

describe('The javascript parser', () => {
    it('test10', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest4())), '1,2,3');
        assert(red.length == 1);
        assert(red.includes(2));
        assert(green.length == 1);
        assert(green.includes(4));
    });
});

describe('The javascript parser', () => {
    it('test11', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest4())), '2,2,2');
        assert(red.length == 1);
        assert(red.includes(4));
        assert(green.length == 1);
        assert(green.includes(2));
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
    it('test12', () => {
        init();
        assert.deepEqual(symSubstitution(checkGlobalVars(buildCodeTest5())), buildCodeAfterSymSubsTest5());
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test13', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest5())), '[1,2,3],2,[6,7]');
        assert(red.length == 0);
        assert(green.length == 0);
    });
});

function buildCodeTest6(){
    return esprima.parseScript('function foo(x, y){\n' +
        '    let a = x;\n' + '    let b = y;\n' + '    let c = 0;\n' + '    \n' +
        '    if (a[0] > b[0]) {\n' +
        '        if (a[1] > a[0]){\n' +
        '          c = c + a[0];\n' +
        '          return c;\n' +
        '        }\n' +
        '        else{\n' +
        '          c = c + a[1];\n' +
        '          return c;\n' +
        '        }\n' +
        '    }\n' +
        '    else {\n' +
        '        c = c + a[0] + a[1] + b[0];\n' +
        '        return c + b[1];\n' +
        '    }\n' + '\n' + '}\n');
}

function buildCodeAfterSymSubsTest6(){
    return esprima.parseScript('function foo(x, y) {\n' +
        '    if (x[0] > y[0]) {\n' +
        '        if (x[1] > x[0]) {\n' +
        '            return 0 + x[0];\n' +
        '        } else {\n' +
        '            return 0 + x[1];\n' +
        '        }\n' +
        '    } else {\n' +
        '        return 0 + x[0] + x[1] + y[0] + y[1];\n' +
        '    }\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test14', () => {
        init();
        assert.deepEqual(symSubstitution(checkGlobalVars(buildCodeTest6())), buildCodeAfterSymSubsTest6());
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test15', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest6())), '[4,5],[1,3]');
        assert(red.length == 0);
        assert(green.length == 2);
        assert(green.includes(2));
        assert(green.includes(3));
    });
});

describe('The javascript parser', () => {
    it('test16', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest6())), '[5,4],[1,3]');
        assert(red.length == 1);
        assert(green.length == 1);
        assert(green.includes(2));
        assert(red.includes(3));
    });
});

function buildCodeTest7(){
    return esprima.parseScript('function f(x, y, z){\n' +
        '  let a = x + 1\n' +
        '  a = [4,5,6]\n' +
        '  if (a[2] > y){\n' +
        '     a[2] = 2\n' +
        '     x = x + 1\n' +
        '  }\n' +
        '  return a[2] + x;\n' +
        '}');
}

function buildCodeAfterSymSubsTest7(){
    return esprima.parseScript('function f(x, y, z) {\n' +
        '    if (6 > y) {\n' +
        '        x = x + 1;\n' +
        '    }\n' +
        '    return 6 + x;\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test17', () => {
        init();
        assert.deepEqual(symSubstitution(checkGlobalVars(buildCodeTest7())), buildCodeAfterSymSubsTest7());
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test18', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest7())), '1, 1,[1,3]');
        assert(red.length == 0);
        assert(green.length == 1);
        assert(green.includes(2));
    });
});

describe('The javascript parser', () => {
    it('test19', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest7())), '1, 7,[1,3]');
        assert(red.length == 1);
        assert(green.length == 0);
        assert(red.includes(2));
    });
});

function buildCodeTest8(){
    return esprima.parseScript('function f(x){\n' +
        '  let a = [1,2,3]\n' +
            '  return a[0]\n' +
        '\n' +
        '}');
}

function buildCodeAfterSymSubsTest8(){
    return esprima.parseScript('function f(x) {\n' +
        '    return 1;\n' +
        '}');
}

describe('The javascript parser', () => {
    it('test20', () => {
        init();
        assert.deepEqual(symSubstitution(checkGlobalVars(buildCodeTest8())), buildCodeAfterSymSubsTest8());
        assert(globBeforeFunc.length == 0);
        assert(globAfterFunc.length == 0);
    });
});

describe('The javascript parser', () => {
    it('test21', () => {
        initColorsArr();
        findLinesToBeColored(symSubstitution(checkGlobalVars(buildCodeTest8())), '1');
        assert(red.length == 0);
        assert(green.length == 0);
    });
});
