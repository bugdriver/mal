const readline = require('readline');
const { read_str } = require('./reader');
const { prn_str } = require('./printer');
const { Env } = require('./env');
const { List, Vector, HashMap, Symbol, Nil } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env();
env.set(new Symbol('+'), (...args) => args.reduce((a, b) => a + b, 0));
env.set(new Symbol('*'), (...args) => args.reduce((a, b) => a * b, 1));
env.set(new Symbol('-'), (a, b) => a - b);
env.set(new Symbol('/'), (a, b) => a / b);
env.set(new Symbol('<'), (a, b) => a < b);
env.set(new Symbol('>'), (a, b) => a > b);
env.set(new Symbol('<='), (a, b) => a <= b);
env.set(new Symbol('>='), (a, b) => a >= b);
env.set(new Symbol('='), (a, b) => a === b);
env.set(new Symbol('count'), (a) => a.length);
env.set(new Symbol('list?'), (a) => a instanceof List);
env.set(new Symbol('list'), (...elements) => new List([...elements]));
env.set(new Symbol('pi'), Math.PI);

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    return env.get(ast);
  }
  if (ast instanceof List) {
    const newList = ast.ast.map((e) => EVAL(e, env));
    return new List(newList);
  }
  if (ast instanceof Vector) {
    const newList = ast.ast.map((e) => EVAL(e, env));
    return new Vector(newList);
  }

  if (ast instanceof HashMap) {
    const newHashMap = new Map();
    for (const [key, value] of ast.hashMap) {
      newHashMap.set(key, EVAL(value, env));
    }
    return new HashMap(newHashMap);
  }

  return ast;
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }
  const [firstElement] = ast.ast;

  if (firstElement.symbol === 'def!') {
    if (ast.ast.length != 3) {
      throw 'incorrect number of argument to def!';
    }
    return env.set(ast.ast[1], EVAL(ast.ast[2], env));
  }

  if (firstElement.symbol === 'let*') {
    const newEnv = new Env(env);
    const bindings = ast.ast[1].ast;
    for (let i = 0; i < bindings.length; i += 2) {
      newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
    }
    return EVAL(ast.ast[2], newEnv);
  }

  if (firstElement.symbol === 'do') {
    return ast.ast.slice(1).reduce((_, b) => EVAL(b, env), null);
  }

  if (firstElement.symbol === 'if') {
    const expression = EVAL(ast.ast[1], env);
    if (expression == false || expression === Nil) {
      return EVAL(ast.ast[3], env);
    }
    return EVAL(ast.ast[2], env);
  }

  if (firstElement.symbol === 'fn*') {
    return function (...exprs) {
      const newEnv = Env.createEnv(env, ast.ast[1].ast, exprs);
      return EVAL(ast.ast[2], newEnv);
    };
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (!fn instanceof Function) {
    throw `${fn} is not a function`;
  }
  return fn.apply(null, args);
};

const PRINT = (str, print_readably) => prn_str(str, print_readably);

const rep = (str) => PRINT(EVAL(READ(str), env), true);

const main = () => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
};

main();
