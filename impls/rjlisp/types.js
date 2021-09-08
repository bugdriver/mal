const _ = require('lodash');
class MalValue {
  constructor() {}
  prn_str(print_readably = false) {}
  equals(other) {}
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  prn_str(print_readably = false) {
    return '(' + this.ast.map(prn_str).join(' ') + ')';
  }

  beginsWith(symbol) {
    return !this.isEmpty() && this.ast[0].symbol === symbol;
  }

  equals(other) {
    if (!other instanceof List) return false;
    return _.isEqual(this.ast, other.ast);
  }

  isEmpty() {
    return this.ast.length == 0;
  }
}

class HashMap extends MalValue {
  constructor(hashMap) {
    super();
    this.hashMap = hashMap;
  }

  equals(other) {
    if (!other instanceof HashMap) return false;
    return _.isEqual(this.hashMap, other.hashMap);
  }

  prn_str(print_readably = false) {
    let str = '';
    let seperator = '';
    for (const [key, value] of this.hashMap) {
      str +=
        seperator +
        prn_str(key, print_readably) +
        ' ' +
        prn_str(value, print_readably);
      seperator = ' ';
    }
    return `{${str}}`;
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  prn_str(print_readably = false) {
    return '[' + this.ast.map(prn_str).join(' ') + ']';
  }

  equals(other) {
    if (!other instanceof Vector) return false;
    return _.isEqual(this.ast, other.ast);
  }

  isEmpty() {
    return this.ast.length == 0;
  }
}

class String extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  equals(other) {
    if (!other instanceof String) return false;
    return _.isEqual(this.value, other.value);
  }

  prn_str(print_readably = false) {
    if (print_readably) {
      return (
        '"' +
        this.value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n') +
        '"'
      );
    }
    return '"' + this.value + '"';
  }
}

class Symbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  prn_str(print_readably = false) {
    return this.symbol;
  }

  equals(other) {
    if (!other instanceof Symbol) return false;
    return _.isEqual(this.symbol, other.symbol);
  }
}

class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  prn_str(print_readably = false) {
    return ':' + this.keyword;
  }

  equals(other) {
    if (!other instanceof Keyword) return false;
    return _.isEqual(this.keyword, other.keyword);
  }
}

class Fn extends MalValue {
  constructor(ast, params, env, fn, isMacro = false) {
    super();
    this.ast = ast;
    this.params = params;
    this.env = env;
    this.fn = fn;
    this.isMacro = isMacro;
  }

  equals(other) {
    if (!other instanceof Fn) return false;
    return _.isEqual(this.ast, other.ast);
  }

  prn_str(print_readably = false) {
    return '#<function>';
  }
}

class Atom extends MalValue {
  constructor(malValue) {
    super();
    this.malValue = malValue;
  }
  get() {
    return this.malValue;
  }
  equals(other) {
    if (!other instanceof Atom) return false;
    return this.malValue.equals(other.malValue);
  }
  set(malValue) {
    return (this.malValue = malValue);
  }
  prn_str(print_readably = false) {
    return '(atom ' + prn_str(this.malValue, print_readably) + ')';
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }
  prn_str(print_readably = false) {
    return 'nil';
  }
  equals(other) {
    return other === Nil;
  }
}

const Nil = new NilValue();

const prn_str = (val, print_readably) => {
  if (val instanceof MalValue) {
    return val.prn_str(print_readably);
  }
  return val;
};

module.exports = {
  List,
  Vector,
  String,
  Nil,
  prn_str,
  HashMap,
  Symbol,
  Keyword,
  Fn,
  Atom,
  MalValue,
};
