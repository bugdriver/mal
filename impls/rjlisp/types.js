class MalValue {
  constructor() {}
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  prn_str() {
    return '(' + this.ast.map(prn_str).join(' ') + ')';
  }
}

class HashMap extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  prn_str() {
    return '{' + this.ast.map(prn_str).join(' ') + '}';
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  prn_str() {
    return '[' + this.ast.map(prn_str).join(' ') + ']';
  }
}

class String extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  prn_str() {
    return '"' + this.value + '"';
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }
  prn_str() {
    return 'nil';
  }
}

const Nil = new NilValue();

const prn_str = (val) => {
  if (val instanceof MalValue) {
    return val.prn_str();
  }
  return val;
};

module.exports = { List, Vector, String, Nil, prn_str, HashMap };
