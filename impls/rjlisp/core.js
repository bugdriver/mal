const { Env } = require('./env');
const { List, Symbol, String, Atom, Vector, MalValue } = require('./types');
const { read_str } = require('./reader');
const { readFileSync } = require('fs');

const cons = (element, list) => {
  return new List([element, ...list.ast]);
};

const concat = (...lists) => {
  const concatedList = lists.reduce(
    (firstList, secondList) => firstList.concat(secondList.ast),
    []
  );
  return new List(concatedList);
};

const funcMappings = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '=': (a, b) => {
    if (a instanceof MalValue && b instanceof MalValue) {
      return a.equals(b);
    }
    return a === b;
  },
  count: (a) => a.length,
  'list?': (a) => a instanceof List,
  list: (...elements) => new List([...elements]),
  pi: Math.PI,
  'read-string': (str) => {
    return read_str(str.value);
  },
  atom: (malValue) => new Atom(malValue),
  'atom?': (malValue) => malValue instanceof Atom,
  deref: (atom) => atom.get(),
  'reset!': (atom, malValue) => {
    atom.set(malValue);
    return malValue;
  },

  'swap!': (atom, func, ...args) => {
    func = func.fn || func;
    return atom.set(func(atom.get(), ...args));
  },
  print: (str) => console.log(str),
  str: (...strings) =>
    new String(
      strings
        .map((e) => {
          return e.value || e.symbol;
        })
        .join('')
    ),
  slurp: (str) => new String(readFileSync(str.value).toString()),
  cons: cons,
  concat: concat,
  vec: (list) => {
    console.log(list);
    return new Vector([...list.ast]);
  },
};

const loadEnv = () => {
  const env = new Env();
  Object.entries(funcMappings).forEach(([symbol, func]) =>
    env.set(new Symbol(symbol), func)
  );
  return env;
};
module.exports = { loadEnv };
