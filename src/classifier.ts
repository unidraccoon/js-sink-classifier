import * as parser from "@babel/parser";
import traverse, { NodePath, Scope } from "@babel/traverse";
import * as fs from "fs";

import { LIBS, FUNCS } from "./signatures";

interface IFunctionCall {
  name?: string | false;
  args?: string[];
}

function make_AST() {
  try {
    const data = fs.readFileSync(0).toString();
    const ast = parser.parse(data);

    // console.log(JSON.stringify(ast, null, 4));
    return ast;
  } catch {
    return 0;
  }
}

function getFunctionNameFromSignature(sinkBabelObject) {
  const sinkType: string = sinkBabelObject.type;
  if (
    (sinkType == 'Identifier' &&
      (sinkBabelObject.name == 'fetch' ||
        sinkBabelObject.name == 'axios' ||
        sinkBabelObject.name == '$http')) ||
    (sinkType == 'MemberExpression' &&
      LIBS.includes(sinkBabelObject.object.name) &&
      FUNCS.includes(sinkBabelObject.property.name))
  ) {
    let sinkName: string;
    if (sinkBabelObject.type == 'Identifier') {
      sinkName = sinkBabelObject.name;
    } else {
      sinkName =
        sinkBabelObject.object.name + '.' + sinkBabelObject.property.name;
    }

    return sinkName;
  } else {
    return false;
  }
}

function parseArgument(arg) {
  if (arg.type == 'BinaryExpression') {
    // return {"BinaryExpression": [parseArgument(arg.left), parseArgument(arg.right)]}
    return 'UNKNOWN';
  }

  if (arg.type == 'ObjectExpression') {
    // let types = [];
    // for (let i = 0; i < arg.properties.length; i++) {
    //   types.push([
    //     checkKey(arg.properties[i].key),
    //     parseArgument(arg.properties[i].value),
    //   ]);
    // }
    // return { ObjectExpression: types };
    return 'UNKNOWN';
  }

  if (arg.type == 'ArrayExpression') {
    // let types = [];
    // for (let i = 0; i < arg.elements.length; i++) {
    //   types.push(parseArgument(arg.elements[i]));
    // }
    // return { ArrayExpression: types };
    return 'UNKNOWN';
  }

  if (arg.type == 'MemberExpression') {
    // return arg.property.type;
    return 'UNKNOWN';
  }

  if (arg.type == 'StringLiteral')

  return arg.type;
}

function getArgumentsFromFunctionCall(sinkArguments) {
  let args: string[] = [];
  for (let i = 0; i < sinkArguments.length; i++) {
    args.push(parseArgument(sinkArguments[i]));
  }
  return args;
}

function getSinksFromAST(ast) {
  traverse(ast, {
    CallExpression: function (path) {
      let sink: IFunctionCall = { args: [] };
      if ((sink.name = getFunctionNameFromSignature(path.node.callee))) {
        let sinkArguments = path.node.arguments;
        sink.args = getArgumentsFromFunctionCall(sinkArguments);

        // result.push(obj);
        console.log(sink);
      }
    },
  });
}

getSinksFromAST(make_AST());
