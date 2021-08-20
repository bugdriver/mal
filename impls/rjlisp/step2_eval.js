const readline = require('readline');
const { read_str } = require('./reader');
const { prn_str } = require('./printer');
const {
  List,
  Vector,
  Nil,
  String,
  HashMap,
  Symbol,
  Keyword,
} = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  pi: Math.PI,
};

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    if (!env[ast.symbol]) {
      throw `${ast.symbol} Symbol not found`;
    }
    return env[ast.symbol];
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
    const newMap = new Map();
    for (const [key, value] of ast.hashMap) {
      newMap.set(key, EVAL(value, env));
    }
    return new HashMap(newMap);
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
