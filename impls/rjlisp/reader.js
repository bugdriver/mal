const {
  List,
  Vector,
  Nil,
  String,
  HashMap,
  Symbol,
  Keyword,
} = require('./types');

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    if (this.position < this.tokens.length) {
      this.position++;
    }
    return token;
  }
}

const tokenize = (str) => {
  const re =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(re)]
    .map((e) => e[1])
    .slice(0, -1)
    .filter((e) => !e.startsWith(';'));
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

const read_atom = (reader) => {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token);
  }
  if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    const str = token
      .slice(1, token.length - 1)
      .replace(/\\(.)/g, function (_, c) {
        return c === 'n' ? '\n' : c;
      });
    return new String(str);
  }
  if (token.startsWith('"')) {
    throw 'unbalanced';
  }
  if (token === 'true') {
    return true;
  }
  if (token === 'false') {
    return false;
  }
  if (token.startsWith(':')) {
    return new Keyword(token.slice(1));
  }
  if (token === 'nil') {
    return Nil;
  }
  return new Symbol(token);
};

const read_seq = (reader, closingSymbol) => {
  const ast = [];
  reader.next();
  while (reader.peek() != closingSymbol) {
    if (reader.peek() === undefined) {
      throw 'unbalanced';
    }
    ast.push(read_form(reader));
  }
  reader.next();
  return ast;
};

const read_list = (reader) => {
  const ast = read_seq(reader, ')');
  return new List(ast);
};

const read_vector = (reader) => {
  const ast = read_seq(reader, ']');
  return new Vector(ast);
};

const read_hash_map = (reader) => {
  const ast = read_seq(reader, '}');
  const hashMap = new Map();
  if (ast.length % 2 != 0) {
    throw 'odd number of arguments';
  }
  for (let i = 0; i < ast.length; i += 2) {
    if (!ast[i] instanceof String) {
      throw 'hashmap key is not String';
    }
    hashMap.set(ast[i], ast[i + 1]);
  }
  return new HashMap(hashMap);
};

const createQuotedList = (reader, token) => {
  const quotes = {
    "'": 'quote',
    '~': 'unquote',
    '~@': 'splice-unquote',
    '`': 'quasiquote',
    '@': 'deref',
  };
  reader.next();
  return new List([quotes[token], read_form(reader)]);
};

const read_form = (reader) => {
  const token = reader.peek();

  switch (token) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_hash_map(reader);
    case "'":
    case '~':
    case '~@':
    case '`':
    case '@':
      return createQuotedList(reader, token);
    default:
      return read_atom(reader);
  }
};

module.exports = { read_str };
