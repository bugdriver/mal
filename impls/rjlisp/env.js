const { Symbol } = require('./types');

class Env {
  constructor(outer = null) {
    this.outer = outer;
    this.data = new Map();
  }

  set(key, malValue) {
    if (!key instanceof Symbol) {
      throw 'key must be Symbol';
    }
    this.data.set(key.symbol, malValue);
    return malValue;
  }

  find(key) {
    if (!key instanceof Symbol) {
      throw 'key must be a Symbol';
    }
    if (this.data.has(key.symbol)) {
      return this;
    }
    if (this.outer) {
      return this.outer.find(key);
    }
    return null;
  }

  get(key) {
    if (!key instanceof Symbol) {
      throw 'key must be a Symbol';
    }
    const env = this.find(key);
    if (!env) {
      console.log(key);
      throw key.symbol + ' not found.';
    }
    return env.data.get(key.symbol);
  }

  static createEnv(outer = null, binds = [], exprs = []) {
    const env = new Env(outer);
    binds.forEach((symbol, index) => {
      env.set(symbol, exprs[index]);
    });
    return env;
  }
}

module.exports = { Env };
