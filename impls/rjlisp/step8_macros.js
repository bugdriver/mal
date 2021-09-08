const readline = require('readline');
const { read_str } = require('./reader');
const { prn_str } = require('./printer');
const { loadEnv } = require('./core');
const { Env } = require('./env');
const { List, Vector, HashMap, Symbol, Nil, Fn } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = loadEnv();
env.set(new Symbol('eval'), (ast) => EVAL(ast, env));

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

const quasiquote = (ast) => {
  if (ast instanceof List && ast.beginsWith('unquote')) {
    return ast.ast[1];
  }

  if (ast instanceof List) {
    let result = new List([]);
    for (let i = ast.ast.length - 1; i >= 0; i--) {
      const elt = ast.ast[i];
      if (elt instanceof List && elt.beginsWith('splice-unquote')) {
        result = new List([new Symbol('concat'), elt.ast[1], result]);
      } else {
        result = new List([new Symbol('cons'), quasiquote(elt), result]);
      }
    }
    return result;
  }
  if (ast instanceof HashMap || ast instanceof Symbol) {
    return new List([new Symbol('quote'), ast]);
  }
  return ast;
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  while (true) {
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
      if (ast.ast.length != 3) {
        throw 'Incorrect number of arguments to let*';
      }
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;
      for (let i = 0; i < bindings.length; i += 2) {
        newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      }
      env = newEnv;
      ast = ast.ast[2];
      continue;
    }

    if (firstElement.symbol === 'do') {
      ast.ast.slice(1, -1).forEach((a) => EVAL(a, env));
      ast = ast.ast[ast.ast.length - 1];
      continue;
    }

    if (firstElement.symbol === 'if') {
      const expression = EVAL(ast.ast[1], env);
      if (expression == false || expression === Nil) {
        ast = ast.ast[3];
      } else {
        ast = ast.ast[2];
      }
      continue;
    }

    if (firstElement.symbol === 'quote') {
      return ast.ast[1];
    }

    if (firstElement.symbol === 'quasiquoteexpand') {
      return quasiquote(ast.ast[1]);
    }

    if (firstElement.symbol === 'quasiquote') {
      ast = quasiquote(ast.ast[1]);
      continue;
    }

    if (firstElement.symbol === 'fn*') {
      const closureFn = function (...exprs) {
        const newEnv = Env.createEnv(env, ast.ast[1].ast, exprs);
        return EVAL(ast.ast[2], newEnv);
      };
      return new Fn(ast.ast[2], ast.ast[1].ast, env, closureFn);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof Fn) {
      ast = fn.ast;
      env = Env.createEnv(fn.env, fn.params, args);
      continue;
    }

    if (fn instanceof Function) {
      return fn(...args);
    }
    throw `${fn} is not a function`;
  }
};

const PRINT = (str, print_readably) => prn_str(str, print_readably);
const rep = (str) => PRINT(EVAL(READ(str), env), true);

rep(
  '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

const run_repl = () => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      run_repl();
    }
  });
};

const main = () => {
  const [fileName, ...args] = process.argv.slice(2);
  env.set(new Symbol('*ARGV*'), new List(args));
  if (fileName) {
    console.log(rep(`(load-file "${fileName}")`));
    process.exit(0);
  } else {
    run_repl();
  }
};

main();
