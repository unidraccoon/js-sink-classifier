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
    (sinkType == "Identifier" &&
      (sinkBabelObject.name == "fetch" ||
        sinkBabelObject.name == "axios" ||
        sinkBabelObject.name == "$http")) ||
    (sinkType == "MemberExpression" &&
      LIBS.includes(sinkBabelObject.object.name) &&
      FUNCS.includes(sinkBabelObject.property.name))
  ) {
    let sinkName: string;
    if (sinkBabelObject.type == "Identifier") {
      sinkName = sinkBabelObject.name;
    } else {
      sinkName =
        sinkBabelObject.object.name + "." + sinkBabelObject.property.name;
    }

    return sinkName;
  } else {
    return false;
  }
}

function getArgumentsFromFunctionCall(args) {

}

function getSinksFromAST(ast) {
  traverse(ast, {
    CallExpression: function (path) {
      let sink: IFunctionCall = { args: [] };
      if ((sink.name = getFunctionNameFromSignature(path.node.callee))) {
        let sinkArguments = path.node.arguments;
        for (let i = 0; i < sinkArguments.length; i++) {
          // sink.args?.push(getArgumentsFromFunctionCall(sinkArguments[i]));
        }
        // result.push(obj);
      }
    },
  });
}

getSinksFromAST(make_AST());
