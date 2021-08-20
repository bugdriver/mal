class MalValue {
  constructor() {}
  prn_str(print_readably = false) {}
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  prn_str(print_readably = false) {
    return '(' + this.ast.map(prn_str).join(' ') + ')';
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

  isEmpty() {
    return this.ast.length == 0;
  }
}

class String extends MalValue {
  constructor(value) {
    super();
    this.value = value;
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
}

class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  prn_str(print_readably = false) {
    return ':' + this.keyword;
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }
  prn_str(print_readably = false) {
    return 'nil';
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
};
