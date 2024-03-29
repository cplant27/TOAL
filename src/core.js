import util from "util";

export class Program {
  constructor(statements) {
    this.statements = statements;
  }
}

export class Variable {
  constructor(name, readOnly, type) {
    Object.assign(this, { name, readOnly, type });
  }
}

export class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer });
  }
}

export class Assignment {
  constructor(target, value) {
    Object.assign(this, { target, value });
  }
}

export class ChangeVariable {
  constructor(op, term, target) {
    Object.assign(this, { op, term, target });
    this.type = Type.num;
  }
}

export class PrintStatement {
  constructor(argument) {
    Object.assign(this, { argument });
  }
}

export class Expression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
    this.type = Type.num;
  }
}

export class ParenthesesExpression {
  constructor(contents) {
    this.contents = contents;
    this.type = contents.type;
  }
}

export class BooleanExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
    this.type = Type.bool;
  }
}

export class Param {
  constructor(name, type) {
    Object.assign(this, { name, type });
  }
}

export class Automation {
  constructor(name, params, type) {
    Object.assign(this, { name, params, type });
  }
}

export class AutomationDeclaration {
  constructor(name, auto, params, output, body) {
    Object.assign(this, { name, auto, params, output, body });
  }
}

export class CallStatement {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
    this.type = callee.type;
  }
}

export class CallExpression {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
    this.type = callee.type;
  }
}

export class Output {
  constructor(value, type) {
    Object.assign(this, { value, type });
  }
}

export class IfStatement {
  constructor(test, body, alternate) {
    Object.assign(this, { test, body, alternate });
  }
}

export class ElseStatement {
  constructor(body) {
    this.body = body;
  }
}

export class WhileLoop {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}

export class ForLoop {
  constructor(tempVar, list, body) {
    Object.assign(this, { tempVar, list, body });
  }
}

export class Break {
  // Intentionally empty
}

export class List {
  constructor(elements) {
    this.elements = elements;
    this.type = Type.list;
  }
}

export class StringLiteral {
  constructor(contents) {
    this.contents = contents;
    this.type = Type.word;
  }
}

export class Type {
  static bool = new Type("boolean");
  static num = new Type("number");
  static word = new Type("word");
  static list = new Type("list");
  static any = new Type("any");
  static none = new Type("none");
  constructor(description) {
    Object.assign(this, { description });
  }

  static fromName(name) {
    switch (name) {
      case "bool":
        return Type.bool;
      case "num":
        return Type.num;
      case "word":
        return Type.word;
      case "list":
        return Type.list;
      case "any":
        return Type.any;
      case "none":
        return Type.none;
    }
  }
}

export const standardLibrary = Object.freeze({
  append: new Automation(
    "append",
    [
      new Variable("arg1", false, Type.any),
      new Variable("arg2", false, Type.any),
    ],
    Type.none
  ),
  remove: new Automation(
    "remove",
    [
      new Variable("arg1", false, Type.any),
      new Variable("arg2", false, Type.any),
    ],
    Type.none
  ),
  length: new Automation(
    "length",
    [new Variable("arg1", false, Type.any)],
    Type.num
  ),
  range: new Automation(
    "range",
    [
      new Variable("arg1", false, Type.any),
      new Variable("arg2", false, Type.any),
    ],
    Type.list
  ),
  type: new Automation(
    "type",
    [new Variable("arg1", false, Type.any)],
    Type.word
  ),
  π: new Variable("π", true, Type.num),
  inf: new Variable("inf", true, Type.num),
  true: new Variable("true", true, Type.bool),
  false: new Variable("false", true, Type.bool),
});

Number.prototype.type = Type.num;
Boolean.prototype.type = Type.bool;
String.prototype.type = Type.word;

Program.prototype[util.inspect.custom] = function () {
  const tags = new Map();

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return;
    tags.set(node, tags.size + 1);
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child);
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`;
      if (Array.isArray(e)) return `[${e.map(view)}]`;
      return util.inspect(e);
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name;
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`);
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
    }
  }

  tag(this);
  return [...lines()].join("\n");
};