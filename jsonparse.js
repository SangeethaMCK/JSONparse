const jsonparse = (input) => {
  try {
    if (typeof input !== "string")
      throw new SyntaxError("Input is not a string");
    let value, remaining;
    if (([value, remaining] = valueparser(input)))
      if (remaining) throw new SyntaxError("Unexpected end of input");
    return value;
  } catch (e) {
    return e;
  }
};
const valueparser = (input) => {
  let value = [];
  input = input.trim();
  if ((value =
      nullparser(input) || boolparser(input) ||stringparser(input) ||numparser(input) ||arrayparser(input) ||objectparser(input)))
    return value;
  throw new Error("Not a valid input");
};
const objectparser = (input) => {
  if (!input.startsWith("{")) return null;
  let object = {};
  let key, value;
  let rest;

  input = input.slice(1);
  input = input.trim();

  while (input[0] !== "}") {         //input[0] is the 1st element of input
    [key, rest] = stringparser(input);
    if (key == undefined || key == null)
      throw new SyntaxError(" Expected property name or '}'");
    if (rest.trim().length === 0)
      throw new SyntaxError("Missing value after key");
    input = rest;
    input = input.trim();
    if (!input.startsWith(":"))
      throw new SyntaxError("Invalid Input Expected ':'");
    input = input.slice(1);
    input = input.trim();
    [value, rest] = valueparser(input);
    input = rest;
    object[key] = value;     // adding the parsed value into object
    input = input.trim();
    if(!input)
        throw new Error("Expected ',' or '}' after array element");
    if (input.startsWith(",")) {
      input = input.slice(1);
      input = input.trim();
      if (input.startsWith("}"))
        throw new SyntaxError("Expected double-quoted property name");
      else if (input.length == 0)
        throw new TypeError("Undefined is not iterable");
    } 
    else if (input.startsWith("}")) return [object, input.slice(1)];
    else {
      throw new SyntaxError("Invalid Input");
    }
  }
  return [object, input.slice(1)];
};
const arrayparser = (input) => {
  if (!input.startsWith("[")) return null;
  let value, rest;
  let arr = [];
  input = input.trim();
  input = input.slice(1);
  input = input.trim();
  while (input[0] !== "]") {                    //input[0] is the 1st element of input
    [value, rest] = valueparser(input);
    arr.push(value);
    input = rest;
    input = input.trim();
    if (!input) 
        throw new Error("Expected ',' or ']' after array element");
    if (input.startsWith(",")) {
        input = input.slice(1);
        input = input.trim();
        if (input.startsWith("]")) 
            throw new SyntaxError("Not a valid Input");
    } 
    else if (input.startsWith("]")) return [arr, input.slice(1)];
    else throw new SyntaxError("Expected ',' or ']' after array element");
  }
  return [arr, input.slice(1)];
};
const nullparser = (input) => {
  if (!input.startsWith(null)) return null;
  else return [null, input.slice(4)];
};
const boolparser = (input) => {
  if (input.startsWith("true")) return [true, input.slice(4)];
  else if (input.startsWith("false")) return [false, input.slice(5)];
  else return null;
};
const numparser = (input) => {
  input = input.trim();
  let regX = /(^-?[0-9]*\.?[0-9]+[Ee]?[-+]?[0-9]*)/;    
  if (!regX.test(input)) 
    return null;
  let num = input.match(regX);
    if (                                                                   //056, 09.43, 0. are not valid
      (input.startsWith(0) && input[1] != "." && num[0].length > 1) ||
      (input.startsWith(0) && input[1] == "." && num[0].length < 2)
    )
      throw new SyntaxError("Not a valid number");
    return [Number(num[0]), input.slice(num[0].length)];
  
};
const stringparser = (input) => {
  if (!input.startsWith('"')) return null;
    let string = "";
    let escapeChar = false;                            //if any escape char is found, changes to true
    let strPosition = 1;
    let str, rest;
    for (let index = 1; index < input.length; index++) {
      if (
        (input[index - 2] == "\\" && input[index - 1] == "\\" && input[index] == '"') ||       // to avoid \\"
        (input[index] == '"' && input[index - 1] != "\\")
      ) {
        [str, rest] = [input.slice(0, index), input.slice(index + 1)];
        break;
      }
    }
    while (strPosition < str.length) {
      const char = str[strPosition]; 
      if (escapeChar) {
        switch (char) {
          case '"':
            string += '"';
            break;
          case "\\":
            string += "\\\\";
            break;
          case "/":
            string += "/";
            break;
          case "b":
            string += "\\b";
            break;
          case "f":
            string += "\\f";
            break;
          case "n":
            string += "\\n";
            break;
          case "r":
            string += "\\r";
            break;
          case "t":
            string += "\\t";
            break;
          case "u": {
            const hexCodePoint = str.substring(strPosition + 1,strPosition + 5);           //it holds value like 0032 (\\u0032)
            const char_unicode = String.fromCharCode(parseInt(hexCodePoint, 16));    //converts unicode to a character
            string += char_unicode.toString();
            strPosition = strPosition + 4;                                               //to skip  4 digits of unicode
            break;
          }
          default:
            throw new SyntaxError("Invalid escape sequence");
        }
        escapeChar = false;                           //to change it for every loop
      } else if (char === '"') {
        break;
      } else if (char === "\\") {
        escapeChar = true;
      } else if(char.match(/[\n\t\r\f]/)){
       throw new SyntaxError("Bad control character in string literal");
      }else {
        string += char;
      }
      strPosition++;
    }
    return [string, rest];
};

let fs = require("fs");
    for(let i=1; i<=33; i++){
    let data1 = fs.readFileSync(`test/fail${i}.json`, "utf-8");
    let condition=jsonparse(data1.toString());
    if(condition instanceof Error){
      console.log('Fail Test '+i+' Passed')
    }else{
      console.error('Fail Test '+i+' Failed')
    }
    }
  for(let i=1; i<=5; i++){
    let data1 = fs.readFileSync(`test/pass${i}.json`, "utf-8");
    let condition=jsonparse(data1.toString());
    if(condition instanceof Error){
      console.error('Pass Test '+i+' Failed')
    }else{
      console.log('Pass Test '+i+' Passed')
    }
    }

  // let data1 = fs.readFileSync(`test/pass1.json`, "utf-8");
  // console.log(jsonparse(data1))
// console.log(jsonparse('{"name":"1234ssa"}'));
// console.log( jsonparse('{"true":'));