// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      // Module is the only 'upvar', which we provide directly. We also provide FS for legacy support.
      var evalled = eval('(function(Module, FS) { return function(' + args.join(',') + '){ ' + source + ' } })')(Module, typeof FS !== 'undefined' ? FS : null);
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          (((codePoint - 0x10000) / 0x400)|0) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+15)&-16); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;
Runtime['addFunction'] = Runtime.addFunction;
Runtime['removeFunction'] = Runtime.removeFunction;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = Runtime.stackAlloc((str.length << 2) + 1);
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    var func = getCFunc(ident);
    var cArgs = [];
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;


function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;


function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;


function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;


function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var final = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    final = parse();
  } catch(e) {
    final += '?';
  }
  if (final.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return final;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module['stackTrace'] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 64*1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(1835);
  /* global initializers */ __ATINIT__.push();
  

/* memory initializer */ allocate([0,0,33,16,66,32,99,48,132,64,165,80,198,96,231,112,8,129,41,145,74,161,107,177,140,193,173,209,206,225,239,241,49,18,16,2,115,50,82,34,181,82,148,66,247,114,214,98,57,147,24,131,123,179,90,163,189,211,156,195,255,243,222,227,98,36,67,52,32,4,1,20,230,100,199,116,164,68,133,84,106,165,75,181,40,133,9,149,238,229,207,245,172,197,141,213,83,54,114,38,17,22,48,6,215,118,246,102,149,86,180,70,91,183,122,167,25,151,56,135,223,247,254,231,157,215,188,199,196,72,229,88,134,104,167,120,64,8,97,24,2,40,35,56,204,201,237,217,142,233,175,249,72,137,105,153,10,169,43,185,245,90,212,74,183,122,150,106,113,26,80,10,51,58,18,42,253,219,220,203,191,251,158,235,121,155,88,139,59,187,26,171,166,108,135,124,228,76,197,92,34,44,3,60,96,12,65,28,174,237,143,253,236,205,205,221,42,173,11,189,104,141,73,157,151,126,182,110,213,94,244,78,19,62,50,46,81,30,112,14,159,255,190,239,221,223,252,207,27,191,58,175,89,159,120,143,136,145,169,129,202,177,235,161,12,209,45,193,78,241,111,225,128,16,161,0,194,48,227,32,4,80,37,64,70,112,103,96,185,131,152,147,251,163,218,179,61,195,28,211,127,227,94,243,177,2,144,18,243,34,210,50,53,66,20,82,119,98,86,114,234,181,203,165,168,149,137,133,110,245,79,229,44,213,13,197,226,52,195,36,160,20,129,4,102,116,71,100,36,84,5,68,219,167,250,183,153,135,184,151,95,231,126,247,29,199,60,215,211,38,242,54,145,6,176,22,87,102,118,118,21,70,52,86,76,217,109,201,14,249,47,233,200,153,233,137,138,185,171,169,68,88,101,72,6,120,39,104,192,24,225,8,130,56,163,40,125,203,92,219,63,235,30,251,249,139,216,155,187,171,154,187,117,74,84,90,55,106,22,122,241,10,208,26,179,42,146,58,46,253,15,237,108,221,77,205,170,189,139,173,232,157,201,141,38,124,7,108,100,92,69,76,162,60,131,44,224,28,193,12,31,239,62,255,93,207,124,223,155,175,186,191,217,143,248,159,23,110,54,126,85,78,116,94,147,46,178,62,209,14,240,30,0,85,86,3,89,12,15,90,90,15,12,89,3,86,85,0,101,48,51,102,60,105,106,63,63,106,105,60,102,51,48,101,102,51,48,101,63,106,105,60,60,105,106,63,101,48,51,102,3,86,85,0,90,15,12,89,89,12,15,90,0,85,86,3,105,60,63,106,48,101,102,51,51,102,101,48,106,63,60,105,12,89,90,15,85,0,3,86,86,3,0,85,15,90,89,12,15,90,89,12,86,3,0,85,85,0,3,86,12,89,90,15,106,63,60,105,51,102,101,48,48,101,102,51,105,60,63,106,106,63,60,105,51,102,101,48,48,101,102,51,105,60,63,106,15,90,89,12,86,3,0,85,85,0,3,86,12,89,90,15,12,89,90,15,85,0,3,86,86,3,0,85,15,90,89,12,105,60,63,106,48,101,102,51,51,102,101,48,106,63,60,105,3,86,85,0,90,15,12,89,89,12,15,90,0,85,86,3,102,51,48,101,63,106,105,60,60,105,106,63,101,48,51,102,101,48,51,102,60,105,106,63,63,106,105,60,102,51,48,101,0,85,86,3,89,12,15,90,90,15,12,89,3,86,85,0,32,83,116,97,114,116,32,101,114,114,111,114,44,32,37,100,32,10,0,0,0,0,0,0,82,73,70,70,0,0,0,0,87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,0,0,0,0,0,0,0,0,37,99,37,99,37,99,37,99,10,0,0,0,0,0,0,0,99,95,115,105,122,101,61,37,100,10,0,0,0,0,0,0,100,97,116,97,0,0,0,0,75,79,82,71,32,83,89,83,84,69,77,32,70,73,76,69,0,0,0,0,0,0,0,0,0,0,129,90,255,127,129,90,0,0,127,165,1,128,127,165,32,78,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,32,102,111,114,32,119,114,105,116,101,32,102,105,108,101,46,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,32,116,111,32,115,101,116,117,112,32,102,105,108,101,46,32,0,0,0,0,0,0,0,111,107,46,0,0,0,0,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,105,108,108,101,103,97,108,32,39,100,97,116,97,39,32,99,104,117,110,107,32,115,105,122,101,46,0,0,0,0,0,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,39,100,97,116,97,39,32,99,104,117,110,107,32,110,111,116,32,102,111,117,110,100,46,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,98,105,116,32,109,117,115,116,32,98,101,32,49,54,32,111,114,32,50,52,46,0,0,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,99,104,97,110,110,101,108,32,109,117,115,116,32,98,101,32,49,32,111,114,32,50,46,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,101,110,99,111,100,101,32,109,117,115,116,32,98,101,32,39,49,39,46,0,0,0,0,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,39,87,65,86,69,39,32,111,114,32,39,102,109,116,32,39,32,105,115,32,110,111,116,32,102,111,117,110,100,46,0,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,39,82,73,70,70,39,32,105,115,32,110,111,116,32,102,111,117,110,100,46,0,0,0,0,119,97,118,32,102,105,108,101,32,101,114,114,111,114,44,32,116,111,111,32,115,109,97,108,108,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (node.contents && node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return (Math.random()*256)|0; };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        // If Module['websocket'] has already been defined (e.g. for configuring
        // the subprotocol/url) use that, if not initialise it to a new object.
        Module['websocket'] = (Module['websocket'] && 
                               ('object' === typeof Module['websocket'])) ? Module['websocket'] : {};
  
        // Add the Event registration mechanism to the exported websocket configuration
        // object so we can register network callbacks from native JavaScript too.
        // For more documentation see system/include/emscripten/emscripten.h
        Module['websocket']._callbacks = {};
        Module['websocket']['on'] = function(event, callback) {
  	    if ('function' === typeof callback) {
  		  this._callbacks[event] = callback;
          }
  	    return this;
        };
  
        Module['websocket'].emit = function(event, param) {
  	    if ('function' === typeof this._callbacks[event]) {
  		  this._callbacks[event].call(this, param);
          }
        };
  
        // If debug is enabled register simple default logging callbacks for each Event.
  
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          error: null, // Used in getsockopt for SOL_SOCKET/SO_ERROR test
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                var parts = addr.split('/');
                url = url + parts[0] + ":" + port + "/" + parts.slice(1).join('/');
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
  
            Module['websocket'].emit('open', sock.stream.fd);
  
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
            Module['websocket'].emit('message', sock.stream.fd);
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('close', function() {
              Module['websocket'].emit('close', sock.stream.fd);
            });
            peer.socket.on('error', function(error) {
              // Although the ws library may pass errors that may be more descriptive than
              // ECONNREFUSED they are not necessarily the expected error code e.g. 
              // ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
              // is still probably the most useful thing to do.
              sock.error = ERRNO_CODES.ECONNREFUSED; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onclose = function() {
              Module['websocket'].emit('close', sock.stream.fd);
            };
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
            peer.socket.onerror = function(error) {
              // The WebSocket spec only allows a 'simple event' to be thrown on error,
              // so we only really know as much as ECONNREFUSED.
              sock.error = ERRNO_CODES.ECONNREFUSED; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          Module['websocket'].emit('listen', sock.stream.fd); // Send Event with listen fd.
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
              Module['websocket'].emit('connection', newsock.stream.fd);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
              Module['websocket'].emit('connection', sock.stream.fd);
            }
          });
          sock.server.on('closed', function() {
            Module['websocket'].emit('close', sock.stream.fd);
            sock.server = null;
          });
          sock.server.on('error', function(error) {
            // Although the ws library may pass errors that may be more descriptive than
            // ECONNREFUSED they are not necessarily the expected error code e.g. 
            // ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
            // is still probably the most useful thing to do. This error shouldn't
            // occur in a well written app as errors should get trapped in the compiled
            // app's own getaddrinfo call.
            sock.error = ERRNO_CODES.EHOSTUNREACH; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
            Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'EHOSTUNREACH: Host is unreachable']);
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return (bytesWritten / size)|0;
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)>>0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_memset"] = _memset;

  function ___errno_location() {
      return ___errno_state;
    }

  function _abort() {
      Module['abort']();
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = event.wheelDelta;
            break;
          case 'wheel': 
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }


  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


  var Math_min = Math.min;
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'use asm';
    
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);

  
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = +env.NaN, inf = +env.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var Math_min=env.min;
  var _puts=env._puts;
  var _fflush=env._fflush;
  var __formatString=env.__formatString;
  var _fputc=env._fputc;
  var _send=env._send;
  var _pwrite=env._pwrite;
  var _fputs=env._fputs;
  var _abort=env._abort;
  var ___setErrNo=env.___setErrNo;
  var _fwrite=env._fwrite;
  var _sbrk=env._sbrk;
  var _printf=env._printf;
  var _mkport=env._mkport;
  var __reallyNegative=env.__reallyNegative;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var _write=env._write;
  var _fprintf=env._fprintf;
  var _sysconf=env._sysconf;
  var ___errno_location=env.___errno_location;
  var _time=env._time;
  var tempFloat = 0.0;

  // EMSCRIPTEN_START_FUNCS
  function stackAlloc(size) {
    size = size|0;
    var ret = 0;
    ret = STACKTOP;
    STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 15)&-16;

    return ret|0;
  }
  function stackSave() {
    return STACKTOP|0;
  }
  function stackRestore(top) {
    top = top|0;
    STACKTOP = top;
  }

  function setThrew(threw, value) {
    threw = threw|0;
    value = value|0;
    if ((__THREW__|0) == 0) {
      __THREW__ = threw;
      threwValue = value;
    }
  }
  function copyTempFloat(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  }
  function copyTempDouble(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
    HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
    HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
    HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
    HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
  }
  function setTempRet0(value) {
    value = value|0;
    tempRet0 = value;
  }
  function getTempRet0() {
    return tempRet0|0;
  }
  
function _SyroFunc_CalculateCrc16($pSrc,$size) {
 $pSrc = $pSrc|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $and = 0, $arrayidx = 0, $cmp5 = 0, $conv1 = 0, $conv2 = 0, $conv3 = 0, $conv6 = 0, $crc$0$lcssa = 0, $crc$08 = 0, $exitcond = 0, $i$06 = 0, $inc = 0, $incdec$ptr = 0, $pSrc$addr$07 = 0, $shr4 = 0, $xor = 0, $xor5 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $cmp5 = ($size|0)>(0);
 if ($cmp5) {
  $crc$08 = 65535;$i$06 = 0;$pSrc$addr$07 = $pSrc;
 } else {
  $crc$0$lcssa = -1;
  STACKTOP = sp;return ($crc$0$lcssa|0);
 }
 while(1) {
  $incdec$ptr = (($pSrc$addr$07) + 1|0);
  $0 = HEAP8[$pSrc$addr$07>>0]|0;
  $conv1 = $crc$08 & 65535;
  $shr4 = $conv1 >>> 8;
  $conv2 = $0&255;
  $xor = $conv2 ^ $shr4;
  $arrayidx = (8 + ($xor<<1)|0);
  $1 = HEAP16[$arrayidx>>1]|0;
  $conv3 = $1&65535;
  $and = $conv1 << 8;
  $xor5 = $conv3 ^ $and;
  $inc = (($i$06) + 1)|0;
  $exitcond = ($inc|0)==($size|0);
  if ($exitcond) {
   break;
  } else {
   $crc$08 = $xor5;$i$06 = $inc;$pSrc$addr$07 = $incdec$ptr;
  }
 }
 $conv6 = $xor5&65535;
 $crc$0$lcssa = $conv6;
 STACKTOP = sp;return ($crc$0$lcssa|0);
}
function _SyroFunc_CalculateEcc($pSrc,$size) {
 $pSrc = $pSrc|0;
 $size = $size|0;
 var $$or3749 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $and = 0, $and2143$1 = 0, $and2143$2 = 0, $and2143$3 = 0, $and3246$1 = 0, $and3246$2 = 0, $and3246$3 = 0, $and5536 = 0, $and5536$1 = 0, $and5536$2 = 0, $and5536$3 = 0, $and6838 = 0, $and6838$1 = 0, $and6838$2 = 0, $and6838$3 = 0, $arrayidx = 0;
 var $arrayidx1 = 0, $cmp60 = 0, $conv12 = 0, $conv14 = 0, $conv7 = 0, $conv85 = 0, $conv88 = 0, $conv9 = 0, $conv90 = 0, $conv93 = 0, $ecc1$0$or50$1 = 0, $ecc1$0$or50$2 = 0, $ecc1$0$or50$3 = 0, $ecc1$2$398103114119 = 0, $ecc2$0$or6042$1 = 0, $ecc2$0$or6042$2 = 0, $ecc2$0$or6042$3 = 0, $ecc2$2$3 = 0, $ecc_reg1$0$lcssa6877829195106111120 = 0, $ecc_reg1$063 = 0;
 var $ecc_reg2$061 = 0, $ecc_reg2$1 = 0, $ecc_reg3$062 = 0, $ecc_reg3$1 = 0, $exitcond = 0, $i$064 = 0, $idxprom = 0, $inc = 0, $neg = 0, $or3749 = 0, $or86 = 0, $or91 = 0, $or94 = 0, $shl = 0, $shl92 = 0, $tobool = 0, $tobool33 = 0, $xor13 = 0, $xor51 = 0, $xor8 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 $cmp60 = ($size|0)>(0);
 if ($cmp60) {
  $ecc_reg1$063 = 0;$ecc_reg2$061 = 0;$ecc_reg3$062 = 0;$i$064 = 0;
 } else {
  $ecc1$2$398103114119 = 0;$ecc2$2$3 = 0;$ecc_reg1$0$lcssa6877829195106111120 = 0;
  $conv85 = $ecc_reg1$0$lcssa6877829195106111120&255;
  $shl = $conv85 << 10;
  $or86 = $shl & 64512;
  $conv90 = $ecc2$2$3&255;
  $conv88 = $conv90 | $or86;
  $or91 = $conv88 << 8;
  $conv93 = $ecc1$2$398103114119&255;
  $shl92 = $conv93 | $or91;
  $or94 = $shl92 | 196608;
  STACKTOP = sp;return ($or94|0);
 }
 while(1) {
  $arrayidx = (($pSrc) + ($i$064)|0);
  $0 = HEAP8[$arrayidx>>0]|0;
  $idxprom = $0&255;
  $arrayidx1 = (520 + ($idxprom)|0);
  $1 = HEAP8[$arrayidx1>>0]|0;
  $xor51 = $1 ^ $ecc_reg1$063;
  $and = $1 & 64;
  $tobool = ($and<<24>>24)==(0);
  if ($tobool) {
   $ecc_reg2$1 = $ecc_reg2$061;$ecc_reg3$1 = $ecc_reg3$062;
  } else {
   $conv7 = $ecc_reg3$062&255;
   $xor8 = $i$064 ^ $conv7;
   $conv9 = $xor8&255;
   $conv12 = $ecc_reg2$061&255;
   $neg = $conv12 ^ 255;
   $xor13 = $neg ^ $i$064;
   $conv14 = $xor13&255;
   $ecc_reg2$1 = $conv14;$ecc_reg3$1 = $conv9;
  }
  $inc = (($i$064) + 1)|0;
  $exitcond = ($inc|0)==($size|0);
  if ($exitcond) {
   break;
  } else {
   $ecc_reg1$063 = $xor51;$ecc_reg2$061 = $ecc_reg2$1;$ecc_reg3$062 = $ecc_reg3$1;$i$064 = $inc;
  }
 }
 $2 = $ecc_reg3$1 & -128;
 $tobool33 = ($ecc_reg2$1<<24>>24)>(-1);
 $or3749 = $2 | 64;
 $$or3749 = $tobool33 ? $2 : $or3749;
 $and2143$1 = ($ecc_reg3$1&255) >>> 1;
 $3 = $and2143$1 & 32;
 $ecc1$0$or50$1 = $3 | $$or3749;
 $and3246$1 = ($ecc_reg2$1&255) >>> 2;
 $4 = $and3246$1 & 16;
 $5 = $4 | $ecc1$0$or50$1;
 $and2143$2 = ($ecc_reg3$1&255) >>> 2;
 $6 = $and2143$2 & 8;
 $ecc1$0$or50$2 = $6 | $5;
 $and3246$2 = ($ecc_reg2$1&255) >>> 3;
 $7 = $and3246$2 & 4;
 $8 = $7 | $ecc1$0$or50$2;
 $and2143$3 = ($ecc_reg3$1&255) >>> 3;
 $9 = $and2143$3 & 2;
 $ecc1$0$or50$3 = $9 | $8;
 $and3246$3 = ($ecc_reg2$1&255) >>> 4;
 $10 = $and3246$3 & 1;
 $11 = $10 | $ecc1$0$or50$3;
 $and5536 = ($ecc_reg3$1 << 4)&255;
 $12 = $and5536 & -128;
 $and6838 = ($ecc_reg2$1 << 3)&255;
 $13 = $and6838 & 64;
 $14 = $13 | $12;
 $and5536$1 = ($ecc_reg3$1 << 3)&255;
 $15 = $and5536$1 & 32;
 $ecc2$0$or6042$1 = $15 | $14;
 $and6838$1 = ($ecc_reg2$1 << 2)&255;
 $16 = $and6838$1 & 16;
 $17 = $16 | $ecc2$0$or6042$1;
 $and5536$2 = ($ecc_reg3$1 << 2)&255;
 $18 = $and5536$2 & 8;
 $ecc2$0$or6042$2 = $18 | $17;
 $and6838$2 = ($ecc_reg2$1 << 1)&255;
 $19 = $and6838$2 & 4;
 $20 = $19 | $ecc2$0$or6042$2;
 $and5536$3 = ($ecc_reg3$1 << 1)&255;
 $21 = $and5536$3 & 2;
 $ecc2$0$or6042$3 = $21 | $20;
 $and6838$3 = $ecc_reg2$1 & 1;
 $22 = $and6838$3 | $ecc2$0$or6042$3;
 $ecc1$2$398103114119 = $11;$ecc2$2$3 = $22;$ecc_reg1$0$lcssa6877829195106111120 = $xor51;
 $conv85 = $ecc_reg1$0$lcssa6877829195106111120&255;
 $shl = $conv85 << 10;
 $or86 = $shl & 64512;
 $conv90 = $ecc2$2$3&255;
 $conv88 = $conv90 | $or86;
 $or91 = $conv88 << 8;
 $conv93 = $ecc1$2$398103114119&255;
 $shl92 = $conv93 | $or91;
 $or94 = $shl92 | 196608;
 STACKTOP = sp;return ($or94|0);
}
function _SyroFunc_SetTxSize($ptr,$size,$num_of_bytes) {
 $ptr = $ptr|0;
 $size = $size|0;
 $num_of_bytes = $num_of_bytes|0;
 var $cmp3 = 0, $conv = 0, $exitcond = 0, $i$06 = 0, $inc = 0, $incdec$ptr = 0, $ptr$addr$05 = 0, $shr = 0, $size$addr$04 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $cmp3 = ($num_of_bytes|0)>(0);
 if ($cmp3) {
  $i$06 = 0;$ptr$addr$05 = $ptr;$size$addr$04 = $size;
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $conv = $size$addr$04&255;
  $incdec$ptr = (($ptr$addr$05) + 1|0);
  HEAP8[$ptr$addr$05>>0] = $conv;
  $shr = $size$addr$04 >>> 8;
  $inc = (($i$06) + 1)|0;
  $exitcond = ($inc|0)==($num_of_bytes|0);
  if ($exitcond) {
   break;
  } else {
   $i$06 = $inc;$ptr$addr$05 = $incdec$ptr;$size$addr$04 = $shr;
  }
 }
 STACKTOP = sp;return;
}
function _SyroFunc_GenerateSingleCycle($psc,$write_page,$dat,$block) {
 $psc = $psc|0;
 $write_page = $write_page|0;
 $dat = $dat|0;
 $block = $block|0;
 var $$inc36 = 0, $$sub = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $LastPhase = 0, $LastPhase42 = 0, $add = 0, $add27 = 0, $and = 0, $and19 = 0, $and3 = 0, $arrayidx = 0, $arrayidx35 = 0, $call = 0, $cmp10 = 0, $cmp20 = 0;
 var $cmp37 = 0, $cond5 = 0, $conv = 0, $conv23 = 0, $conv28 = 0, $conv33 = 0, $conv7 = 0, $dat1$0 = 0, $div = 0, $div25 = 0, $exitcond = 0, $i$029 = 0, $inc = 0, $inc36 = 0, $inc41 = 0, $mul = 0, $mul1 = 0, $mul8 = 0, $phase$027 = 0, $shr26 = 0;
 var $sub = 0, $sub24 = 0, $sub26 = 0, $tobool = 0, $tobool4 = 0, $tobool9 = 0, $write_pos$028 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $mul = $write_page << 3;
 $tobool = ($write_page|0)==(0);
 $sub = (($mul) + -1)|0;
 $$sub = $tobool ? 15 : $sub;
 $conv = $dat&255;
 $shr26 = $conv >>> 1;
 $and = $shr26 & 3;
 $mul1 = $and << 1;
 $and3 = $conv & 1;
 $tobool4 = ($and3|0)!=(0);
 $cond5 = $tobool4 ? 16 : 4;
 $LastPhase = (($psc) + 32|0);
 $arrayidx = (($psc) + ($$sub<<1)|0);
 $i$029 = 0;$phase$027 = $mul1;$write_pos$028 = $mul;
 while(1) {
  $call = (_SyroFunc_GetSinValue($phase$027,$block)|0);
  $conv7 = $call << 16 >> 16;
  $mul8 = Math_imul($conv7, $cond5)|0;
  $div = (($mul8|0) / 24)&-1;
  $tobool9 = ($i$029|0)==(0);
  do {
   if ($tobool9) {
    $0 = HEAP32[$LastPhase>>2]|0;
    $cmp10 = ($and|0)==($0|0);
    if ($cmp10) {
     $dat1$0 = $div;
    } else {
     $1 = $0 & $shr26;
     $2 = $1 & 1;
     $3 = ($2|0)==(0);
     if ($3) {
      $4 = HEAP32[$LastPhase>>2]|0;
      $add = (($4) + 1)|0;
      $and19 = $add & 3;
      $cmp20 = ($and19|0)==($and|0);
      if (!($cmp20)) {
       $dat1$0 = $div;
       break;
      }
     }
     $5 = HEAP16[$arrayidx>>1]|0;
     $conv23 = $5 << 16 >> 16;
     $sub24 = (($div) - ($conv23))|0;
     $div25 = (($sub24|0) / 3)&-1;
     $sub26 = (($div) - ($div25))|0;
     $add27 = (($conv23) + ($div25))|0;
     $conv28 = $add27&65535;
     HEAP16[$arrayidx>>1] = $conv28;
     $dat1$0 = $sub26;
    }
   } else {
    $dat1$0 = $div;
   }
  } while(0);
  $conv33 = $dat1$0&65535;
  $inc = (($write_pos$028) + 1)|0;
  $arrayidx35 = (($psc) + ($write_pos$028<<1)|0);
  HEAP16[$arrayidx35>>1] = $conv33;
  $inc36 = (($phase$027) + 1)|0;
  $cmp37 = ($inc36|0)==(8);
  $$inc36 = $cmp37 ? 0 : $inc36;
  $inc41 = (($i$029) + 1)|0;
  $exitcond = ($inc41|0)==(8);
  if ($exitcond) {
   break;
  } else {
   $i$029 = $inc41;$phase$027 = $$inc36;$write_pos$028 = $inc;
  }
 }
 $LastPhase42 = (($psc) + 32|0);
 HEAP32[$LastPhase42>>2] = $and;
 STACKTOP = sp;return;
}
function _SyroFunc_GetSinValue($phase,$bData) {
 $phase = $phase|0;
 $bData = $bData|0;
 var $0 = 0, $1 = 0, $2 = 0, $add = 0, $arrayidx = 0, $cmp = 0, $cmp4 = 0, $conv = 0, $conv12 = 0, $div = 0, $div8 = 0, $mul = 0, $mul7 = 0, $ret$0 = 0, $sub = 0, $sub3 = 0, $sub9 = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $arrayidx = (912 + ($phase<<1)|0);
 $0 = HEAP16[$arrayidx>>1]|0;
 $conv = $0 << 16 >> 16;
 $tobool = ($bData|0)==(0);
 do {
  if ($tobool) {
   $ret$0 = $conv;
  } else {
   $1 = (($phase) + -1)|0;
   $cmp = ($1>>>0)<(3);
   if ($cmp) {
    $sub = (32767 - ($conv))|0;
    $mul = Math_imul($sub, $sub)|0;
    $div = (($mul>>>0) / 32767)&-1;
    $sub3 = (32767 - ($div))|0;
    $ret$0 = $sub3;
    break;
   }
   $2 = (($phase) + -5)|0;
   $cmp4 = ($2>>>0)<(3);
   if ($cmp4) {
    $add = (($conv) + 32767)|0;
    $mul7 = Math_imul($add, $add)|0;
    $div8 = (($mul7>>>0) / 32767)&-1;
    $sub9 = (($div8) + -32767)|0;
    $ret$0 = $sub9;
   } else {
    $ret$0 = $conv;
   }
  }
 } while(0);
 $conv12 = $ret$0&65535;
 STACKTOP = sp;return ($conv12|0);
}
function _SyroFunc_MakeGap($psc,$write_page) {
 $psc = $psc|0;
 $write_page = $write_page|0;
 var $arrayidx$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 _SyroFunc_GenerateSingleCycle($psc,$write_page,1,0);
 $arrayidx$1 = (($psc) + 40|0);
 _SyroFunc_GenerateSingleCycle($arrayidx$1,$write_page,1,0);
 STACKTOP = sp;return;
}
function _SyroFunc_MakeStartMark($psc,$write_page) {
 $psc = $psc|0;
 $write_page = $write_page|0;
 var $arrayidx = 0, $exitcond = 0, $indvars$iv = 0, $indvars$iv$next = 0, $lftr$wideiv = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $indvars$iv = 0;
 while(1) {
  $arrayidx = (($psc) + (($indvars$iv*40)|0)|0);
  _SyroFunc_GenerateSingleCycle($arrayidx,$write_page,5,0);
  _SyroFunc_SmoothStartMark($arrayidx,$write_page);
  $indvars$iv$next = (($indvars$iv) + 1)|0;
  $lftr$wideiv = $indvars$iv$next&255;
  $exitcond = ($lftr$wideiv<<24>>24)==(2);
  if ($exitcond) {
   break;
  } else {
   $indvars$iv = $indvars$iv$next;
  }
 }
 STACKTOP = sp;return;
}
function _SyroFunc_SmoothStartMark($psc,$write_page) {
 $psc = $psc|0;
 $write_page = $write_page|0;
 var $$sub = 0, $0 = 0, $1 = 0, $2 = 0, $add11 = 0, $add13 = 0, $add20 = 0, $add7 = 0, $add8 = 0, $add9 = 0, $arrayidx = 0, $arrayidx2 = 0, $arrayidx5 = 0, $conv = 0, $conv15 = 0, $conv18 = 0, $conv21 = 0, $conv3 = 0, $conv6 = 0, $div = 0;
 var $div10 = 0, $div12 = 0, $div14 = 0, $mul = 0, $sub = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $mul = $write_page << 3;
 $tobool = ($write_page|0)==(0);
 $sub = (($mul) + -1)|0;
 $$sub = $tobool ? 15 : $sub;
 $arrayidx = (($psc) + ($$sub<<1)|0);
 $0 = HEAP16[$arrayidx>>1]|0;
 $conv = $0 << 16 >> 16;
 $arrayidx2 = (($psc) + ($mul<<1)|0);
 $1 = HEAP16[$arrayidx2>>1]|0;
 $conv3 = $1 << 16 >> 16;
 $add20 = $mul | 1;
 $arrayidx5 = (($psc) + ($add20<<1)|0);
 $2 = HEAP16[$arrayidx5>>1]|0;
 $conv6 = $2 << 16 >> 16;
 $add7 = (($conv3) + ($conv))|0;
 $add8 = (($add7) + ($conv6))|0;
 $div = (($add8|0) / 3)&-1;
 $add9 = (($div) + ($conv))|0;
 $div10 = (($add9|0) / 2)&-1;
 $add11 = (($div) + ($conv3))|0;
 $div12 = (($add11|0) / 2)&-1;
 $add13 = (($conv6) + ($div))|0;
 $div14 = (($add13|0) / 2)&-1;
 $conv15 = $div10&65535;
 HEAP16[$arrayidx>>1] = $conv15;
 $conv18 = $div12&65535;
 HEAP16[$arrayidx2>>1] = $conv18;
 $conv21 = $div14&65535;
 HEAP16[$arrayidx5>>1] = $conv21;
 STACKTOP = sp;return;
}
function _SyroFunc_MakeChannelInfo($psc,$write_page) {
 $psc = $psc|0;
 $write_page = $write_page|0;
 var $arrayidx$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 _SyroFunc_GenerateSingleCycle($psc,$write_page,0,1);
 $arrayidx$1 = (($psc) + 40|0);
 _SyroFunc_GenerateSingleCycle($arrayidx$1,$write_page,1,1);
 STACKTOP = sp;return;
}
function _SyroVolcaSample_Start($pHandle,$pData,$NumOfData,$Flags,$pNumOfSyroFrame) {
 $pHandle = $pHandle|0;
 $pData = $pData|0;
 $NumOfData = $NumOfData|0;
 $Flags = $Flags|0;
 $pNumOfSyroFrame = $pNumOfSyroFrame|0;
 var $$off = 0, $$off110 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $CyclePos = 0, $CyclePos150 = 0, $Flags74 = 0, $NumOfData75 = 0, $Number = 0, $Number34 = 0, $Number52 = 0, $Number60 = 0, $Quality = 0, $Quality110 = 0, $Quality39 = 0, $SampleEndian = 0, $Size = 0;
 var $Size10 = 0, $Size103 = 0, $Size65 = 0, $Size87 = 0, $Size92 = 0, $add$ptr = 0, $add$ptr101 = 0, $add$ptr135 = 0, $add114 = 0, $add146 = 0, $add69 = 0, $and = 0, $arrayidx = 0, $arrayidx79 = 0, $arrayidx80 = 0, $call = 0, $call111 = 0, $call117 = 0, $call23 = 0, $call30 = 0;
 var $call48 = 0, $call56 = 0, $call66 = 0, $call66$pn = 0, $call70 = 0, $cmp = 0, $cmp1 = 0, $cmp11 = 0, $cmp1116 = 0, $cmp27 = 0, $cmp3 = 0, $cmp35 = 0, $cmp53 = 0, $cmp61 = 0, $cmp77 = 0, $cmp77112 = 0, $cmp93 = 0, $comp_buf = 0, $comp_endian$0 = 0, $comp_ofs$0 = 0;
 var $comp_org_size$0 = 0, $comp_org_size$0$in = 0, $comp_size = 0, $comp_src_adr$0 = 0, $frame_size$0$lcssa = 0, $frame_size$0117 = 0, $frame_size$1 = 0, $i$0118 = 0, $i$1113 = 0, $inc = 0, $inc141 = 0, $mul = 0, $or$cond = 0, $pData100 = 0, $pData131 = 0, $pData85 = 0, $phitmp = 0, $retval$0 = 0, $sub = 0, $sub113 = 0;
 var $tobool = 0, $tobool107 = 0, $tobool121 = 0, $tobool126 = 0, $tobool71 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $tobool = ($NumOfData|0)==(0);
 $cmp = ($NumOfData|0)>(109);
 $or$cond = $tobool | $cmp;
 if ($or$cond) {
  $retval$0 = 3;
  STACKTOP = sp;return ($retval$0|0);
 }
 $cmp1116 = ($NumOfData|0)>(0);
 do {
  if ($cmp1116) {
   $frame_size$0117 = 0;$i$0118 = 0;
   L5: while(1) {
    $arrayidx = (($pData) + (($i$0118*28)|0)|0);
    $0 = HEAP32[$arrayidx>>2]|0;
    switch ($0|0) {
    case 3:  {
     $Size = ((($pData) + (($i$0118*28)|0)|0) + 12|0);
     $1 = HEAP32[$Size>>2]|0;
     $cmp3 = ($1>>>0)<(16384);
     if ($cmp3) {
      $retval$0 = 2;
      label = 35;
      break L5;
     }
     $call = (_SyroVolcaSample_GetFrameSize_All($1)|0);
     $call66$pn = $call;
     break;
    }
    case 4:  {
     $Size10 = ((($pData) + (($i$0118*28)|0)|0) + 12|0);
     $2 = HEAP32[$Size10>>2]|0;
     $cmp11 = ($2>>>0)<(16384);
     if ($cmp11) {
      $retval$0 = 2;
      label = 35;
      break L5;
     }
     $Quality = ((($pData) + (($i$0118*28)|0)|0) + 16|0);
     $3 = HEAP32[$Quality>>2]|0;
     $$off110 = (($3) + -8)|0;
     $4 = ($$off110>>>0)>(8);
     if ($4) {
      $retval$0 = 5;
      label = 35;
      break L5;
     }
     $call23 = (_SyroVolcaSample_GetFrameSize_AllComp($arrayidx)|0);
     $call66$pn = $call23;
     break;
    }
    case 5:  {
     $Number = ((($pData) + (($i$0118*28)|0)|0) + 8|0);
     $5 = HEAP32[$Number>>2]|0;
     $cmp27 = ($5>>>0)>(9);
     if ($cmp27) {
      $retval$0 = 4;
      label = 35;
      break L5;
     }
     $call30 = (_SyroVolcaSample_GetFrameSize_Pattern()|0);
     $call66$pn = $call30;
     break;
    }
    case 1:  {
     $Number34 = ((($pData) + (($i$0118*28)|0)|0) + 8|0);
     $6 = HEAP32[$Number34>>2]|0;
     $cmp35 = ($6>>>0)>(99);
     if ($cmp35) {
      $retval$0 = 4;
      label = 35;
      break L5;
     }
     $Quality39 = ((($pData) + (($i$0118*28)|0)|0) + 16|0);
     $7 = HEAP32[$Quality39>>2]|0;
     $$off = (($7) + -8)|0;
     $8 = ($$off>>>0)>(8);
     if ($8) {
      $retval$0 = 5;
      label = 35;
      break L5;
     }
     $call48 = (_SyroVolcaSample_GetFrameSize_Sample_Comp($arrayidx)|0);
     $call66$pn = $call48;
     break;
    }
    case 2:  {
     $Number52 = ((($pData) + (($i$0118*28)|0)|0) + 8|0);
     $9 = HEAP32[$Number52>>2]|0;
     $cmp53 = ($9>>>0)>(99);
     if ($cmp53) {
      $retval$0 = 4;
      label = 35;
      break L5;
     }
     $call56 = (_SyroVolcaSample_GetFrameSize_Sample(0)|0);
     $call66$pn = $call56;
     break;
    }
    case 0:  {
     $Number60 = ((($pData) + (($i$0118*28)|0)|0) + 8|0);
     $10 = HEAP32[$Number60>>2]|0;
     $cmp61 = ($10>>>0)>(99);
     if ($cmp61) {
      $retval$0 = 4;
      label = 35;
      break L5;
     }
     $Size65 = ((($pData) + (($i$0118*28)|0)|0) + 12|0);
     $11 = HEAP32[$Size65>>2]|0;
     $call66 = (_SyroVolcaSample_GetFrameSize_Sample($11)|0);
     $call66$pn = $call66;
     break;
    }
    default: {
     $retval$0 = 1;
     label = 35;
     break L5;
    }
    }
    $frame_size$1 = (($call66$pn) + ($frame_size$0117))|0;
    $inc = (($i$0118) + 1)|0;
    $cmp1 = ($inc|0)<($NumOfData|0);
    if ($cmp1) {
     $frame_size$0117 = $frame_size$1;$i$0118 = $inc;
    } else {
     label = 19;
     break;
    }
   }
   if ((label|0) == 19) {
    $phitmp = (($frame_size$1) + 24000)|0;
    $frame_size$0$lcssa = $phitmp;
    break;
   }
   else if ((label|0) == 35) {
    STACKTOP = sp;return ($retval$0|0);
   }
  } else {
   $frame_size$0$lcssa = 24000;
  }
 } while(0);
 $mul = ($NumOfData*36)|0;
 $add69 = (($mul) + 444)|0;
 $call70 = (_malloc($add69)|0);
 $tobool71 = ($call70|0)==(0|0);
 if ($tobool71) {
  $retval$0 = 6;
  STACKTOP = sp;return ($retval$0|0);
 }
 $add$ptr = (($call70) + 444|0);
 _memset(($call70|0),0,($add69|0))|0;
 HEAP32[$call70>>2] = 1196576587;
 $Flags74 = (($call70) + 4|0);
 HEAP32[$Flags74>>2] = $Flags;
 $NumOfData75 = (($call70) + 16|0);
 HEAP32[$NumOfData75>>2] = $NumOfData;
 $cmp77112 = ($NumOfData|0)>(0);
 L38: do {
  if ($cmp77112) {
   $i$1113 = 0;
   while(1) {
    $arrayidx79 = (($add$ptr) + (($i$1113*36)|0)|0);
    $arrayidx80 = (($pData) + (($i$1113*28)|0)|0);
    ;HEAP32[$arrayidx79+0>>2]=HEAP32[$arrayidx80+0>>2]|0;HEAP32[$arrayidx79+4>>2]=HEAP32[$arrayidx80+4>>2]|0;HEAP32[$arrayidx79+8>>2]=HEAP32[$arrayidx80+8>>2]|0;HEAP32[$arrayidx79+12>>2]=HEAP32[$arrayidx80+12>>2]|0;HEAP32[$arrayidx79+16>>2]=HEAP32[$arrayidx80+16>>2]|0;HEAP32[$arrayidx79+20>>2]=HEAP32[$arrayidx80+20>>2]|0;HEAP32[$arrayidx79+24>>2]=HEAP32[$arrayidx80+24>>2]|0;
    $12 = HEAP32[$arrayidx80>>2]|0;
    do {
     if ((($12|0) == 1)) {
      $pData85 = ((($pData) + (($i$1113*28)|0)|0) + 4|0);
      $13 = HEAP32[$pData85>>2]|0;
      $Size87 = ((($pData) + (($i$1113*28)|0)|0) + 12|0);
      $14 = HEAP32[$Size87>>2]|0;
      $SampleEndian = ((($pData) + (($i$1113*28)|0)|0) + 24|0);
      $15 = HEAP32[$SampleEndian>>2]|0;
      $comp_endian$0 = $15;$comp_ofs$0 = 0;$comp_org_size$0$in = $14;$comp_src_adr$0 = $13;
      label = 27;
     } else if ((($12|0) == 4)) {
      $Size92 = ((($add$ptr) + (($i$1113*36)|0)|0) + 12|0);
      $16 = HEAP32[$Size92>>2]|0;
      $cmp93 = ($16|0)==(16384);
      if ($cmp93) {
       HEAP32[$arrayidx79>>2] = 3;
       break;
      } else {
       $pData100 = ((($pData) + (($i$1113*28)|0)|0) + 4|0);
       $17 = HEAP32[$pData100>>2]|0;
       $add$ptr101 = (($17) + 16384|0);
       $Size103 = ((($pData) + (($i$1113*28)|0)|0) + 12|0);
       $18 = HEAP32[$Size103>>2]|0;
       $sub = (($18) + -16384)|0;
       $comp_endian$0 = 0;$comp_ofs$0 = 16384;$comp_org_size$0$in = $sub;$comp_src_adr$0 = $add$ptr101;
       label = 27;
       break;
      }
     }
    } while(0);
    if ((label|0) == 27) {
     label = 0;
     $comp_org_size$0 = $comp_org_size$0$in >>> 1;
     $tobool107 = ($comp_org_size$0|0)==(0);
     if (!($tobool107)) {
      $Quality110 = ((($pData) + (($i$1113*28)|0)|0) + 16|0);
      $19 = HEAP32[$Quality110>>2]|0;
      $call111 = (_SyroComp_GetCompSize($comp_src_adr$0,$comp_org_size$0,$19,$comp_endian$0)|0);
      $sub113 = (($call111) + 255)|0;
      $and = $sub113 & -256;
      $add114 = (($and) + ($comp_ofs$0))|0;
      $comp_size = ((($add$ptr) + (($i$1113*36)|0)|0) + 32|0);
      HEAP32[$comp_size>>2] = $add114;
      $call117 = (_malloc($add114)|0);
      $comp_buf = ((($add$ptr) + (($i$1113*36)|0)|0) + 28|0);
      HEAP32[$comp_buf>>2] = $call117;
      $tobool121 = ($call117|0)==(0|0);
      if ($tobool121) {
       break;
      }
      _memset(($call117|0),0,($and|0))|0;
      $tobool126 = ($comp_ofs$0|0)==(0);
      if (!($tobool126)) {
       $20 = HEAP32[$comp_buf>>2]|0;
       $pData131 = ((($pData) + (($i$1113*28)|0)|0) + 4|0);
       $21 = HEAP32[$pData131>>2]|0;
       _memcpy(($20|0),($21|0),($comp_ofs$0|0))|0;
      }
      $22 = HEAP32[$comp_buf>>2]|0;
      $add$ptr135 = (($22) + ($comp_ofs$0)|0);
      $23 = HEAP32[$Quality110>>2]|0;
      (_SyroComp_Comp($comp_src_adr$0,$add$ptr135,$comp_org_size$0,$23,$comp_endian$0)|0);
     }
    }
    $inc141 = (($i$1113) + 1)|0;
    $cmp77 = ($inc141|0)<($NumOfData|0);
    if ($cmp77) {
     $i$1113 = $inc141;
    } else {
     break L38;
    }
   }
   _SyroVolcaSample_FreeCompressMemory($call70);
   _free($call70);
   $retval$0 = 6;
   STACKTOP = sp;return ($retval$0|0);
  }
 } while(0);
 _SyroVolcaSample_SetupNextData($call70);
 $CyclePos = (($call70) + 432|0);
 _SyroVolcaSample_CycleHandler($call70);
 $24 = HEAP32[$CyclePos>>2]|0;
 $add146 = (($24) + 8)|0;
 HEAP32[$CyclePos>>2] = $add146;
 _SyroVolcaSample_CycleHandler($call70);
 $CyclePos150 = (($call70) + 432|0);
 HEAP32[$CyclePos150>>2] = 0;
 HEAP32[$pHandle>>2] = $call70;
 HEAP32[$pNumOfSyroFrame>>2] = $frame_size$0$lcssa;
 $retval$0 = 0;
 STACKTOP = sp;return ($retval$0|0);
}
function _SyroVolcaSample_GetFrameSize_All($byte_size) {
 $byte_size = $byte_size|0;
 var $add4 = 0, $call = 0, $div = 0, $div3 = 0, $mul = 0, $sub = 0, $sub2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $sub = (($byte_size) + 255)|0;
 $div = $sub >>> 8;
 $call = (_SyroVolcaSample_GetFrameSize($div)|0);
 $sub2 = (($div) + 255)|0;
 $div3 = $sub2 >>> 8;
 $mul = ($div3*119720)|0;
 $add4 = (($call) + ($mul))|0;
 STACKTOP = sp;return ($add4|0);
}
function _SyroVolcaSample_GetFrameSize_AllComp($pdata) {
 $pdata = $pdata|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $Quality = 0, $Size = 0, $add$ptr = 0, $add15 = 0, $call = 0, $call3 = 0, $call7 = 0, $cmp = 0, $div = 0, $div11 = 0, $div14 = 0, $div6 = 0, $mul = 0, $pData = 0, $retval$0 = 0, $sub = 0;
 var $sub10 = 0, $sub13 = 0, $sub5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $Size = (($pdata) + 12|0);
 $0 = HEAP32[$Size>>2]|0;
 $cmp = ($0|0)==(16384);
 if ($cmp) {
  $call = (_SyroVolcaSample_GetFrameSize_All($0)|0);
  $retval$0 = $call;
  STACKTOP = sp;return ($retval$0|0);
 } else {
  $pData = (($pdata) + 4|0);
  $1 = HEAP32[$pData>>2]|0;
  $add$ptr = (($1) + 16384|0);
  $sub = (($0) + -16384)|0;
  $div = $sub >>> 1;
  $Quality = (($pdata) + 16|0);
  $2 = HEAP32[$Quality>>2]|0;
  $call3 = (_SyroComp_GetCompSize($add$ptr,$div,$2,0)|0);
  $sub5 = (($call3) + 16639)|0;
  $div6 = $sub5 >>> 8;
  $call7 = (_SyroVolcaSample_GetFrameSize($div6)|0);
  $3 = HEAP32[$Size>>2]|0;
  $sub10 = (($3) + 255)|0;
  $div11 = $sub10 >>> 8;
  $sub13 = (($div11) + 255)|0;
  $div14 = $sub13 >>> 8;
  $mul = ($div14*119720)|0;
  $add15 = (($mul) + ($call7))|0;
  $retval$0 = $add15;
  STACKTOP = sp;return ($retval$0|0);
 }
 return 0|0;
}
function _SyroVolcaSample_GetFrameSize_Pattern() {
 var $call = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $call = (_SyroVolcaSample_GetFrameSize(11)|0);
 STACKTOP = sp;return ($call|0);
}
function _SyroVolcaSample_GetFrameSize_Sample_Comp($pdata) {
 $pdata = $pdata|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $Quality = 0, $SampleEndian = 0, $Size = 0, $add7 = 0, $call = 0, $call2 = 0, $div = 0, $div1 = 0, $div6 = 0, $mul = 0, $pData = 0, $sub = 0, $sub5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $pData = (($pdata) + 4|0);
 $0 = HEAP32[$pData>>2]|0;
 $Size = (($pdata) + 12|0);
 $1 = HEAP32[$Size>>2]|0;
 $div = $1 >>> 1;
 $Quality = (($pdata) + 16|0);
 $2 = HEAP32[$Quality>>2]|0;
 $SampleEndian = (($pdata) + 24|0);
 $3 = HEAP32[$SampleEndian>>2]|0;
 $call = (_SyroComp_GetCompSize($0,$div,$2,$3)|0);
 $sub = (($call) + 255)|0;
 $div1 = $sub >>> 8;
 $call2 = (_SyroVolcaSample_GetFrameSize($div1)|0);
 $4 = HEAP32[$Size>>2]|0;
 $sub5 = (($4) + 4093)|0;
 $div6 = (($sub5>>>0) / 4094)&-1;
 $mul = ($div6*7720)|0;
 $add7 = (($mul) + ($call2))|0;
 STACKTOP = sp;return ($add7|0);
}
function _SyroVolcaSample_GetFrameSize_Sample($byte_size) {
 $byte_size = $byte_size|0;
 var $add4 = 0, $call = 0, $div = 0, $div3 = 0, $mul = 0, $sub = 0, $sub2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $sub = (($byte_size) + 255)|0;
 $div = $sub >>> 8;
 $call = (_SyroVolcaSample_GetFrameSize($div)|0);
 $sub2 = (($byte_size) + 4093)|0;
 $div3 = (($sub2>>>0) / 4094)&-1;
 $mul = ($div3*7720)|0;
 $add4 = (($mul) + ($call))|0;
 STACKTOP = sp;return ($add4|0);
}
function _SyroComp_GetCompSize($psrc,$num_of_sample,$quality,$sample_endian) {
 $psrc = $psrc|0;
 $num_of_sample = $num_of_sample|0;
 $quality = $quality|0;
 $sample_endian = $sample_endian|0;
 var $0 = 0, $NumOfSample = 0, $SampleEndian = 0, $add = 0, $add$ptr = 0, $add10 = 0, $add9 = 0, $allsize_byte$0 = 0, $bitlen_eff = 0, $call = 0, $call3 = 0, $cmp = 0, $cmp5 = 0, $div = 0, $mul = 0, $mul11 = 0, $mul7 = 0, $num_of_sample$addr$0 = 0, $num_of_sample$addr$0$ = 0, $retval$0 = 0;
 var $rp = 0, $sub = 0, $thissize_bit$0 = 0, $tobool = 0, $tobool13 = 0, $tobool4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $rp = sp;
 $call = (_malloc(2048)|0);
 $tobool = ($call|0)==(0|0);
 if ($tobool) {
  $retval$0 = 0;
  STACKTOP = sp;return ($retval$0|0);
 }
 HEAP32[$rp>>2] = $psrc;
 $bitlen_eff = (($rp) + 8|0);
 HEAP32[$bitlen_eff>>2] = $quality;
 $SampleEndian = (($rp) + 12|0);
 HEAP32[$SampleEndian>>2] = $sample_endian;
 $NumOfSample = (($rp) + 4|0);
 $allsize_byte$0 = 0;$num_of_sample$addr$0 = $num_of_sample;
 while(1) {
  $cmp = ($num_of_sample$addr$0>>>0)<(2048);
  $num_of_sample$addr$0$ = $cmp ? $num_of_sample$addr$0 : 2048;
  HEAP32[$NumOfSample>>2] = $num_of_sample$addr$0$;
  $call3 = (_SyroComp_MakeMap($call,$rp,0,0)|0);
  $tobool4 = ($call3|0)==(0);
  if ($tobool4) {
   label = 5;
  } else {
   $mul = Math_imul($num_of_sample$addr$0$, $quality)|0;
   $cmp5 = ($call3>>>0)<($mul>>>0);
   if ($cmp5) {
    $thissize_bit$0 = $call3;
   } else {
    label = 5;
   }
  }
  if ((label|0) == 5) {
   label = 0;
   $mul7 = Math_imul($num_of_sample$addr$0$, $quality)|0;
   $thissize_bit$0 = $mul7;
  }
  $add = (($thissize_bit$0) + 7)|0;
  $div = $add >>> 3;
  $add9 = (($allsize_byte$0) + 6)|0;
  $add10 = (($add9) + ($div))|0;
  $mul11 = $num_of_sample$addr$0$ << 1;
  $0 = HEAP32[$rp>>2]|0;
  $add$ptr = (($0) + ($mul11)|0);
  HEAP32[$rp>>2] = $add$ptr;
  $sub = (($num_of_sample$addr$0) - ($num_of_sample$addr$0$))|0;
  $tobool13 = ($num_of_sample$addr$0|0)==($num_of_sample$addr$0$|0);
  if ($tobool13) {
   break;
  } else {
   $allsize_byte$0 = $add10;$num_of_sample$addr$0 = $sub;
  }
 }
 _free($call);
 $retval$0 = $add10;
 STACKTOP = sp;return ($retval$0|0);
}
function _SyroVolcaSample_FreeCompressMemory($psm) {
 $psm = $psm|0;
 var $0 = 0, $1 = 0, $2 = 0, $NumOfData = 0, $add$ptr = 0, $cmp = 0, $cmp6 = 0, $comp_buf = 0, $i$07 = 0, $inc = 0, $incdec$ptr = 0, $psms$08 = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $NumOfData = (($psm) + 16|0);
 $0 = HEAP32[$NumOfData>>2]|0;
 $cmp6 = ($0|0)>(0);
 if (!($cmp6)) {
  STACKTOP = sp;return;
 }
 $add$ptr = (($psm) + 444|0);
 $i$07 = 0;$psms$08 = $add$ptr;
 while(1) {
  $comp_buf = (($psms$08) + 28|0);
  $1 = HEAP32[$comp_buf>>2]|0;
  $tobool = ($1|0)==(0|0);
  if (!($tobool)) {
   _free($1);
   HEAP32[$comp_buf>>2] = 0;
  }
  $incdec$ptr = (($psms$08) + 36|0);
  $inc = (($i$07) + 1)|0;
  $2 = HEAP32[$NumOfData>>2]|0;
  $cmp = ($inc|0)<($2|0);
  if ($cmp) {
   $i$07 = $inc;$psms$08 = $incdec$ptr;
  } else {
   break;
  }
 }
 STACKTOP = sp;return;
}
function _SyroComp_Comp($psrc,$pdest,$num_of_sample,$quality,$sample_endian) {
 $psrc = $psrc|0;
 $pdest = $pdest|0;
 $num_of_sample = $num_of_sample|0;
 $quality = $quality|0;
 $sample_endian = $sample_endian|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $BitBase = 0, $BitCount = 0, $ByteCount = 0, $NumOfSample = 0, $SampleEndian = 0, $add$pn = 0, $add$pn$in = 0, $add$ptr = 0, $add$ptr42 = 0, $bitlen_eff = 0;
 var $call = 0, $call14 = 0, $call3 = 0, $call47 = 0, $cmp = 0, $cmp4551 = 0, $cmp5 = 0, $conv10 = 0, $conv11 = 0, $conv16 = 0, $conv18 = 0, $conv23 = 0, $conv26 = 0, $conv32 = 0, $conv34 = 0, $conv37 = 0, $conv40 = 0, $conv56 = 0, $conv59 = 0, $count$0 = 0;
 var $count$1 = 0, $exitcond = 0, $i$052 = 0, $inc = 0, $incdec$ptr = 0, $incdec$ptr12 = 0, $incdec$ptr17 = 0, $incdec$ptr19 = 0, $incdec$ptr24 = 0, $incdec$ptr27$sum$pn = 0, $incdec$ptr33 = 0, $incdec$ptr35 = 0, $incdec$ptr38 = 0, $incdec$ptr41 = 0, $incdec$ptr57 = 0, $mul = 0, $num_of_sample$addr$0 = 0, $num_of_sample$addr$0$ = 0, $or = 0, $or31 = 0;
 var $pdest$addr$0 = 0, $pdest$addr$1 = 0, $retval$0 = 0, $rp = 0, $shl = 0, $shl39 = 0, $shr1549 = 0, $shr2250 = 0, $shr3045 = 0, $shr3646 = 0, $shr48 = 0, $shr5547 = 0, $sub = 0, $sub66 = 0, $sum = 0, $tobool = 0, $tobool4 = 0, $tobool49 = 0, $tobool68 = 0, $type = 0;
 var $wb = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $rp = sp + 32|0;
 $BitBase = sp + 16|0;
 $type = sp + 12|0;
 $wb = sp;
 $call = (_malloc(2048)|0);
 $tobool = ($call|0)==(0|0);
 if ($tobool) {
  $retval$0 = 0;
  STACKTOP = sp;return ($retval$0|0);
 }
 $bitlen_eff = (($rp) + 8|0);
 HEAP32[$bitlen_eff>>2] = $quality;
 $SampleEndian = (($rp) + 12|0);
 HEAP32[$SampleEndian>>2] = $sample_endian;
 HEAP32[$rp>>2] = $psrc;
 $NumOfSample = (($rp) + 4|0);
 $sum = (($rp) + 16|0);
 $BitCount = (($wb) + 4|0);
 $ByteCount = (($wb) + 8|0);
 $count$0 = 0;$num_of_sample$addr$0 = $num_of_sample;$pdest$addr$0 = $pdest;
 while(1) {
  $cmp = ($num_of_sample$addr$0|0)<(2048);
  $num_of_sample$addr$0$ = $cmp ? $num_of_sample$addr$0 : 2048;
  HEAP32[$NumOfSample>>2] = $num_of_sample$addr$0$;
  HEAP16[$sum>>1] = 0;
  $call3 = (_SyroComp_MakeMap($call,$rp,$BitBase,$type)|0);
  $tobool4 = ($call3|0)==(0);
  if ($tobool4) {
   label = 6;
  } else {
   $mul = Math_imul($num_of_sample$addr$0$, $quality)|0;
   $cmp5 = ($call3|0)<($mul|0);
   if ($cmp5) {
    $shr48 = $num_of_sample$addr$0$ >>> 8;
    $0 = HEAP32[$type>>2]|0;
    $shl = $0 << 5;
    $or = $shl | $shr48;
    $conv10 = $or&255;
    $incdec$ptr = (($pdest$addr$0) + 1|0);
    HEAP8[$pdest$addr$0>>0] = $conv10;
    $conv11 = $num_of_sample$addr$0$&255;
    $incdec$ptr12 = (($pdest$addr$0) + 2|0);
    HEAP8[$incdec$ptr>>0] = $conv11;
    $add$ptr = (($pdest$addr$0) + 6|0);
    $1 = HEAP32[$type>>2]|0;
    $call14 = (_SyroComp_CompBlock($call,$add$ptr,$rp,$BitBase,$1)|0);
    $shr1549 = $call14 >>> 8;
    $conv16 = $shr1549&255;
    $incdec$ptr17 = (($pdest$addr$0) + 3|0);
    HEAP8[$incdec$ptr12>>0] = $conv16;
    $conv18 = $call14&255;
    $incdec$ptr19 = (($pdest$addr$0) + 4|0);
    HEAP8[$incdec$ptr17>>0] = $conv18;
    $2 = HEAP16[$sum>>1]|0;
    $shr2250 = ($2&65535) >>> 8;
    $conv23 = $shr2250&255;
    $incdec$ptr24 = (($pdest$addr$0) + 5|0);
    HEAP8[$incdec$ptr19>>0] = $conv23;
    $3 = HEAP16[$sum>>1]|0;
    $conv26 = $3&255;
    HEAP8[$incdec$ptr24>>0] = $conv26;
    $add$pn$in = $call14;
   } else {
    label = 6;
   }
  }
  if ((label|0) == 6) {
   label = 0;
   $shr3045 = $num_of_sample$addr$0$ >>> 8;
   $or31 = $shr3045 | 224;
   $conv32 = $or31&255;
   $incdec$ptr33 = (($pdest$addr$0) + 1|0);
   HEAP8[$pdest$addr$0>>0] = $conv32;
   $conv34 = $num_of_sample$addr$0$&255;
   $incdec$ptr35 = (($pdest$addr$0) + 2|0);
   HEAP8[$incdec$ptr33>>0] = $conv34;
   $shr3646 = $num_of_sample$addr$0$ >>> 7;
   $conv37 = $shr3646&255;
   $incdec$ptr38 = (($pdest$addr$0) + 3|0);
   HEAP8[$incdec$ptr35>>0] = $conv37;
   $shl39 = $num_of_sample$addr$0$ << 1;
   $conv40 = $shl39&255;
   $incdec$ptr41 = (($pdest$addr$0) + 4|0);
   HEAP8[$incdec$ptr38>>0] = $conv40;
   $add$ptr42 = (($pdest$addr$0) + 6|0);
   HEAP32[$wb>>2] = $add$ptr42;
   HEAP32[$BitCount>>2] = 0;
   HEAP32[$ByteCount>>2] = 0;
   $cmp4551 = ($num_of_sample$addr$0$|0)>(0);
   if ($cmp4551) {
    $4 = ($num_of_sample$addr$0|0)<(2048);
    $5 = $4 ? $num_of_sample$addr$0 : 2048;
    $i$052 = 0;
    while(1) {
     $call47 = (_SyroComp_GetPcm($rp)|0);
     _SyroComp_WriteBit($wb,$call47,$quality);
     $inc = (($i$052) + 1)|0;
     $exitcond = ($inc|0)==($5|0);
     if ($exitcond) {
      break;
     } else {
      $i$052 = $inc;
     }
    }
   }
   $6 = HEAP32[$BitCount>>2]|0;
   $tobool49 = ($6|0)==(0);
   if (!($tobool49)) {
    $sub = (8 - ($6))|0;
    _SyroComp_WriteBit($wb,0,$sub);
   }
   $7 = HEAP16[$sum>>1]|0;
   $shr5547 = ($7&65535) >>> 8;
   $conv56 = $shr5547&255;
   $incdec$ptr57 = (($pdest$addr$0) + 5|0);
   HEAP8[$incdec$ptr41>>0] = $conv56;
   $8 = HEAP16[$sum>>1]|0;
   $conv59 = $8&255;
   HEAP8[$incdec$ptr57>>0] = $conv59;
   $9 = HEAP32[$ByteCount>>2]|0;
   $add$pn$in = $9;
  }
  $incdec$ptr27$sum$pn = (($add$pn$in) + 6)|0;
  $pdest$addr$1 = (($pdest$addr$0) + ($incdec$ptr27$sum$pn)|0);
  $add$pn = (($count$0) + 6)|0;
  $count$1 = (($add$pn) + ($add$pn$in))|0;
  $sub66 = (($num_of_sample$addr$0) - ($num_of_sample$addr$0$))|0;
  $tobool68 = ($num_of_sample$addr$0|0)==($num_of_sample$addr$0$|0);
  if ($tobool68) {
   break;
  } else {
   $count$0 = $count$1;$num_of_sample$addr$0 = $sub66;$pdest$addr$0 = $pdest$addr$1;
  }
 }
 _free($call);
 $retval$0 = $count$1;
 STACKTOP = sp;return ($retval$0|0);
}
function _SyroVolcaSample_SetupNextData($psm) {
 $psm = $psm|0;
 var $$ = 0, $$82 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $BlockLen1st = 0, $BlockLen1st51 = 0, $CompBlockPos = 0, $CurData = 0, $DataCount = 0, $DataSize = 0, $DataType = 0, $DeviceID = 0;
 var $EraseAlign = 0, $EraseCount = 0, $EraseCount81 = 0, $EraseLength = 0, $Fs = 0, $IsCompData = 0, $Misc = 0, $Misc13 = 0, $Misc49 = 0, $NumOfData = 0, $NumOfData100 = 0, $NumOfData55 = 0, $NumOfData85 = 0, $Number = 0, $Quality = 0, $Quality47 = 0, $SampleEndian = 0, $SampleEndian70 = 0, $Size = 0, $Size108 = 0;
 var $Size20 = 0, $Size62 = 0, $TaskCount = 0, $TaskStatus = 0, $TxBlockSize = 0, $add = 0, $add$ptr = 0, $add32 = 0, $add54 = 0, $add77 = 0, $add84 = 0, $add99 = 0, $arraydecay = 0, $arrayidx25 = 0, $block$0 = 0, $block$2 = 0, $block$3 = 0, $block$6 = 0, $cmp101 = 0, $cmp16 = 0;
 var $cmp56 = 0, $cmp86 = 0, $comp_buf = 0, $comp_buf41 = 0, $comp_size = 0, $comp_size43 = 0, $conv = 0, $conv12 = 0, $conv48 = 0, $conv59 = 0, $conv60 = 0, $conv68 = 0, $div = 0, $div67 = 0, $div80 = 0, $inc = 0, $inc$block$0 = 0, $m_Reserved = 0, $m_Reserved93 = 0, $m_Speed = 0;
 var $m_Speed94 = 0, $mul = 0, $or = 0, $pData = 0, $pSrcData = 0, $sub = 0, $sub78 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 $add$ptr = (($psm) + 444|0);
 $CurData = (($psm) + 20|0);
 $0 = HEAP32[$CurData>>2]|0;
 $arraydecay = (($psm) + 64|0);
 dest=$arraydecay+0|0; stop=dest+32|0; do { HEAP8[dest>>0]=0|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 dest=$arraydecay+0|0; src=888+0|0; stop=dest+16|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 $DeviceID = (($psm) + 80|0);
 HEAP32[$DeviceID>>2] = -16763976;
 $Number = ((($add$ptr) + (($0*36)|0)|0) + 8|0);
 $1 = HEAP32[$Number>>2]|0;
 $conv = $1&255;
 $2 = (($psm) + 85|0);
 HEAP8[$2>>0] = $conv;
 $SampleEndian = (($psm) + 60|0);
 HEAP32[$SampleEndian>>2] = 0;
 $TxBlockSize = (($psm) + 320|0);
 HEAP32[$TxBlockSize>>2] = 32;
 $pData = ((($add$ptr) + (($0*36)|0)|0) + 4|0);
 $3 = HEAP32[$pData>>2]|0;
 $pSrcData = (($psm) + 24|0);
 HEAP32[$pSrcData>>2] = $3;
 $Size = ((($add$ptr) + (($0*36)|0)|0) + 12|0);
 $4 = HEAP32[$Size>>2]|0;
 $DataSize = (($psm) + 32|0);
 HEAP32[$DataSize>>2] = $4;
 $DataCount = (($psm) + 28|0);
 HEAP32[$DataCount>>2] = 0;
 $IsCompData = (($psm) + 48|0);
 HEAP32[$IsCompData>>2] = 0;
 $CompBlockPos = (($psm) + 52|0);
 HEAP32[$CompBlockPos>>2] = 0;
 $EraseAlign = (($psm) + 36|0);
 HEAP32[$EraseAlign>>2] = 0;
 $EraseLength = (($psm) + 40|0);
 HEAP32[$EraseLength>>2] = 0;
 $DataType = (($add$ptr) + (($0*36)|0)|0);
 $5 = HEAP32[$DataType>>2]|0;
 switch ($5|0) {
 case 3:  {
  $Misc = (($psm) + 86|0);
  HEAP8[$Misc>>0] = -1;
  $block$0 = 1;
  label = 4;
  break;
 }
 case 4:  {
  $comp_buf = ((($add$ptr) + (($0*36)|0)|0) + 28|0);
  $6 = HEAP32[$comp_buf>>2]|0;
  HEAP32[$pSrcData>>2] = $6;
  $comp_size = ((($add$ptr) + (($0*36)|0)|0) + 32|0);
  $7 = HEAP32[$comp_size>>2]|0;
  HEAP32[$DataSize>>2] = $7;
  HEAP32[$IsCompData>>2] = 1;
  $Quality = ((($add$ptr) + (($0*36)|0)|0) + 16|0);
  $8 = HEAP32[$Quality>>2]|0;
  $conv12 = $8&255;
  $Misc13 = (($psm) + 86|0);
  HEAP8[$Misc13>>0] = $conv12;
  $BlockLen1st = (($psm) + 56|0);
  HEAP32[$BlockLen1st>>2] = 16384;
  $block$0 = 3;
  label = 4;
  break;
 }
 case 1:  {
  $comp_buf41 = ((($add$ptr) + (($0*36)|0)|0) + 28|0);
  $14 = HEAP32[$comp_buf41>>2]|0;
  HEAP32[$pSrcData>>2] = $14;
  $comp_size43 = ((($add$ptr) + (($0*36)|0)|0) + 32|0);
  $15 = HEAP32[$comp_size43>>2]|0;
  HEAP32[$DataSize>>2] = $15;
  HEAP32[$IsCompData>>2] = 1;
  $Quality47 = ((($add$ptr) + (($0*36)|0)|0) + 16|0);
  $16 = HEAP32[$Quality47>>2]|0;
  $conv48 = $16&255;
  $Misc49 = (($psm) + 86|0);
  HEAP8[$Misc49>>0] = $conv48;
  $BlockLen1st51 = (($psm) + 56|0);
  HEAP32[$BlockLen1st51>>2] = 0;
  $block$2 = 48;
  break;
 }
 case 0:  {
  $block$2 = 16;
  break;
 }
 case 2:  {
  $24 = HEAP32[$CurData>>2]|0;
  $add84 = (($24) + 1)|0;
  $NumOfData85 = (($psm) + 16|0);
  $25 = HEAP32[$NumOfData85>>2]|0;
  $cmp86 = ($add84|0)<($25|0);
  $$ = $cmp86 ? 17 : 16;
  $m_Reserved93 = (($psm) + 92|0);
  HEAP16[$m_Reserved93>>1] = -1;
  $m_Speed94 = (($psm) + 94|0);
  HEAP16[$m_Speed94>>1] = 16384;
  HEAP32[$pSrcData>>2] = 0;
  HEAP32[$DataSize>>2] = 0;
  $block$6 = $$;
  $29 = (($psm) + 84|0);
  HEAP8[$29>>0] = $block$6;
  $TaskStatus = (($psm) + 8|0);
  HEAP32[$TaskStatus>>2] = 0;
  $TaskCount = (($psm) + 12|0);
  HEAP32[$TaskCount>>2] = 10000;
  STACKTOP = sp;return;
  break;
 }
 case 5:  {
  $26 = HEAP32[$CurData>>2]|0;
  $add99 = (($26) + 1)|0;
  $NumOfData100 = (($psm) + 16|0);
  $27 = HEAP32[$NumOfData100>>2]|0;
  $cmp101 = ($add99|0)<($27|0);
  $$82 = $cmp101 ? 33 : 32;
  $Size108 = (($psm) + 88|0);
  $28 = HEAP32[$DataSize>>2]|0;
  _SyroFunc_SetTxSize($Size108,$28,4);
  $block$6 = $$82;
  $29 = (($psm) + 84|0);
  HEAP8[$29>>0] = $block$6;
  $TaskStatus = (($psm) + 8|0);
  HEAP32[$TaskStatus>>2] = 0;
  $TaskCount = (($psm) + 12|0);
  HEAP32[$TaskCount>>2] = 10000;
  STACKTOP = sp;return;
  break;
 }
 default: {
  $block$6 = 0;
  $29 = (($psm) + 84|0);
  HEAP8[$29>>0] = $block$6;
  $TaskStatus = (($psm) + 8|0);
  HEAP32[$TaskStatus>>2] = 0;
  $TaskCount = (($psm) + 12|0);
  HEAP32[$TaskCount>>2] = 10000;
  STACKTOP = sp;return;
 }
 }
 if ((label|0) == 4) {
  $9 = HEAP32[$CurData>>2]|0;
  $add = (($9) + 1)|0;
  $NumOfData = (($psm) + 16|0);
  $10 = HEAP32[$NumOfData>>2]|0;
  $cmp16 = ($add|0)<($10|0);
  $inc = $cmp16&1;
  $inc$block$0 = (($inc) + ($block$0))<<24>>24;
  $Size20 = (($psm) + 88|0);
  $11 = HEAP32[$Size>>2]|0;
  _SyroFunc_SetTxSize($Size20,$11,4);
  $arrayidx25 = (($psm) + 87|0);
  HEAP8[$arrayidx25>>0] = -1;
  HEAP8[$2>>0] = -1;
  HEAP32[$EraseAlign>>2] = 65536;
  HEAP32[$EraseLength>>2] = 15000;
  $12 = HEAP32[$Size>>2]|0;
  $13 = HEAP32[$EraseAlign>>2]|0;
  $add32 = (($12) + -1)|0;
  $sub = (($add32) + ($13))|0;
  $div = (($sub>>>0) / ($13>>>0))&-1;
  $EraseCount = (($psm) + 44|0);
  HEAP32[$EraseCount>>2] = $div;
  $block$6 = $inc$block$0;
  $29 = (($psm) + 84|0);
  HEAP8[$29>>0] = $block$6;
  $TaskStatus = (($psm) + 8|0);
  HEAP32[$TaskStatus>>2] = 0;
  $TaskCount = (($psm) + 12|0);
  HEAP32[$TaskCount>>2] = 10000;
  STACKTOP = sp;return;
 }
 $17 = HEAP32[$CurData>>2]|0;
 $add54 = (($17) + 1)|0;
 $NumOfData55 = (($psm) + 16|0);
 $18 = HEAP32[$NumOfData55>>2]|0;
 $cmp56 = ($add54|0)<($18|0);
 if ($cmp56) {
  $conv59 = $block$2&255;
  $or = $conv59 | 1;
  $conv60 = $or&255;
  $block$3 = $conv60;
 } else {
  $block$3 = $block$2;
 }
 $Size62 = (($psm) + 88|0);
 $19 = HEAP32[$Size>>2]|0;
 _SyroFunc_SetTxSize($Size62,$19,4);
 $m_Reserved = (($psm) + 92|0);
 HEAP16[$m_Reserved>>1] = -1;
 $Fs = ((($add$ptr) + (($0*36)|0)|0) + 20|0);
 $20 = HEAP32[$Fs>>2]|0;
 $mul = $20 << 14;
 $div67 = (($mul>>>0) / 31250)&-1;
 $conv68 = $div67&65535;
 $m_Speed = (($psm) + 94|0);
 HEAP16[$m_Speed>>1] = $conv68;
 $SampleEndian70 = ((($add$ptr) + (($0*36)|0)|0) + 24|0);
 $21 = HEAP32[$SampleEndian70>>2]|0;
 HEAP32[$SampleEndian>>2] = $21;
 HEAP32[$EraseAlign>>2] = 4094;
 HEAP32[$EraseLength>>2] = 1000;
 $22 = HEAP32[$Size>>2]|0;
 $23 = HEAP32[$EraseAlign>>2]|0;
 $add77 = (($22) + -1)|0;
 $sub78 = (($add77) + ($23))|0;
 $div80 = (($sub78>>>0) / ($23>>>0))&-1;
 $EraseCount81 = (($psm) + 44|0);
 HEAP32[$EraseCount81>>2] = $div80;
 $block$6 = $block$3;
 $29 = (($psm) + 84|0);
 HEAP8[$29>>0] = $block$6;
 $TaskStatus = (($psm) + 8|0);
 HEAP32[$TaskStatus>>2] = 0;
 $TaskCount = (($psm) + 12|0);
 HEAP32[$TaskCount>>2] = 10000;
 STACKTOP = sp;return;
}
function _SyroVolcaSample_CycleHandler($psm) {
 $psm = $psm|0;
 var $$pn = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $BlockLen1st = 0, $CompBlockPos = 0, $CurData = 0, $CyclePos = 0, $DataCount = 0, $DataSize = 0, $EraseAlign = 0, $EraseAlign89 = 0, $EraseCount = 0, $EraseLength = 0, $EraseLength57 = 0, $FrameCountInCycle = 0, $IsCompData = 0, $NumOfData = 0, $SampleEndian = 0, $TaskCount = 0, $TaskCount106 = 0, $TaskCount113 = 0, $TaskCount40 = 0, $TaskStatus = 0;
 var $TxBlockSize = 0, $add$ptr = 0, $add119 = 0, $add26 = 0, $add31 = 0, $add3478 = 0, $add37 = 0, $add54 = 0, $add66 = 0, $add72 = 0, $add76 = 0, $add80 = 0, $add81 = 0, $add82 = 0, $add98 = 0, $arraydecay = 0, $arraydecay112 = 0, $arraydecay4 = 0, $arraydecay8 = 0, $arrayidx = 0;
 var $arrayidx29 = 0, $arrayidx33 = 0, $arrayidx36 = 0, $arrayidx74 = 0, $arrayidx78 = 0, $call = 0, $cmp = 0, $cmp101 = 0, $cmp16 = 0, $cmp19 = 0, $cmp24 = 0, $cmp2479 = 0, $cmp55 = 0, $cmp87 = 0, $cmp90 = 0, $conv = 0, $conv79 = 0, $dec = 0, $dec114 = 0, $dec60 = 0;
 var $div = 0, $inc = 0, $or = 0, $org_len$0 = 0, $org_len$1 = 0, $pSrcData = 0, $pSrcData27 = 0, $pSrcData73 = 0, $pos$080 = 0, $rem = 0, $shl = 0, $size$0 = 0, $sub = 0, $tobool = 0, $tobool11 = 0, $tobool115 = 0, $tobool41 = 0, $tobool43 = 0, $tobool46 = 0, $tobool51 = 0;
 var $tobool62 = 0, $xor = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $CyclePos = (($psm) + 432|0);
 $0 = HEAP32[$CyclePos>>2]|0;
 $div = (($0|0) / 8)&-1;
 $xor = $div ^ 1;
 $TaskStatus = (($psm) + 8|0);
 $1 = HEAP32[$TaskStatus>>2]|0;
 L1: do {
  switch ($1|0) {
  case 2:  {
   $arraydecay8 = (($psm) + 352|0);
   _SyroFunc_MakeChannelInfo($arraydecay8,$xor);
   HEAP32[$TaskStatus>>2] = 3;
   break;
  }
  case 3:  {
   $call = (_SyroVolcaSample_MakeData($psm,$xor)|0);
   $tobool11 = ($call|0)==(0);
   if (!($tobool11)) {
    $DataCount = (($psm) + 28|0);
    $3 = HEAP32[$DataCount>>2]|0;
    $DataSize = (($psm) + 32|0);
    $4 = HEAP32[$DataSize>>2]|0;
    $cmp = ($3|0)<($4|0);
    if (!($cmp)) {
     $CurData = (($psm) + 20|0);
     $35 = HEAP32[$CurData>>2]|0;
     $inc = (($35) + 1)|0;
     HEAP32[$CurData>>2] = $inc;
     $NumOfData = (($psm) + 16|0);
     $36 = HEAP32[$NumOfData>>2]|0;
     $cmp101 = ($inc|0)<($36|0);
     if ($cmp101) {
      _SyroVolcaSample_SetupNextData($psm);
      break L1;
     } else {
      HEAP32[$TaskStatus>>2] = 4;
      $TaskCount106 = (($psm) + 12|0);
      HEAP32[$TaskCount106>>2] = 3000;
      break L1;
     }
    }
    $sub = (($4) - ($3))|0;
    $cmp16 = ($sub|0)>(255);
    if ($cmp16) {
     $size$0 = 256;
    } else {
     $5 = (($psm) + 64|0);
     _memset(($5|0),0,256)|0;
     $size$0 = $sub;
    }
    $SampleEndian = (($psm) + 60|0);
    $6 = HEAP32[$SampleEndian>>2]|0;
    $cmp19 = ($6|0)==(0);
    if ($cmp19) {
     $7 = (($psm) + 64|0);
     $pSrcData = (($psm) + 24|0);
     $8 = HEAP32[$pSrcData>>2]|0;
     $9 = HEAP32[$DataCount>>2]|0;
     $add$ptr = (($8) + ($9)|0);
     _memcpy(($7|0),($add$ptr|0),($size$0|0))|0;
    } else {
     $cmp2479 = ($size$0|0)>(0);
     if ($cmp2479) {
      $pSrcData27 = (($psm) + 24|0);
      $pos$080 = 0;
      while(1) {
       $10 = HEAP32[$DataCount>>2]|0;
       $add81 = $pos$080 | 1;
       $add26 = (($add81) + ($10))|0;
       $11 = HEAP32[$pSrcData27>>2]|0;
       $arrayidx = (($11) + ($add26)|0);
       $12 = HEAP8[$arrayidx>>0]|0;
       $arrayidx29 = ((($psm) + ($pos$080)|0) + 64|0);
       HEAP8[$arrayidx29>>0] = $12;
       $13 = HEAP32[$DataCount>>2]|0;
       $add31 = (($13) + ($pos$080))|0;
       $14 = HEAP32[$pSrcData27>>2]|0;
       $arrayidx33 = (($14) + ($add31)|0);
       $15 = HEAP8[$arrayidx33>>0]|0;
       $add3478 = $pos$080 | 1;
       $arrayidx36 = ((($psm) + ($add3478)|0) + 64|0);
       HEAP8[$arrayidx36>>0] = $15;
       $add37 = (($pos$080) + 2)|0;
       $cmp24 = ($add37|0)<($size$0|0);
       if ($cmp24) {
        $pos$080 = $add37;
       } else {
        break;
       }
      }
     }
    }
    HEAP32[$TaskStatus>>2] = 0;
    $TaskCount40 = (($psm) + 12|0);
    HEAP32[$TaskCount40>>2] = 35;
    $IsCompData = (($psm) + 48|0);
    $16 = HEAP32[$IsCompData>>2]|0;
    $tobool41 = ($16|0)==(0);
    L21: do {
     if ($tobool41) {
      $EraseAlign = (($psm) + 36|0);
      $17 = HEAP32[$EraseAlign>>2]|0;
      $tobool43 = ($17|0)==(0);
      if (!($tobool43)) {
       $18 = HEAP32[$DataCount>>2]|0;
       $rem = (($18>>>0) % ($17>>>0))&-1;
       $tobool46 = ($rem|0)==(0);
       if ($tobool46) {
        $EraseLength = (($psm) + 40|0);
        $19 = HEAP32[$EraseLength>>2]|0;
        HEAP32[$TaskCount40>>2] = $19;
       }
      }
     } else {
      $EraseCount = (($psm) + 44|0);
      $20 = HEAP32[$EraseCount>>2]|0;
      $tobool51 = ($20|0)==(0);
      if (!($tobool51)) {
       $CompBlockPos = (($psm) + 52|0);
       $21 = HEAP32[$CompBlockPos>>2]|0;
       $22 = HEAP32[$DataCount>>2]|0;
       $add54 = (($22) + ($size$0))|0;
       $cmp55 = ($21|0)<($add54|0);
       if ($cmp55) {
        $EraseLength57 = (($psm) + 40|0);
        $23 = HEAP32[$EraseLength57>>2]|0;
        HEAP32[$TaskCount40>>2] = $23;
        $24 = HEAP32[$EraseCount>>2]|0;
        $dec60 = (($24) + -1)|0;
        HEAP32[$EraseCount>>2] = $dec60;
        $EraseAlign89 = (($psm) + 36|0);
        $BlockLen1st = (($psm) + 56|0);
        $pSrcData73 = (($psm) + 24|0);
        $org_len$0 = 0;
        while(1) {
         $25 = HEAP32[$BlockLen1st>>2]|0;
         $tobool62 = ($25|0)==(0);
         $26 = HEAP32[$CompBlockPos>>2]|0;
         if ($tobool62) {
          $add72 = (($26) + 2)|0;
          $28 = HEAP32[$pSrcData73>>2]|0;
          $arrayidx74 = (($28) + ($add72)|0);
          $29 = HEAP8[$arrayidx74>>0]|0;
          $conv = $29&255;
          $shl = $conv << 8;
          $add76 = (($26) + 3)|0;
          $arrayidx78 = (($28) + ($add76)|0);
          $30 = HEAP8[$arrayidx78>>0]|0;
          $conv79 = $30&255;
          $or = $shl | $conv79;
          $add80 = (($26) + 6)|0;
          $add82 = (($add80) + ($or))|0;
          HEAP32[$CompBlockPos>>2] = $add82;
          $$pn = 4096;
         } else {
          $add66 = (($26) + ($25))|0;
          HEAP32[$CompBlockPos>>2] = $add66;
          $27 = HEAP32[$BlockLen1st>>2]|0;
          HEAP32[$BlockLen1st>>2] = 0;
          $$pn = $27;
         }
         $org_len$1 = (($$pn) + ($org_len$0))|0;
         $31 = HEAP32[$CompBlockPos>>2]|0;
         $32 = HEAP32[$DataSize>>2]|0;
         $cmp87 = ($31|0)<($32|0);
         if (!($cmp87)) {
          break L21;
         }
         $33 = HEAP32[$EraseAlign89>>2]|0;
         $cmp90 = ($org_len$1>>>0)<($33>>>0);
         if ($cmp90) {
          $org_len$0 = $org_len$1;
         } else {
          break;
         }
        }
       }
      }
     }
    } while(0);
    $TxBlockSize = (($psm) + 320|0);
    HEAP32[$TxBlockSize>>2] = 256;
    $34 = HEAP32[$DataCount>>2]|0;
    $add98 = (($34) + ($size$0))|0;
    HEAP32[$DataCount>>2] = $add98;
   }
   break;
  }
  case 1:  {
   $arraydecay4 = (($psm) + 352|0);
   _SyroFunc_MakeStartMark($arraydecay4,$xor);
   HEAP32[$TaskStatus>>2] = 2;
   break;
  }
  case 0:  {
   $arraydecay = (($psm) + 352|0);
   _SyroFunc_MakeGap($arraydecay,$xor);
   $TaskCount = (($psm) + 12|0);
   $2 = HEAP32[$TaskCount>>2]|0;
   $dec = (($2) + -1)|0;
   HEAP32[$TaskCount>>2] = $dec;
   $tobool = ($dec|0)==(0);
   if ($tobool) {
    HEAP32[$TaskStatus>>2] = 1;
    _SyroVolcaSample_SetupBlock($psm);
   }
   break;
  }
  case 4:  {
   $arraydecay112 = (($psm) + 352|0);
   _SyroFunc_MakeGap($arraydecay112,$xor);
   $TaskCount113 = (($psm) + 12|0);
   $37 = HEAP32[$TaskCount113>>2]|0;
   $dec114 = (($37) + -1)|0;
   HEAP32[$TaskCount113>>2] = $dec114;
   $tobool115 = ($dec114|0)==(0);
   if ($tobool115) {
    HEAP32[$TaskStatus>>2] = -1;
   }
   break;
  }
  default: {
   STACKTOP = sp;return;
  }
  }
 } while(0);
 $FrameCountInCycle = (($psm) + 436|0);
 $38 = HEAP32[$FrameCountInCycle>>2]|0;
 $add119 = (($38) + 8)|0;
 HEAP32[$FrameCountInCycle>>2] = $add119;
 STACKTOP = sp;return;
}
function _SyroVolcaSample_GetSample($Handle,$pLeft,$pRight) {
 $Handle = $Handle|0;
 $pLeft = $pLeft|0;
 $pRight = $pRight|0;
 var $$inc = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $CyclePos = 0, $FrameCountInCycle = 0, $call = 0, $call3 = 0, $cmp = 0, $cmp5 = 0, $dec = 0, $inc = 0, $rem9 = 0, $retval$0 = 0, $tobool = 0, $tobool10 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$Handle>>2]|0;
 $cmp = ($0|0)==(1196576587);
 if (!($cmp)) {
  $retval$0 = 7;
  STACKTOP = sp;return ($retval$0|0);
 }
 $FrameCountInCycle = (($Handle) + 436|0);
 $1 = HEAP32[$FrameCountInCycle>>2]|0;
 $tobool = ($1|0)==(0);
 if ($tobool) {
  $retval$0 = 8;
  STACKTOP = sp;return ($retval$0|0);
 }
 $call = (_SyroVolcaSample_GetChSample($Handle,0)|0);
 HEAP16[$pLeft>>1] = $call;
 $call3 = (_SyroVolcaSample_GetChSample($Handle,1)|0);
 HEAP16[$pRight>>1] = $call3;
 $2 = HEAP32[$FrameCountInCycle>>2]|0;
 $dec = (($2) + -1)|0;
 HEAP32[$FrameCountInCycle>>2] = $dec;
 $CyclePos = (($Handle) + 432|0);
 $3 = HEAP32[$CyclePos>>2]|0;
 $inc = (($3) + 1)|0;
 $cmp5 = ($inc|0)==(16);
 $$inc = $cmp5 ? 0 : $inc;
 HEAP32[$CyclePos>>2] = $$inc;
 $rem9 = $$inc & 7;
 $tobool10 = ($rem9|0)==(0);
 if (!($tobool10)) {
  $retval$0 = 0;
  STACKTOP = sp;return ($retval$0|0);
 }
 _SyroVolcaSample_CycleHandler($Handle);
 $retval$0 = 0;
 STACKTOP = sp;return ($retval$0|0);
}
function _SyroVolcaSample_GetChSample($psm,$ch) {
 $psm = $psm|0;
 $ch = $ch|0;
 var $0 = 0, $1 = 0, $2 = 0, $CyclePos = 0, $Lpf_z = 0, $add = 0, $arrayidx1 = 0, $conv = 0, $conv8 = 0, $div = 0, $mul = 0, $mul4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $CyclePos = (($psm) + 432|0);
 $0 = HEAP32[$CyclePos>>2]|0;
 $arrayidx1 = (((($psm) + (($ch*40)|0)|0) + ($0<<1)|0) + 352|0);
 $1 = HEAP16[$arrayidx1>>1]|0;
 $conv = $1 << 16 >> 16;
 $mul = ($conv*57344)|0;
 $Lpf_z = ((($psm) + (($ch*40)|0)|0) + 388|0);
 $2 = HEAP32[$Lpf_z>>2]|0;
 $mul4 = $2 << 13;
 $add = (($mul) + ($mul4))|0;
 $div = (($add|0) / 65536)&-1;
 HEAP32[$Lpf_z>>2] = $div;
 $conv8 = $div&65535;
 STACKTOP = sp;return ($conv8|0);
}
function _SyroVolcaSample_End($Handle) {
 $Handle = $Handle|0;
 var $0 = 0, $cmp = 0, $retval$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$Handle>>2]|0;
 $cmp = ($0|0)==(1196576587);
 if ($cmp) {
  _SyroVolcaSample_FreeCompressMemory($Handle);
  _free($Handle);
  $retval$0 = 0;
 } else {
  $retval$0 = 7;
 }
 STACKTOP = sp;return ($retval$0|0);
}
function _SyroComp_MakeMap($map_buffer,$prp,$pBitBase,$ptype) {
 $map_buffer = $map_buffer|0;
 $prp = $prp|0;
 $pBitBase = $pBitBase|0;
 $ptype = $ptype|0;
 var $BitBase = 0, $bestlen$1$1 = 0, $bestlen$2 = 0, $besttype$1$1 = 0, $call = 0, $call$1 = 0, $call6 = 0, $cmp1$1 = 0, $cond = 0, $mul5 = 0, $or$cond$1 = 0, $or$cond12 = 0, $tobool$1 = 0, $tobool2 = 0, $tobool3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $BitBase = sp;
 $call = (_SyroComp_MakeMap_SingleType($map_buffer,$prp,$BitBase,0)|0);
 $call$1 = (_SyroComp_MakeMap_SingleType($map_buffer,$prp,$BitBase,2)|0);
 $tobool$1 = ($call|0)==(0);
 $cmp1$1 = ($call$1|0)<($call|0);
 $or$cond$1 = $tobool$1 | $cmp1$1;
 $bestlen$1$1 = $or$cond$1 ? $call$1 : $call;
 $tobool2 = ($pBitBase|0)==(0|0);
 $tobool3 = ($ptype|0)==(0|0);
 $or$cond12 = $tobool2 | $tobool3;
 if ($or$cond12) {
  $bestlen$2 = $bestlen$1$1;
  STACKTOP = sp;return ($bestlen$2|0);
 }
 $besttype$1$1 = $or$cond$1&1;
 $mul5 = $besttype$1$1 << 1;
 $call6 = (_SyroComp_MakeMap_SingleType($map_buffer,$prp,$pBitBase,$mul5)|0);
 $cond = $or$cond$1 ? 2 : 0;
 HEAP32[$ptype>>2] = $cond;
 $bestlen$2 = $call6;
 STACKTOP = sp;return ($bestlen$2|0);
}
function _SyroComp_CompBlock($map_buffer,$dest,$prp,$pBitBase,$type) {
 $map_buffer = $map_buffer|0;
 $dest = $dest|0;
 $prp = $prp|0;
 $pBitBase = $pBitBase|0;
 $type = $type|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $BitCount = 0, $BitHead = 0, $ByteCount = 0, $NumOfSample = 0, $arrayidx15 = 0, $arrayidx28 = 0, $arrayidx4 = 0, $arrayidx6 = 0, $arrayidx7 = 0, $bitlen_eff = 0, $call = 0, $cmp12 = 0;
 var $cmp1240 = 0, $cmp16 = 0, $cmp21 = 0, $cmp25 = 0, $cmp30 = 0, $cmp38 = 0, $cmp49 = 0, $cmp5 = 0, $cmp52 = 0, $cmp67 = 0, $conv = 0, $dat$0 = 0, $dath$sroa$1$043 = 0, $dath$sroa$2$042 = 0, $dath$sroa$2$042$phi = 0, $dec = 0, $dec$ = 0, $exitcond = 0, $hd$0 = 0, $i$046 = 0;
 var $i$144 = 0, $inc = 0, $inc63 = 0, $inc8 = 0, $j$045 = 0, $j$1 = 0, $mul = 0, $or$cond = 0, $or$cond39 = 0, $phitmp = 0, $prbit$0$lcssa = 0, $prbit$041 = 0, $prbit$1 = 0, $shl20 = 0, $shl66 = 0, $sub = 0, $sub10 = 0, $sub19 = 0, $sub4438 = 0, $sub45 = 0;
 var $sub65 = 0, $sub75 = 0, $sub9 = 0, $tobool = 0, $tobool72 = 0, $wp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $wp = sp + 64|0;
 $BitHead = sp;
 HEAP32[$wp>>2] = $dest;
 $BitCount = (($wp) + 4|0);
 HEAP32[$BitCount>>2] = 0;
 $ByteCount = (($wp) + 8|0);
 HEAP32[$ByteCount>>2] = 0;
 $i$046 = 0;$j$045 = 0;
 while(1) {
  $arrayidx4 = (($pBitBase) + ($j$045<<2)|0);
  $0 = HEAP32[$arrayidx4>>2]|0;
  $cmp5 = ($0|0)==($i$046|0);
  if ($cmp5) {
   $inc = (($j$045) + 1)|0;
   $arrayidx6 = (($BitHead) + ($i$046<<2)|0);
   HEAP32[$arrayidx6>>2] = $j$045;
   $sub = (($i$046) + -1)|0;
   _SyroComp_WriteBit($wp,$sub,4);
   $j$1 = $inc;
  } else {
   $arrayidx7 = (($BitHead) + ($i$046<<2)|0);
   HEAP32[$arrayidx7>>2] = -1;
   $j$1 = $j$045;
  }
  $inc8 = (($i$046) + 1)|0;
  $exitcond = ($inc8|0)==(16);
  if ($exitcond) {
   break;
  } else {
   $i$046 = $inc8;$j$045 = $j$1;
  }
 }
 $bitlen_eff = (($prp) + 8|0);
 $1 = HEAP32[$bitlen_eff>>2]|0;
 $sub9 = (($1) + -1)|0;
 $sub10 = -1 << $sub9;
 _SyroComp_WriteBit($wp,3,2);
 $NumOfSample = (($prp) + 4|0);
 $2 = HEAP32[$NumOfSample>>2]|0;
 $cmp1240 = ($2|0)>(0);
 if ($cmp1240) {
  $tobool = ($type|0)==(0);
  $dath$sroa$1$043 = 0;$dath$sroa$2$042 = 0;$i$144 = 0;$prbit$041 = $1;
  while(1) {
   $call = (_SyroComp_GetPcm($prp)|0);
   $arrayidx15 = (($map_buffer) + ($i$144)|0);
   $3 = HEAP8[$arrayidx15>>0]|0;
   $conv = $3&255;
   $cmp16 = ($conv|0)==($prbit$041|0);
   if ($cmp16) {
    $prbit$1 = $prbit$041;
   } else {
    $sub19 = (($prbit$041) + -1)|0;
    $shl20 = 1 << $sub19;
    _SyroComp_WriteBit($wp,$shl20,$prbit$041);
    $cmp21 = ($prbit$041|0)==($1|0);
    if ($cmp21) {
     _SyroComp_WriteBit($wp,1,1);
    }
    $cmp25 = ($conv|0)<($1|0);
    if ($cmp25) {
     $arrayidx28 = (($BitHead) + ($conv<<2)|0);
     $4 = HEAP32[$arrayidx28>>2]|0;
     $cmp30 = ($conv|0)>($prbit$041|0);
     $dec = (($4) + 255)|0;
     $dec$ = $cmp30 ? $dec : $4;
     $phitmp = $dec$ & 255;
     $hd$0 = $phitmp;
    } else {
     $hd$0 = 3;
    }
    _SyroComp_WriteBit($wp,$hd$0,2);
    $prbit$1 = $conv;
   }
   $cmp38 = ($prbit$1|0)>=($1|0);
   $or$cond = $cmp38 | $tobool;
   if ($or$cond) {
    $dat$0 = $call;
   } else {
    $mul = $dath$sroa$1$043 << 1;
    $sub4438 = (($dath$sroa$2$042) - ($mul))|0;
    $sub45 = (($sub4438) + ($call))|0;
    $dat$0 = $sub45;
   }
   _SyroComp_WriteBit($wp,$dat$0,$prbit$1);
   $cmp49 = ($prbit$1|0)==($1|0);
   $cmp52 = ($dat$0|0)==($sub10|0);
   $or$cond39 = $cmp49 & $cmp52;
   if ($or$cond39) {
    _SyroComp_WriteBit($wp,0,1);
   }
   $inc63 = (($i$144) + 1)|0;
   $5 = HEAP32[$NumOfSample>>2]|0;
   $cmp12 = ($inc63|0)<($5|0);
   if ($cmp12) {
    $dath$sroa$2$042$phi = $dath$sroa$1$043;$dath$sroa$1$043 = $call;$i$144 = $inc63;$prbit$041 = $prbit$1;$dath$sroa$2$042 = $dath$sroa$2$042$phi;
   } else {
    $prbit$0$lcssa = $prbit$1;
    break;
   }
  }
 } else {
  $prbit$0$lcssa = $1;
 }
 $sub65 = (($prbit$0$lcssa) + -1)|0;
 $shl66 = 1 << $sub65;
 _SyroComp_WriteBit($wp,$shl66,$prbit$0$lcssa);
 $cmp67 = ($prbit$0$lcssa|0)==($1|0);
 if ($cmp67) {
  _SyroComp_WriteBit($wp,1,1);
 }
 $6 = HEAP32[$BitCount>>2]|0;
 $tobool72 = ($6|0)==(0);
 if ($tobool72) {
  $7 = HEAP32[$ByteCount>>2]|0;
  STACKTOP = sp;return ($7|0);
 }
 $sub75 = (8 - ($6))|0;
 _SyroComp_WriteBit($wp,0,$sub75);
 $7 = HEAP32[$ByteCount>>2]|0;
 STACKTOP = sp;return ($7|0);
}
function _SyroComp_GetPcm($prp) {
 $prp = $prp|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $SampleEndian = 0, $add = 0, $add$ptr = 0, $add28 = 0, $arrayidx = 0, $bitlen_eff = 0, $cmp = 0, $cmp11 = 0, $conv = 0, $conv2 = 0, $conv21 = 0;
 var $conv22 = 0, $conv27 = 0, $conv29 = 0, $conv5 = 0, $conv9 = 0, $dat$0 = 0, $dat$1 = 0, $div = 0, $incdec$ptr8 = 0, $or = 0, $or10 = 0, $shl = 0, $shl15 = 0, $shl18 = 0, $shl6 = 0, $sub = 0, $sum = 0, $sum26 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $SampleEndian = (($prp) + 12|0);
 $0 = HEAP32[$SampleEndian>>2]|0;
 $cmp = ($0|0)==(0);
 $1 = HEAP32[$prp>>2]|0;
 $arrayidx = (($1) + 1|0);
 if ($cmp) {
  $2 = HEAP8[$arrayidx>>0]|0;
  $conv = $2 << 24 >> 24;
  $shl = $conv << 8;
  $3 = HEAP8[$1>>0]|0;
  $conv2 = $3&255;
  $or = $shl | $conv2;
  $add$ptr = (($1) + 2|0);
  HEAP32[$prp>>2] = $add$ptr;
  $dat$0 = $or;
 } else {
  HEAP32[$prp>>2] = $arrayidx;
  $4 = HEAP8[$1>>0]|0;
  $conv5 = $4 << 24 >> 24;
  $shl6 = $conv5 << 8;
  $incdec$ptr8 = (($1) + 2|0);
  HEAP32[$prp>>2] = $incdec$ptr8;
  $5 = HEAP8[$arrayidx>>0]|0;
  $conv9 = $5&255;
  $or10 = $shl6 | $conv9;
  $dat$0 = $or10;
 }
 $bitlen_eff = (($prp) + 8|0);
 $6 = HEAP32[$bitlen_eff>>2]|0;
 $cmp11 = ($6|0)<(16);
 if ($cmp11) {
  $sub = (16 - ($6))|0;
  $shl15 = 1 << $sub;
  $div = (($dat$0|0) / ($shl15|0))&-1;
  $shl18 = $div << $sub;
  $sum = (($prp) + 16|0);
  $7 = HEAP16[$sum>>1]|0;
  $conv21 = $7&65535;
  $add = (($conv21) + ($shl18))|0;
  $conv22 = $add&65535;
  HEAP16[$sum>>1] = $conv22;
  $dat$1 = $div;
  STACKTOP = sp;return ($dat$1|0);
 } else {
  $sum26 = (($prp) + 16|0);
  $8 = HEAP16[$sum26>>1]|0;
  $conv27 = $8&65535;
  $add28 = (($conv27) + ($dat$0))|0;
  $conv29 = $add28&65535;
  HEAP16[$sum26>>1] = $conv29;
  $dat$1 = $dat$0;
  STACKTOP = sp;return ($dat$1|0);
 }
 return 0|0;
}
function _SyroComp_WriteBit($pwp,$dat,$bit) {
 $pwp = $pwp|0;
 $dat = $dat|0;
 $bit = $bit|0;
 var $$pr = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $BitCount = 0, $ByteCount = 0, $add = 0, $bit$addr$0 = 0, $cmp = 0, $conv = 0, $conv4 = 0, $conv5 = 0, $dat$addr$0 = 0, $inc = 0, $incdec$ptr = 0;
 var $or = 0, $shl = 0, $shl17 = 0, $shr = 0, $shr2 = 0, $sub = 0, $sub1317 = 0, $sub14 = 0, $tobool = 0, $tobool22 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $sub = (32 - ($bit))|0;
 $shl = $dat << $sub;
 $BitCount = (($pwp) + 4|0);
 $0 = HEAP32[$BitCount>>2]|0;
 $shr = $shl >>> $0;
 $ByteCount = (($pwp) + 8|0);
 $1 = $0;$bit$addr$0 = $bit;$dat$addr$0 = $shr;
 while(1) {
  $tobool = ($1|0)==(0);
  $shr2 = $dat$addr$0 >>> 24;
  if ($tobool) {
   $conv = $shr2&255;
   $4 = HEAP32[$pwp>>2]|0;
   HEAP8[$4>>0] = $conv;
  } else {
   $2 = HEAP32[$pwp>>2]|0;
   $3 = HEAP8[$2>>0]|0;
   $conv4 = $3&255;
   $or = $conv4 | $shr2;
   $conv5 = $or&255;
   HEAP8[$2>>0] = $conv5;
  }
  $5 = HEAP32[$BitCount>>2]|0;
  $add = (($5) + ($bit$addr$0))|0;
  $cmp = ($add|0)>(7);
  if (!($cmp)) {
   break;
  }
  $sub1317 = (($bit$addr$0) + -8)|0;
  $sub14 = (($sub1317) + ($5))|0;
  HEAP32[$BitCount>>2] = 0;
  $6 = HEAP32[$ByteCount>>2]|0;
  $inc = (($6) + 1)|0;
  HEAP32[$ByteCount>>2] = $inc;
  $7 = HEAP32[$pwp>>2]|0;
  $incdec$ptr = (($7) + 1|0);
  HEAP32[$pwp>>2] = $incdec$ptr;
  $tobool22 = ($sub14|0)==(0);
  if ($tobool22) {
   label = 9;
   break;
  }
  $shl17 = $dat$addr$0 << 8;
  $$pr = HEAP32[$BitCount>>2]|0;
  $1 = $$pr;$bit$addr$0 = $sub14;$dat$addr$0 = $shl17;
 }
 if ((label|0) == 9) {
  STACKTOP = sp;return;
 }
 HEAP32[$BitCount>>2] = $add;
 STACKTOP = sp;return;
}
function _syrializer($src,$size_dest,$chunk_size,$num) {
 $src = $src|0;
 $size_dest = $size_dest|0;
 $chunk_size = $chunk_size|0;
 $num = $num|0;
 var $$lcssa = 0, $$pr = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $add = 0, $add$ptr = 0;
 var $add$ptr14 = 0, $add13 = 0, $arrayidx = 0, $arrayidx21 = 0, $arrayidx24 = 0, $arrayidx29 = 0, $arrayidx33 = 0, $arrayidx35 = 0, $arrayidx37 = 0, $call3 = 0, $call6 = 0, $cmp = 0, $conv = 0, $conv19 = 0, $conv22 = 0, $conv27 = 0, $conv32 = 0, $conv34 = 0, $conv36 = 0, $conv38 = 0;
 var $dec = 0, $dec30 = 0, $frame = 0, $frame$promoted = 0, $handle = 0, $inc2026 = 0, $inc2327 = 0, $inc25 = 0, $inc28 = 0, $left = 0, $mul = 0, $mul12 = 0, $mul15 = 0, $retval$0 = 0, $right = 0, $shr22 = 0, $shr2624 = 0, $syro_data = 0, $tobool = 0, $tobool16 = 0;
 var $tobool1628 = 0, $vararg_buffer7 = 0, $vararg_ptr4 = 0, $vararg_ptr5 = 0, $vararg_ptr6 = 0, $write_pos$029 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 320|0;
 $vararg_buffer7 = sp;
 $syro_data = sp + 24|0;
 $handle = sp + 20|0;
 $frame = sp + 16|0;
 $left = sp + 306|0;
 $right = sp + 304|0;
 _initialize($num,$syro_data);
 _setup_file_sample2($src,$syro_data,$chunk_size);
 $call3 = (_SyroVolcaSample_Start($handle,$syro_data,1,0,$frame)|0);
 $cmp = ($call3|0)==(0);
 if (!($cmp)) {
  HEAP32[$vararg_buffer7>>2] = $call3;
  (_printf((776|0),($vararg_buffer7|0))|0);
  _free_syrodata($syro_data);
  $retval$0 = 0;
  STACKTOP = sp;return ($retval$0|0);
 }
 $0 = HEAP32[$frame>>2]|0;
 $mul = $0 << 2;
 $add = (($mul) + 44)|0;
 HEAP32[$size_dest>>2] = $add;
 $call6 = (_malloc($add)|0);
 $tobool = ($call6|0)==(0|0);
 if ($tobool) {
  (_puts((928|0))|0);
  $1 = HEAP32[$handle>>2]|0;
  (_SyroVolcaSample_End($1)|0);
  _free_syrodata($syro_data);
  $retval$0 = 0;
  STACKTOP = sp;return ($retval$0|0);
 }
 dest=$call6+0|0; src=800+0|0; stop=dest+44|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 $add$ptr = (($call6) + 4|0);
 $2 = HEAP32[$frame>>2]|0;
 $mul12 = $2 << 2;
 $add13 = (($mul12) + 36)|0;
 _set_32Bit_value($add$ptr,$add13);
 $add$ptr14 = (($call6) + 40|0);
 $3 = HEAP32[$frame>>2]|0;
 $mul15 = $3 << 2;
 _set_32Bit_value($add$ptr14,$mul15);
 $$pr = HEAP32[$frame>>2]|0;
 $tobool1628 = ($$pr|0)==(0);
 $4 = HEAP32[$handle>>2]|0;
 if ($tobool1628) {
  $$lcssa = $4;
 } else {
  $5 = HEAP32[$handle>>2]|0;
  $frame$promoted = HEAP32[$frame>>2]|0;
  $6 = $4;$dec30 = $frame$promoted;$write_pos$029 = 44;
  while(1) {
   (_SyroVolcaSample_GetSample($6,$left,$right)|0);
   $7 = HEAP16[$left>>1]|0;
   $conv = $7&255;
   $inc25 = $write_pos$029 | 1;
   $arrayidx = (($call6) + ($write_pos$029)|0);
   HEAP8[$arrayidx>>0] = $conv;
   $8 = HEAP16[$left>>1]|0;
   $shr22 = ($8&65535) >>> 8;
   $conv19 = $shr22&255;
   $inc2026 = $write_pos$029 | 2;
   $arrayidx21 = (($call6) + ($inc25)|0);
   HEAP8[$arrayidx21>>0] = $conv19;
   $9 = HEAP16[$right>>1]|0;
   $conv22 = $9&255;
   $inc2327 = $write_pos$029 | 3;
   $arrayidx24 = (($call6) + ($inc2026)|0);
   HEAP8[$arrayidx24>>0] = $conv22;
   $10 = HEAP16[$right>>1]|0;
   $shr2624 = ($10&65535) >>> 8;
   $conv27 = $shr2624&255;
   $inc28 = (($write_pos$029) + 4)|0;
   $arrayidx29 = (($call6) + ($inc2327)|0);
   HEAP8[$arrayidx29>>0] = $conv27;
   $dec = (($dec30) + -1)|0;
   $tobool16 = ($dec|0)==(0);
   if ($tobool16) {
    break;
   } else {
    $6 = $5;$dec30 = $dec;$write_pos$029 = $inc28;
   }
  }
  HEAP32[$frame>>2] = 0;
  $$lcssa = $5;
 }
 (_SyroVolcaSample_End($$lcssa)|0);
 $11 = HEAP8[$call6>>0]|0;
 $conv32 = $11&255;
 $arrayidx33 = (($call6) + 1|0);
 $12 = HEAP8[$arrayidx33>>0]|0;
 $conv34 = $12&255;
 $arrayidx35 = (($call6) + 2|0);
 $13 = HEAP8[$arrayidx35>>0]|0;
 $conv36 = $13&255;
 $arrayidx37 = (($call6) + 3|0);
 $14 = HEAP8[$arrayidx37>>0]|0;
 $conv38 = $14&255;
 HEAP32[$vararg_buffer7>>2] = $conv32;
 $vararg_ptr4 = (($vararg_buffer7) + 4|0);
 HEAP32[$vararg_ptr4>>2] = $conv34;
 $vararg_ptr5 = (($vararg_buffer7) + 8|0);
 HEAP32[$vararg_ptr5>>2] = $conv36;
 $vararg_ptr6 = (($vararg_buffer7) + 12|0);
 HEAP32[$vararg_ptr6>>2] = $conv38;
 (_printf((848|0),($vararg_buffer7|0))|0);
 $15 = HEAP32[$size_dest>>2]|0;
 HEAP32[$vararg_buffer7>>2] = $15;
 (_printf((864|0),($vararg_buffer7|0))|0);
 $retval$0 = $call6;
 STACKTOP = sp;return ($retval$0|0);
}
function _initialize($num,$syro_data) {
 $num = $num|0;
 $syro_data = $syro_data|0;
 var $Number = 0, $Quality = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$syro_data>>2] = 1;
 $Number = (($syro_data) + 8|0);
 HEAP32[$Number>>2] = $num;
 $Quality = (($syro_data) + 16|0);
 HEAP32[$Quality>>2] = 16;
 STACKTOP = sp;return;
}
function _setup_file_sample2($src,$syro_data,$size) {
 $src = $src|0;
 $syro_data = $syro_data|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $Fs = 0, $SampleEndian = 0, $Size = 0, $add$ptr = 0, $add$ptr123 = 0, $add$ptr23 = 0, $add$ptr34 = 0;
 var $add$ptr47 = 0, $add$ptr63 = 0, $add$ptr65 = 0, $add$ptr65$sum = 0, $add$ptr65$sum1 = 0, $add$ptr66 = 0, $add$ptr98 = 0, $add124 = 0, $add74 = 0, $add80 = 0, $add81 = 0, $arrayidx1 = 0, $arrayidx107 = 0, $arrayidx119 = 0, $arrayidx3 = 0, $arrayidx5 = 0, $call13 = 0, $call17 = 0, $call25 = 0, $call35 = 0;
 var $call35$off = 0, $call48 = 0, $call64 = 0, $call67 = 0, $call69 = 0, $call91 = 0, $ch$017 = 0, $cmp = 0, $cmp104 = 0, $cmp10414 = 0, $cmp112 = 0, $cmp11211 = 0, $cmp27 = 0, $cmp75 = 0, $cmp82 = 0, $conv = 0, $conv108 = 0, $conv120 = 0, $conv130 = 0, $conv2 = 0;
 var $conv36 = 0, $conv4 = 0, $conv6 = 0, $conv88 = 0, $dat$0$lcssa = 0, $dat$012 = 0, $datf$0$lcssa = 0, $datf$016 = 0, $dec = 0, $div = 0, $div129 = 0, $div89 = 0, $inc126 = 0, $incdec$ptr = 0, $indvars$iv = 0, $indvars$iv$next = 0, $mul = 0, $mul90 = 0, $num_of_frame$0 = 0, $or = 0;
 var $pData = 0, $posd$0 = 0, $poss$0 = 0, $poss$1$lcssa = 0, $poss$115 = 0, $scevgep = 0, $shl = 0, $sub = 0, $sub118 = 0, $switch = 0, $tobool = 0, $tobool131 = 0, $tobool18 = 0, $tobool70 = 0, $tobool93 = 0, $vararg_buffer4 = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr7 = 0;
 var $vararg_ptr8 = 0, $vararg_ptr9 = 0, $wav_pos$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer4 = sp;
 $cmp = ($size>>>0)<(45);
 if ($cmp) {
  (_puts((1312|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $0 = HEAP8[$src>>0]|0;
 $conv = $0&255;
 $arrayidx1 = (($src) + 1|0);
 $1 = HEAP8[$arrayidx1>>0]|0;
 $conv2 = $1&255;
 $arrayidx3 = (($src) + 2|0);
 $2 = HEAP8[$arrayidx3>>0]|0;
 $conv4 = $2&255;
 $arrayidx5 = (($src) + 3|0);
 $3 = HEAP8[$arrayidx5>>0]|0;
 $conv6 = $3&255;
 HEAP32[$vararg_buffer4>>2] = $conv;
 $vararg_ptr1 = (($vararg_buffer4) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $conv2;
 $vararg_ptr2 = (($vararg_buffer4) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $conv4;
 $vararg_ptr3 = (($vararg_buffer4) + 12|0);
 HEAP32[$vararg_ptr3>>2] = $conv6;
 (_printf((848|0),($vararg_buffer4|0))|0);
 HEAP32[$vararg_buffer4>>2] = 82;
 $vararg_ptr7 = (($vararg_buffer4) + 4|0);
 HEAP32[$vararg_ptr7>>2] = 73;
 $vararg_ptr8 = (($vararg_buffer4) + 8|0);
 HEAP32[$vararg_ptr8>>2] = 70;
 $vararg_ptr9 = (($vararg_buffer4) + 12|0);
 HEAP32[$vararg_ptr9>>2] = 70;
 (_printf((848|0),($vararg_buffer4|0))|0);
 $call13 = (_memcmp($src,800,4)|0);
 $tobool = ($call13|0)==(0);
 if (!($tobool)) {
  (_puts((1272|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $add$ptr = (($src) + 8|0);
 $call17 = (_memcmp($add$ptr,((800 + 8|0)),8)|0);
 $tobool18 = ($call17|0)==(0);
 if (!($tobool18)) {
  (_puts((1224|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $add$ptr23 = (($src) + 20|0);
 $call25 = (_get_16Bit_value($add$ptr23)|0);
 $cmp27 = ($call25<<16>>16)==(1);
 if (!($cmp27)) {
  (_puts((1184|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $add$ptr34 = (($src) + 22|0);
 $call35 = (_get_16Bit_value($add$ptr34)|0);
 $conv36 = $call35&65535;
 $call35$off = (($call35) + -1)<<16>>16;
 $switch = ($call35$off&65535)<(2);
 if (!($switch)) {
  (_puts((1144|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $add$ptr47 = (($src) + 34|0);
 $call48 = (_get_16Bit_value($add$ptr47)|0);
 if (!((($call48<<16>>16) == 24) | (($call48<<16>>16) == 16))) {
  (_puts((1104|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $div = ($call48&65535) >>> 3;
 $add$ptr63 = (($src) + 24|0);
 $call64 = (_get_32Bit_value($add$ptr63)|0);
 $wav_pos$0 = 12;
 while(1) {
  $add$ptr65 = (($src) + ($wav_pos$0)|0);
  $add$ptr65$sum = (($wav_pos$0) + 4)|0;
  $add$ptr66 = (($src) + ($add$ptr65$sum)|0);
  $call67 = (_get_32Bit_value($add$ptr66)|0);
  $call69 = (_memcmp($add$ptr65,880,4)|0);
  $tobool70 = ($call69|0)==(0);
  $add80 = (($wav_pos$0) + 8)|0;
  $add81 = (($add80) + ($call67))|0;
  if ($tobool70) {
   break;
  }
  $add74 = (($add81) + 8)|0;
  $cmp75 = ($add74>>>0)>($size>>>0);
  if ($cmp75) {
   label = 16;
   break;
  } else {
   $wav_pos$0 = $add81;
  }
 }
 if ((label|0) == 16) {
  (_puts((1064|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $cmp82 = ($add81>>>0)>($size>>>0);
 if ($cmp82) {
  (_puts((1016|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $conv88 = $div&65535;
 $mul = Math_imul($conv88, $conv36)|0;
 $div89 = (($call67>>>0) / ($mul>>>0))&-1;
 $mul90 = $div89 << 1;
 $call91 = (_malloc($mul90)|0);
 $pData = (($syro_data) + 4|0);
 HEAP32[$pData>>2] = $call91;
 $tobool93 = ($call91|0)==(0|0);
 if ($tobool93) {
  (_puts((968|0))|0);
  _free($src);
  STACKTOP = sp;return;
 }
 $add$ptr65$sum1 = (($wav_pos$0) + 8)|0;
 $add$ptr98 = (($src) + ($add$ptr65$sum1)|0);
 $cmp10414 = ($call35<<16>>16)==(0);
 $sub = (($conv88) + -1)|0;
 $cmp11211 = ($call48&65535)>(15);
 $4 = (($call35) + -1)<<16>>16;
 $5 = $4&65535;
 $6 = (($5) + 1)|0;
 $7 = ($call48&65535) >>> 3;
 $8 = $7&65535;
 $9 = Math_imul($6, $8)|0;
 $num_of_frame$0 = $div89;$posd$0 = $call91;$poss$0 = $add$ptr98;
 while(1) {
  if ($cmp10414) {
   $datf$0$lcssa = 0;$poss$1$lcssa = $poss$0;
  } else {
   $ch$017 = 0;$datf$016 = 0;$poss$115 = $poss$0;
   while(1) {
    $arrayidx107 = (($poss$115) + ($sub)|0);
    $10 = HEAP8[$arrayidx107>>0]|0;
    $conv108 = $10 << 24 >> 24;
    if ($cmp11211) {
     $dat$012 = $conv108;$indvars$iv = 1;
     while(1) {
      $shl = $dat$012 << 8;
      $sub118 = (($sub) - ($indvars$iv))|0;
      $arrayidx119 = (($poss$115) + ($sub118)|0);
      $11 = HEAP8[$arrayidx119>>0]|0;
      $conv120 = $11&255;
      $or = $conv120 | $shl;
      $indvars$iv$next = (($indvars$iv) + 1)|0;
      $12 = $indvars$iv$next&65535;
      $cmp112 = ($12&65535)<($div&65535);
      if ($cmp112) {
       $dat$012 = $or;$indvars$iv = $indvars$iv$next;
      } else {
       $dat$0$lcssa = $or;
       break;
      }
     }
    } else {
     $dat$0$lcssa = $conv108;
    }
    $add$ptr123 = (($poss$115) + ($conv88)|0);
    $add124 = (($dat$0$lcssa) + ($datf$016))|0;
    $inc126 = (($ch$017) + 1)<<16>>16;
    $cmp104 = ($inc126&65535)<($call35&65535);
    if ($cmp104) {
     $ch$017 = $inc126;$datf$016 = $add124;$poss$115 = $add$ptr123;
    } else {
     break;
    }
   }
   $scevgep = (($poss$0) + ($9)|0);
   $datf$0$lcssa = $add124;$poss$1$lcssa = $scevgep;
  }
  $div129 = (($datf$0$lcssa|0) / ($conv36|0))&-1;
  $conv130 = $div129&65535;
  $incdec$ptr = (($posd$0) + 2|0);
  HEAP16[$posd$0>>1] = $conv130;
  $dec = (($num_of_frame$0) + -1)|0;
  $tobool131 = ($dec|0)==(0);
  if ($tobool131) {
   break;
  } else {
   $num_of_frame$0 = $dec;$posd$0 = $incdec$ptr;$poss$0 = $poss$1$lcssa;
  }
 }
 $Size = (($syro_data) + 12|0);
 HEAP32[$Size>>2] = $mul90;
 $Fs = (($syro_data) + 20|0);
 HEAP32[$Fs>>2] = $call64;
 $SampleEndian = (($syro_data) + 24|0);
 HEAP32[$SampleEndian>>2] = 0;
 _free($src);
 (_puts((1008|0))|0);
 STACKTOP = sp;return;
}
function _free_syrodata($syro_data) {
 $syro_data = $syro_data|0;
 var $0 = 0, $pData = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $pData = (($syro_data) + 4|0);
 $0 = HEAP32[$pData>>2]|0;
 $tobool = ($0|0)==(0|0);
 if ($tobool) {
  STACKTOP = sp;return;
 }
 _free($0);
 HEAP32[$pData>>2] = 0;
 STACKTOP = sp;return;
}
function _set_32Bit_value($ptr,$dat) {
 $ptr = $ptr|0;
 $dat = $dat|0;
 var $conv = 0, $conv$1 = 0, $conv$2 = 0, $conv$3 = 0, $incdec$ptr = 0, $incdec$ptr$1 = 0, $incdec$ptr$2 = 0, $shr = 0, $shr$1 = 0, $shr$2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $conv = $dat&255;
 $incdec$ptr = (($ptr) + 1|0);
 HEAP8[$ptr>>0] = $conv;
 $shr = $dat >>> 8;
 $conv$1 = $shr&255;
 $incdec$ptr$1 = (($ptr) + 2|0);
 HEAP8[$incdec$ptr>>0] = $conv$1;
 $shr$1 = $dat >>> 16;
 $conv$2 = $shr$1&255;
 $incdec$ptr$2 = (($ptr) + 3|0);
 HEAP8[$incdec$ptr$1>>0] = $conv$2;
 $shr$2 = $dat >>> 24;
 $conv$3 = $shr$2&255;
 HEAP8[$incdec$ptr$2>>0] = $conv$3;
 STACKTOP = sp;return;
}
function _get_16Bit_value($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $arrayidx = 0, $conv1 = 0, $conv5 = 0, $conv7 = 0, $or = 0, $shl = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $arrayidx = (($ptr) + 1|0);
 $0 = HEAP8[$arrayidx>>0]|0;
 $conv1 = $0&255;
 $shl = $conv1 << 8;
 $1 = HEAP8[$ptr>>0]|0;
 $conv5 = $1&255;
 $or = $shl | $conv5;
 $conv7 = $or&65535;
 STACKTOP = sp;return ($conv7|0);
}
function _get_32Bit_value($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $arrayidx = 0, $arrayidx$1 = 0, $arrayidx$2 = 0, $conv = 0, $conv$1 = 0, $conv$2 = 0, $conv$3 = 0, $or$1 = 0, $or$2 = 0, $or$3 = 0, $shl$1 = 0, $shl$2 = 0, $shl$3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $arrayidx = (($ptr) + 3|0);
 $0 = HEAP8[$arrayidx>>0]|0;
 $conv = $0&255;
 $shl$1 = $conv << 8;
 $arrayidx$1 = (($ptr) + 2|0);
 $1 = HEAP8[$arrayidx$1>>0]|0;
 $conv$1 = $1&255;
 $or$1 = $conv$1 | $shl$1;
 $shl$2 = $or$1 << 8;
 $arrayidx$2 = (($ptr) + 1|0);
 $2 = HEAP8[$arrayidx$2>>0]|0;
 $conv$2 = $2&255;
 $or$2 = $conv$2 | $shl$2;
 $shl$3 = $or$2 << 8;
 $3 = HEAP8[$ptr>>0]|0;
 $conv$3 = $3&255;
 $or$3 = $conv$3 | $shl$3;
 STACKTOP = sp;return ($or$3|0);
}
function _SyroComp_MakeMap_SingleType($map_buffer,$prp,$pBitBase,$type) {
 $map_buffer = $map_buffer|0;
 $prp = $prp|0;
 $pBitBase = $pBitBase|0;
 $type = $type|0;
 var $$maxsc$0 = 0, $$maxsc$0$1 = 0, $$maxsc$0$2 = 0, $$maxsc$0$3 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $BitBase = 0, $BitBaseScore = 0, $NumOfSample = 0, $NumOfSample10 = 0, $add = 0, $arrayidx = 0;
 var $arrayidx13 = 0, $arrayidx16 = 0, $arrayidx29 = 0, $arrayidx29$1 = 0, $arrayidx29$2 = 0, $arrayidx29$3 = 0, $arrayidx38$1 = 0, $arrayidx38$180 = 0, $arrayidx38$2 = 0, $arrayidx38$282 = 0, $arrayidx38$3 = 0, $arrayidx39 = 0, $arrayidx39$1 = 0, $arrayidx39$181 = 0, $arrayidx39$2 = 0, $arrayidx39$283 = 0, $arrayidx39$3 = 0, $arrayidx3979 = 0, $arrayidx51$1 = 0, $arrayidx51$1$1 = 0;
 var $arrayidx51$1$2 = 0, $arrayidx51$2 = 0, $arrayidx51$2$1 = 0, $arrayidx51$2$2 = 0, $arrayidx53 = 0, $arrayidx53$1 = 0, $arrayidx53$1$1 = 0, $arrayidx53$1$2 = 0, $arrayidx53$166 = 0, $arrayidx53$2 = 0, $arrayidx53$2$1 = 0, $arrayidx53$2$2 = 0, $arrayidx53$271 = 0, $bitlen_eff = 0, $call = 0, $cmp11 = 0, $cmp1157 = 0, $cmp14 = 0, $cmp2652 = 0, $cmp30 = 0;
 var $cmp30$1 = 0, $cmp30$2 = 0, $cmp30$3 = 0, $cmp54 = 0, $cmp54$1 = 0, $cmp54$1$1 = 0, $cmp54$1$2 = 0, $cmp54$167 = 0, $cmp54$2 = 0, $cmp54$2$1 = 0, $cmp54$2$2 = 0, $cmp54$272 = 0, $cmp61 = 0, $conv = 0, $exitcond = 0, $exitcond$1 = 0, $exitcond$2 = 0, $exitcond$3 = 0, $exitcond77 = 0, $i$062 = 0;
 var $inc17 = 0, $inc19 = 0, $inc36 = 0, $inc36$1 = 0, $inc36$2 = 0, $inc36$3 = 0, $j$0$maxbit$0 = 0, $j$0$maxbit$0$1 = 0, $j$0$maxbit$0$2 = 0, $j$0$maxbit$0$3 = 0, $j$053 = 0, $j$053$1 = 0, $j$053$2 = 0, $j$053$3 = 0, $li$058 = 0, $maxbit$0$lcssa$2 = 0, $maxbit$0$lcssa$3 = 0, $maxbit$054 = 0, $maxbit$054$1 = 0, $maxbit$054$2 = 0;
 var $maxbit$054$3 = 0, $maxsc$055 = 0, $maxsc$055$1 = 0, $maxsc$055$2 = 0, $maxsc$055$3 = 0, $rp2 = 0, $sub = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $rp2 = sp + 128|0;
 $BitBase = sp + 64|0;
 $BitBaseScore = sp;
 $bitlen_eff = (($prp) + 8|0);
 $0 = HEAP32[$bitlen_eff>>2]|0;
 $sub = (($0) + -1)|0;
 $cmp61 = ($sub|0)>(0);
 if ($cmp61) {
  $1 = (($0) + -1)|0;
  $i$062 = 0;
  while(1) {
   $add = (($i$062) + 1)|0;
   $arrayidx = (($BitBase) + ($i$062<<2)|0);
   HEAP32[$arrayidx>>2] = $add;
   $exitcond77 = ($add|0)==($1|0);
   if ($exitcond77) {
    break;
   } else {
    $i$062 = $add;
   }
  }
 }
 ;HEAP32[$rp2+0>>2]=HEAP32[$prp+0>>2]|0;HEAP32[$rp2+4>>2]=HEAP32[$prp+4>>2]|0;HEAP32[$rp2+8>>2]=HEAP32[$prp+8>>2]|0;HEAP32[$rp2+12>>2]=HEAP32[$prp+12>>2]|0;HEAP32[$rp2+16>>2]=HEAP32[$prp+16>>2]|0;
 _SyroComp_MakeMapBuffer($map_buffer,$rp2,$BitBase,$sub,$type);
 $NumOfSample = (($rp2) + 4|0);
 $2 = HEAP32[$NumOfSample>>2]|0;
 _SyroComp_MakeMap_BitConv($map_buffer,$2,$0);
 dest=$BitBaseScore+0|0; stop=dest+64|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 $NumOfSample10 = (($prp) + 4|0);
 $3 = HEAP32[$NumOfSample10>>2]|0;
 $cmp1157 = ($3|0)==(0);
 if (!($cmp1157)) {
  $4 = HEAP32[$NumOfSample10>>2]|0;
  $li$058 = 0;
  while(1) {
   $arrayidx13 = (($map_buffer) + ($li$058)|0);
   $5 = HEAP8[$arrayidx13>>0]|0;
   $cmp14 = ($5&255)<(16);
   if ($cmp14) {
    $conv = $5&255;
    $arrayidx16 = (($BitBaseScore) + ($conv<<2)|0);
    $6 = HEAP32[$arrayidx16>>2]|0;
    $inc17 = (($6) + 1)|0;
    HEAP32[$arrayidx16>>2] = $inc17;
   }
   $inc19 = (($li$058) + 1)|0;
   $cmp11 = ($inc19>>>0)<($4>>>0);
   if ($cmp11) {
    $li$058 = $inc19;
   } else {
    break;
   }
  }
 }
 $cmp2652 = ($0|0)>(0);
 do {
  if ($cmp2652) {
   $j$053 = 0;$maxbit$054 = -1;$maxsc$055 = -1;
   while(1) {
    $arrayidx29 = (($BitBaseScore) + ($j$053<<2)|0);
    $7 = HEAP32[$arrayidx29>>2]|0;
    $cmp30 = ($7|0)>($maxsc$055|0);
    $j$0$maxbit$0 = $cmp30 ? $j$053 : $maxbit$054;
    $$maxsc$0 = $cmp30 ? $7 : $maxsc$055;
    $inc36 = (($j$053) + 1)|0;
    $exitcond = ($inc36|0)==($0|0);
    if ($exitcond) {
     break;
    } else {
     $j$053 = $inc36;$maxbit$054 = $j$0$maxbit$0;$maxsc$055 = $$maxsc$0;
    }
   }
   HEAP32[$BitBase>>2] = $j$0$maxbit$0;
   $arrayidx39 = (($BitBaseScore) + ($j$0$maxbit$0<<2)|0);
   HEAP32[$arrayidx39>>2] = -1;
   if ($cmp2652) {
    $j$053$1 = 0;$maxbit$054$1 = -1;$maxsc$055$1 = -1;
    while(1) {
     $arrayidx29$1 = (($BitBaseScore) + ($j$053$1<<2)|0);
     $27 = HEAP32[$arrayidx29$1>>2]|0;
     $cmp30$1 = ($27|0)>($maxsc$055$1|0);
     $j$0$maxbit$0$1 = $cmp30$1 ? $j$053$1 : $maxbit$054$1;
     $$maxsc$0$1 = $cmp30$1 ? $27 : $maxsc$055$1;
     $inc36$1 = (($j$053$1) + 1)|0;
     $exitcond$1 = ($inc36$1|0)==($0|0);
     if ($exitcond$1) {
      break;
     } else {
      $j$053$1 = $inc36$1;$maxbit$054$1 = $j$0$maxbit$0$1;$maxsc$055$1 = $$maxsc$0$1;
     }
    }
    $arrayidx38$1 = (($BitBase) + 4|0);
    HEAP32[$arrayidx38$1>>2] = $j$0$maxbit$0$1;
    $arrayidx39$1 = (($BitBaseScore) + ($j$0$maxbit$0$1<<2)|0);
    HEAP32[$arrayidx39$1>>2] = -1;
    if ($cmp2652) {
     $j$053$2 = 0;$maxbit$054$2 = -1;$maxsc$055$2 = -1;
     while(1) {
      $arrayidx29$2 = (($BitBaseScore) + ($j$053$2<<2)|0);
      $28 = HEAP32[$arrayidx29$2>>2]|0;
      $cmp30$2 = ($28|0)>($maxsc$055$2|0);
      $j$0$maxbit$0$2 = $cmp30$2 ? $j$053$2 : $maxbit$054$2;
      $$maxsc$0$2 = $cmp30$2 ? $28 : $maxsc$055$2;
      $inc36$2 = (($j$053$2) + 1)|0;
      $exitcond$2 = ($inc36$2|0)==($0|0);
      if ($exitcond$2) {
       $maxbit$0$lcssa$2 = $j$0$maxbit$0$2;
       label = 37;
       break;
      } else {
       $j$053$2 = $inc36$2;$maxbit$054$2 = $j$0$maxbit$0$2;$maxsc$055$2 = $$maxsc$0$2;
      }
     }
    } else {
     $arrayidx38$282 = (($BitBase) + 8|0);
     HEAP32[$arrayidx38$282>>2] = -1;
     $arrayidx39$283 = (($BitBaseScore) + -4|0);
     HEAP32[$arrayidx39$283>>2] = -1;
     $maxbit$0$lcssa$3 = -1;
     break;
    }
   } else {
    label = 33;
   }
  } else {
   HEAP32[$BitBase>>2] = -1;
   $arrayidx3979 = (($BitBaseScore) + -4|0);
   HEAP32[$arrayidx3979>>2] = -1;
   label = 33;
  }
 } while(0);
 if ((label|0) == 33) {
  $arrayidx38$180 = (($BitBase) + 4|0);
  HEAP32[$arrayidx38$180>>2] = -1;
  $arrayidx39$181 = (($BitBaseScore) + -4|0);
  HEAP32[$arrayidx39$181>>2] = -1;
  $maxbit$0$lcssa$2 = -1;
  label = 37;
 }
 if ((label|0) == 37) {
  $arrayidx38$2 = (($BitBase) + 8|0);
  HEAP32[$arrayidx38$2>>2] = $maxbit$0$lcssa$2;
  $arrayidx39$2 = (($BitBaseScore) + ($maxbit$0$lcssa$2<<2)|0);
  HEAP32[$arrayidx39$2>>2] = -1;
  if ($cmp2652) {
   $j$053$3 = 0;$maxbit$054$3 = -1;$maxsc$055$3 = -1;
   while(1) {
    $arrayidx29$3 = (($BitBaseScore) + ($j$053$3<<2)|0);
    $29 = HEAP32[$arrayidx29$3>>2]|0;
    $cmp30$3 = ($29|0)>($maxsc$055$3|0);
    $j$0$maxbit$0$3 = $cmp30$3 ? $j$053$3 : $maxbit$054$3;
    $$maxsc$0$3 = $cmp30$3 ? $29 : $maxsc$055$3;
    $inc36$3 = (($j$053$3) + 1)|0;
    $exitcond$3 = ($inc36$3|0)==($0|0);
    if ($exitcond$3) {
     $maxbit$0$lcssa$3 = $j$0$maxbit$0$3;
     break;
    } else {
     $j$053$3 = $inc36$3;$maxbit$054$3 = $j$0$maxbit$0$3;$maxsc$055$3 = $$maxsc$0$3;
    }
   }
  } else {
   $maxbit$0$lcssa$3 = -1;
  }
 }
 $arrayidx38$3 = (($BitBase) + 12|0);
 HEAP32[$arrayidx38$3>>2] = $maxbit$0$lcssa$3;
 $arrayidx39$3 = (($BitBaseScore) + ($maxbit$0$lcssa$3<<2)|0);
 HEAP32[$arrayidx39$3>>2] = -1;
 $8 = HEAP32[$BitBase>>2]|0;
 $arrayidx53 = (($BitBase) + 4|0);
 $9 = HEAP32[$arrayidx53>>2]|0;
 $cmp54 = ($8|0)>($9|0);
 if ($cmp54) {
  HEAP32[$BitBase>>2] = $9;
  HEAP32[$arrayidx53>>2] = $8;
 }
 $arrayidx51$1 = (($BitBase) + 4|0);
 $10 = HEAP32[$arrayidx51$1>>2]|0;
 $arrayidx53$1 = (($BitBase) + 8|0);
 $11 = HEAP32[$arrayidx53$1>>2]|0;
 $cmp54$1 = ($10|0)>($11|0);
 if ($cmp54$1) {
  HEAP32[$arrayidx51$1>>2] = $11;
  HEAP32[$arrayidx53$1>>2] = $10;
 }
 $arrayidx51$2 = (($BitBase) + 8|0);
 $13 = HEAP32[$arrayidx51$2>>2]|0;
 $arrayidx53$2 = (($BitBase) + 12|0);
 $14 = HEAP32[$arrayidx53$2>>2]|0;
 $cmp54$2 = ($13|0)>($14|0);
 if ($cmp54$2) {
  HEAP32[$arrayidx51$2>>2] = $14;
  HEAP32[$arrayidx53$2>>2] = $13;
 }
 $15 = HEAP32[$BitBase>>2]|0;
 $arrayidx53$166 = (($BitBase) + 4|0);
 $16 = HEAP32[$arrayidx53$166>>2]|0;
 $cmp54$167 = ($15|0)>($16|0);
 if ($cmp54$167) {
  HEAP32[$BitBase>>2] = $16;
  HEAP32[$arrayidx53$166>>2] = $15;
 }
 $arrayidx51$1$1 = (($BitBase) + 4|0);
 $17 = HEAP32[$arrayidx51$1$1>>2]|0;
 $arrayidx53$1$1 = (($BitBase) + 8|0);
 $18 = HEAP32[$arrayidx53$1$1>>2]|0;
 $cmp54$1$1 = ($17|0)>($18|0);
 if ($cmp54$1$1) {
  HEAP32[$arrayidx51$1$1>>2] = $18;
  HEAP32[$arrayidx53$1$1>>2] = $17;
 }
 $arrayidx51$2$1 = (($BitBase) + 8|0);
 $19 = HEAP32[$arrayidx51$2$1>>2]|0;
 $arrayidx53$2$1 = (($BitBase) + 12|0);
 $20 = HEAP32[$arrayidx53$2$1>>2]|0;
 $cmp54$2$1 = ($19|0)>($20|0);
 if ($cmp54$2$1) {
  HEAP32[$arrayidx51$2$1>>2] = $20;
  HEAP32[$arrayidx53$2$1>>2] = $19;
 }
 $21 = HEAP32[$BitBase>>2]|0;
 $arrayidx53$271 = (($BitBase) + 4|0);
 $22 = HEAP32[$arrayidx53$271>>2]|0;
 $cmp54$272 = ($21|0)>($22|0);
 if ($cmp54$272) {
  HEAP32[$BitBase>>2] = $22;
  HEAP32[$arrayidx53$271>>2] = $21;
 }
 $arrayidx51$1$2 = (($BitBase) + 4|0);
 $23 = HEAP32[$arrayidx51$1$2>>2]|0;
 $arrayidx53$1$2 = (($BitBase) + 8|0);
 $24 = HEAP32[$arrayidx53$1$2>>2]|0;
 $cmp54$1$2 = ($23|0)>($24|0);
 if ($cmp54$1$2) {
  HEAP32[$arrayidx51$1$2>>2] = $24;
  HEAP32[$arrayidx53$1$2>>2] = $23;
 }
 $arrayidx51$2$2 = (($BitBase) + 8|0);
 $25 = HEAP32[$arrayidx51$2$2>>2]|0;
 $arrayidx53$2$2 = (($BitBase) + 12|0);
 $26 = HEAP32[$arrayidx53$2$2>>2]|0;
 $cmp54$2$2 = ($25|0)>($26|0);
 if (!($cmp54$2$2)) {
  ;HEAP32[$rp2+0>>2]=HEAP32[$prp+0>>2]|0;HEAP32[$rp2+4>>2]=HEAP32[$prp+4>>2]|0;HEAP32[$rp2+8>>2]=HEAP32[$prp+8>>2]|0;HEAP32[$rp2+12>>2]=HEAP32[$prp+12>>2]|0;HEAP32[$rp2+16>>2]=HEAP32[$prp+16>>2]|0;
  _SyroComp_MakeMapBuffer($map_buffer,$rp2,$BitBase,4,$type);
  $12 = HEAP32[$NumOfSample10>>2]|0;
  _SyroComp_MakeMap_BitConv($map_buffer,$12,$0);
  ;HEAP32[$rp2+0>>2]=HEAP32[$prp+0>>2]|0;HEAP32[$rp2+4>>2]=HEAP32[$prp+4>>2]|0;HEAP32[$rp2+8>>2]=HEAP32[$prp+8>>2]|0;HEAP32[$rp2+12>>2]=HEAP32[$prp+12>>2]|0;HEAP32[$rp2+16>>2]=HEAP32[$prp+16>>2]|0;
  $call = (_SyroComp_GetCompSizeFromMap($map_buffer,$rp2,$type)|0);
  ;HEAP32[$pBitBase+0>>2]=HEAP32[$BitBase+0>>2]|0;HEAP32[$pBitBase+4>>2]=HEAP32[$BitBase+4>>2]|0;HEAP32[$pBitBase+8>>2]=HEAP32[$BitBase+8>>2]|0;HEAP32[$pBitBase+12>>2]=HEAP32[$BitBase+12>>2]|0;
  STACKTOP = sp;return ($call|0);
 }
 HEAP32[$arrayidx51$2$2>>2] = $26;
 HEAP32[$arrayidx53$2$2>>2] = $25;
 ;HEAP32[$rp2+0>>2]=HEAP32[$prp+0>>2]|0;HEAP32[$rp2+4>>2]=HEAP32[$prp+4>>2]|0;HEAP32[$rp2+8>>2]=HEAP32[$prp+8>>2]|0;HEAP32[$rp2+12>>2]=HEAP32[$prp+12>>2]|0;HEAP32[$rp2+16>>2]=HEAP32[$prp+16>>2]|0;
 _SyroComp_MakeMapBuffer($map_buffer,$rp2,$BitBase,4,$type);
 $12 = HEAP32[$NumOfSample10>>2]|0;
 _SyroComp_MakeMap_BitConv($map_buffer,$12,$0);
 ;HEAP32[$rp2+0>>2]=HEAP32[$prp+0>>2]|0;HEAP32[$rp2+4>>2]=HEAP32[$prp+4>>2]|0;HEAP32[$rp2+8>>2]=HEAP32[$prp+8>>2]|0;HEAP32[$rp2+12>>2]=HEAP32[$prp+12>>2]|0;HEAP32[$rp2+16>>2]=HEAP32[$prp+16>>2]|0;
 $call = (_SyroComp_GetCompSizeFromMap($map_buffer,$rp2,$type)|0);
 ;HEAP32[$pBitBase+0>>2]=HEAP32[$BitBase+0>>2]|0;HEAP32[$pBitBase+4>>2]=HEAP32[$BitBase+4>>2]|0;HEAP32[$pBitBase+8>>2]=HEAP32[$BitBase+8>>2]|0;HEAP32[$pBitBase+12>>2]=HEAP32[$BitBase+12>>2]|0;
 STACKTOP = sp;return ($call|0);
}
function _SyroComp_MakeMapBuffer($map_buffer,$prp,$pBitBase,$nBitBase,$type) {
 $map_buffer = $map_buffer|0;
 $prp = $prp|0;
 $pBitBase = $pBitBase|0;
 $nBitBase = $nBitBase|0;
 $type = $type|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $NumOfSample = 0, $arrayidx31 = 0, $arrayidx4 = 0, $arrayidx45 = 0, $arrayidx8 = 0, $bitlen_eff = 0, $bnum$0 = 0, $bnum$2 = 0, $bnum$3 = 0, $call11 = 0, $call13 = 0, $call15 = 0, $cmp = 0;
 var $cmp23 = 0, $cmp29 = 0, $cmp2931 = 0, $cmp33 = 0, $cmp38 = 0, $cmp47 = 0, $conv = 0, $conv2 = 0, $conv43 = 0, $conv6 = 0, $dat$sroa$1$0 = 0, $dat$sroa$2$0 = 0, $dat$sroa$2$0$phi = 0, $datn$0 = 0, $i$0$lcssa = 0, $i$032 = 0, $inc37 = 0, $inc44 = 0, $mcnt$0 = 0, $mul = 0;
 var $shl = 0, $sub21 = 0, $sub26 = 0, $sub26$datn$0 = 0, $sub30 = 0, $sub32 = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 _memset(($map_buffer|0),0,2048)|0;
 $bitlen_eff = (($prp) + 8|0);
 $0 = HEAP32[$bitlen_eff>>2]|0;
 $conv = $0&255;
 HEAP8[$map_buffer>>0] = $conv;
 $1 = HEAP32[$bitlen_eff>>2]|0;
 $conv2 = $1&255;
 $arrayidx4 = (($map_buffer) + 1|0);
 HEAP8[$arrayidx4>>0] = $conv2;
 $2 = HEAP32[$bitlen_eff>>2]|0;
 $conv6 = $2&255;
 $arrayidx8 = (($map_buffer) + 2|0);
 HEAP8[$arrayidx8>>0] = $conv6;
 $NumOfSample = (($prp) + 4|0);
 $3 = HEAP32[$NumOfSample>>2]|0;
 $cmp = ($3>>>0)<(4);
 if ($cmp) {
  STACKTOP = sp;return;
 }
 (_SyroComp_GetPcm($prp)|0);
 $call11 = (_SyroComp_GetPcm($prp)|0);
 $call13 = (_SyroComp_GetPcm($prp)|0);
 $tobool = ($type|0)==(0);
 $cmp2931 = ($nBitBase|0)>(0);
 $bnum$0 = 0;$dat$sroa$1$0 = $call13;$dat$sroa$2$0 = $call11;$mcnt$0 = 3;
 while(1) {
  $call15 = (_SyroComp_GetPcm($prp)|0);
  if ($tobool) {
   $datn$0 = $call15;
  } else {
   $mul = $dat$sroa$1$0 << 1;
   $sub30 = (($dat$sroa$2$0) - ($mul))|0;
   $sub21 = (($sub30) + ($call15))|0;
   $datn$0 = $sub21;
  }
  $cmp23 = ($datn$0|0)<(0);
  $sub26 = (0 - ($datn$0))|0;
  $sub26$datn$0 = $cmp23 ? $sub26 : $datn$0;
  L9: do {
   if ($cmp2931) {
    $i$032 = 0;
    while(1) {
     $arrayidx31 = (($pBitBase) + ($i$032<<2)|0);
     $4 = HEAP32[$arrayidx31>>2]|0;
     $sub32 = (($4) + -1)|0;
     $shl = 1 << $sub32;
     $cmp33 = ($sub26$datn$0|0)<($shl|0);
     $inc37 = (($i$032) + 1)|0;
     if ($cmp33) {
      $bnum$2 = $4;$i$0$lcssa = $i$032;
      break L9;
     }
     $cmp29 = ($inc37|0)<($nBitBase|0);
     if ($cmp29) {
      $i$032 = $inc37;
     } else {
      $bnum$2 = $4;$i$0$lcssa = $inc37;
      break;
     }
    }
   } else {
    $bnum$2 = $bnum$0;$i$0$lcssa = 0;
   }
  } while(0);
  $cmp38 = ($i$0$lcssa|0)==($nBitBase|0);
  if ($cmp38) {
   $5 = HEAP32[$bitlen_eff>>2]|0;
   $bnum$3 = $5;
  } else {
   $bnum$3 = $bnum$2;
  }
  $conv43 = $bnum$3&255;
  $inc44 = (($mcnt$0) + 1)|0;
  $arrayidx45 = (($map_buffer) + ($mcnt$0)|0);
  HEAP8[$arrayidx45>>0] = $conv43;
  $6 = HEAP32[$NumOfSample>>2]|0;
  $cmp47 = ($inc44|0)==($6|0);
  if ($cmp47) {
   break;
  } else {
   $dat$sroa$2$0$phi = $dat$sroa$1$0;$bnum$0 = $bnum$3;$dat$sroa$1$0 = $call15;$mcnt$0 = $inc44;$dat$sroa$2$0 = $dat$sroa$2$0$phi;
  }
 }
 STACKTOP = sp;return;
}
function _SyroComp_MakeMap_BitConv($map_buffer,$num_of_sample,$bitlen) {
 $map_buffer = $map_buffer|0;
 $num_of_sample = $num_of_sample|0;
 $bitlen = $bitlen|0;
 var $0 = 0, $1 = 0, $2 = 0, $add41 = 0, $add42 = 0, $arrayidx = 0, $arrayidx14 = 0, $cmp19 = 0, $cmp24 = 0, $cmp242 = 0, $cmp27 = 0, $cmp34 = 0, $cmp38 = 0, $cmp4 = 0, $cmp43 = 0, $cmp47 = 0, $cmp49 = 0, $cmp5 = 0, $cmp5340 = 0, $cmp7 = 0;
 var $cond = 0, $cond$cond18 = 0, $cond$cond18$cond18$cond = 0, $cond18 = 0, $cond18$cond = 0, $conv = 0, $conv15 = 0, $conv56 = 0, $exitcond = 0, $exitcond50 = 0, $i$048 = 0, $inc46 = 0, $inc46$add42 = 0, $inc67 = 0, $indvars$iv = 0, $indvars$iv$next = 0, $j$0$st$0 = 0, $min$0 = 0, $min$0$v = 0, $min$1 = 0;
 var $mul = 0, $or$cond = 0, $scevgep = 0, $st$046 = 0, $st$2 = 0, $sub = 0, $sub31 = 0, $sub32 = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $cmp47 = ($bitlen|0)>(0);
 if (!($cmp47)) {
  STACKTOP = sp;return;
 }
 $cmp242 = ($num_of_sample|0)>(-1);
 $i$048 = 0;
 while(1) {
  if ($cmp242) {
   $indvars$iv = 0;$st$046 = -1;
   while(1) {
    $cmp4 = ($indvars$iv|0)<($num_of_sample|0);
    if ($cmp4) {
     $arrayidx = (($map_buffer) + ($indvars$iv)|0);
     $0 = HEAP8[$arrayidx>>0]|0;
     $conv = $0&255;
     $cond = $conv;
    } else {
     $cond = 0;
    }
    $cmp5 = ($cond|0)==($i$048|0);
    $cmp7 = ($st$046|0)==(-1);
    if ($cmp5) {
     $j$0$st$0 = $cmp7 ? $indvars$iv : $st$046;
     $st$2 = $j$0$st$0;
    } else {
     if ($cmp7) {
      $st$2 = -1;
     } else {
      $tobool = ($st$046|0)==(0);
      if ($tobool) {
       $cond18 = 0;
      } else {
       $sub = (($st$046) + -1)|0;
       $arrayidx14 = (($map_buffer) + ($sub)|0);
       $1 = HEAP8[$arrayidx14>>0]|0;
       $conv15 = $1&255;
       $cond18 = $conv15;
      }
      $cmp19 = ($cond>>>0)<($cond18>>>0);
      $cond$cond18 = $cmp19 ? $cond : $cond18;
      $cond18$cond = $cmp19 ? $cond18 : $cond;
      $cmp24 = ($cond18$cond|0)>($i$048|0);
      if ($cmp24) {
       $cmp27 = ($cond$cond18|0)>($i$048|0);
       $cond$cond18$cond18$cond = $cmp27 ? $cond$cond18 : $cond18$cond;
       $sub31 = (($cond$cond18$cond18$cond) - ($i$048))|0;
       $sub32 = (($indvars$iv) - ($st$046))|0;
       $mul = Math_imul($sub31, $sub32)|0;
       $cmp34 = ($cond$cond18$cond18$cond|0)==($bitlen|0);
       $min$0$v = $cmp34 ? 3 : 2;
       $min$0 = (($min$0$v) + ($i$048))|0;
       $cmp38 = ($cond18$cond|0)==($cond$cond18|0);
       if ($cmp38) {
        $add41 = (($cond$cond18) + 2)|0;
        $cmp43 = ($cond$cond18|0)==($bitlen|0);
        $inc46 = $cmp43&1;
        $add42 = (($add41) + ($inc46))|0;
        $inc46$add42 = (($add42) + ($min$0))|0;
        $min$1 = $inc46$add42;
       } else {
        $min$1 = $min$0;
       }
       $cmp49 = ($min$1|0)>=($mul|0);
       $cmp5340 = ($st$046|0)<($indvars$iv|0);
       $or$cond = $cmp49 & $cmp5340;
       if ($or$cond) {
        $conv56 = $cond$cond18$cond18$cond&255;
        $scevgep = (($map_buffer) + ($st$046)|0);
        $2 = (($indvars$iv) - ($st$046))|0;
        _memset(($scevgep|0),($conv56|0),($2|0))|0;
        $st$2 = -1;
       } else {
        $st$2 = -1;
       }
      } else {
       $st$2 = -1;
      }
     }
    }
    $indvars$iv$next = (($indvars$iv) + 1)|0;
    $exitcond = ($indvars$iv|0)==($num_of_sample|0);
    if ($exitcond) {
     break;
    } else {
     $indvars$iv = $indvars$iv$next;$st$046 = $st$2;
    }
   }
  }
  $inc67 = (($i$048) + 1)|0;
  $exitcond50 = ($inc67|0)==($bitlen|0);
  if ($exitcond50) {
   break;
  } else {
   $i$048 = $inc67;
  }
 }
 STACKTOP = sp;return;
}
function _SyroComp_GetCompSizeFromMap($map_buffer,$prp,$type) {
 $map_buffer = $map_buffer|0;
 $prp = $prp|0;
 $type = $type|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $NumOfSample = 0, $add = 0, $add15 = 0, $add17 = 0, $add43 = 0, $arrayidx8 = 0, $bitlen_eff = 0, $call = 0, $cmp = 0, $cmp10 = 0, $cmp12 = 0, $cmp18 = 0, $cmp28 = 0, $cmp31 = 0, $cmp32 = 0;
 var $cmp44 = 0, $conv = 0, $conv9 = 0, $dat$0 = 0, $dath$sroa$1$037 = 0, $dath$sroa$2$036 = 0, $dath$sroa$2$036$phi = 0, $i$035 = 0, $inc = 0, $inc$add = 0, $inc34 = 0, $inc42 = 0, $inc47 = 0, $inc47$add43 = 0, $mul = 0, $or$cond = 0, $or$cond30 = 0, $pr$0$lcssa = 0, $pr$034 = 0, $pr$2 = 0;
 var $pr$3 = 0, $prbit$0$lcssa = 0, $prbit$033 = 0, $prbit$1 = 0, $sub = 0, $sub1 = 0, $sub2429 = 0, $sub25 = 0, $tobool = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $bitlen_eff = (($prp) + 8|0);
 $0 = HEAP32[$bitlen_eff>>2]|0;
 $sub = (($0) + -1)|0;
 $sub1 = -1 << $sub;
 $1 = HEAP8[$map_buffer>>0]|0;
 $conv = $1&255;
 $NumOfSample = (($prp) + 4|0);
 $2 = HEAP32[$NumOfSample>>2]|0;
 $cmp32 = ($2|0)>(0);
 if (!($cmp32)) {
  $pr$0$lcssa = 18;$prbit$0$lcssa = $conv;
  $add43 = (($pr$0$lcssa) + ($prbit$0$lcssa))|0;
  $cmp44 = ($prbit$0$lcssa|0)==($0|0);
  $inc47 = $cmp44&1;
  $inc47$add43 = (($add43) + ($inc47))|0;
  STACKTOP = sp;return ($inc47$add43|0);
 }
 $tobool = ($type|0)==(0);
 $dath$sroa$1$037 = 0;$dath$sroa$2$036 = 0;$i$035 = 0;$pr$034 = 18;$prbit$033 = $conv;
 while(1) {
  $call = (_SyroComp_GetPcm($prp)|0);
  $arrayidx8 = (($map_buffer) + ($i$035)|0);
  $3 = HEAP8[$arrayidx8>>0]|0;
  $conv9 = $3&255;
  $cmp10 = ($conv9|0)==($prbit$033|0);
  if ($cmp10) {
   $pr$2 = $pr$034;$prbit$1 = $prbit$033;
  } else {
   $cmp12 = ($prbit$033|0)==($0|0);
   $inc = $cmp12&1;
   $add = (($prbit$033) + 2)|0;
   $inc$add = (($add) + ($pr$034))|0;
   $add15 = (($inc$add) + ($inc))|0;
   $pr$2 = $add15;$prbit$1 = $conv9;
  }
  $add17 = (($pr$2) + ($conv9))|0;
  $cmp18 = ($prbit$1|0)>=($0|0);
  $or$cond = $cmp18 | $tobool;
  if ($or$cond) {
   $dat$0 = $call;
  } else {
   $mul = $dath$sroa$1$037 << 1;
   $sub2429 = (($dath$sroa$2$036) - ($mul))|0;
   $sub25 = (($sub2429) + ($call))|0;
   $dat$0 = $sub25;
  }
  $cmp28 = ($conv9|0)==($0|0);
  $cmp31 = ($dat$0|0)==($sub1|0);
  $or$cond30 = $cmp28 & $cmp31;
  $inc34 = $or$cond30&1;
  $pr$3 = (($add17) + ($inc34))|0;
  $inc42 = (($i$035) + 1)|0;
  $4 = HEAP32[$NumOfSample>>2]|0;
  $cmp = ($inc42|0)<($4|0);
  if ($cmp) {
   $dath$sroa$2$036$phi = $dath$sroa$1$037;$dath$sroa$1$037 = $call;$i$035 = $inc42;$pr$034 = $pr$3;$prbit$033 = $prbit$1;$dath$sroa$2$036 = $dath$sroa$2$036$phi;
  } else {
   $pr$0$lcssa = $pr$3;$prbit$0$lcssa = $prbit$1;
   break;
  }
 }
 $add43 = (($pr$0$lcssa) + ($prbit$0$lcssa))|0;
 $cmp44 = ($prbit$0$lcssa|0)==($0|0);
 $inc47 = $cmp44&1;
 $inc47$add43 = (($add43) + ($inc47))|0;
 STACKTOP = sp;return ($inc47$add43|0);
}
function _SyroVolcaSample_SetupBlock($psm) {
 $psm = $psm|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $CrcData = 0, $EccData = 0, $PoolData = 0, $PoolDataBit = 0, $TaskCount = 0, $TxBlockPos = 0, $TxBlockSize = 0, $UseCrc = 0, $UseEcc = 0, $arraydecay = 0, $call = 0, $call6 = 0, $cmp = 0, $cond = 0, $conv = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $TxBlockSize = (($psm) + 320|0);
 $0 = HEAP32[$TxBlockSize>>2]|0;
 $cmp = ($0|0)==(256);
 $cond = $cmp&1;
 $TxBlockPos = (($psm) + 324|0);
 HEAP32[$TxBlockPos>>2] = 0;
 $1 = HEAP32[$TxBlockSize>>2]|0;
 $TaskCount = (($psm) + 12|0);
 HEAP32[$TaskCount>>2] = $1;
 $UseEcc = (($psm) + 336|0);
 HEAP32[$UseEcc>>2] = $cond;
 $UseCrc = (($psm) + 344|0);
 HEAP32[$UseCrc>>2] = 1;
 $arraydecay = (($psm) + 64|0);
 $2 = HEAP32[$TxBlockSize>>2]|0;
 $call = (_SyroFunc_CalculateCrc16($arraydecay,$2)|0);
 $conv = $call&65535;
 $CrcData = (($psm) + 348|0);
 HEAP32[$CrcData>>2] = $conv;
 if (!($cmp)) {
  $PoolData = (($psm) + 328|0);
  HEAP32[$PoolData>>2] = 169;
  $PoolDataBit = (($psm) + 332|0);
  HEAP32[$PoolDataBit>>2] = 8;
  STACKTOP = sp;return;
 }
 $3 = HEAP32[$TxBlockSize>>2]|0;
 $call6 = (_SyroFunc_CalculateEcc($arraydecay,$3)|0);
 $EccData = (($psm) + 340|0);
 HEAP32[$EccData>>2] = $call6;
 $PoolData = (($psm) + 328|0);
 HEAP32[$PoolData>>2] = 169;
 $PoolDataBit = (($psm) + 332|0);
 HEAP32[$PoolDataBit>>2] = 8;
 STACKTOP = sp;return;
}
function _SyroVolcaSample_MakeData($psm,$write_page) {
 $psm = $psm|0;
 $write_page = $write_page|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $CrcData = 0, $EccData = 0;
 var $PoolData = 0, $PoolData20 = 0, $PoolDataBit = 0, $TaskCount = 0, $TxBlockPos = 0, $UseCrc = 0, $UseEcc = 0, $add = 0, $and = 0, $and$1 = 0, $arrayidx = 0, $arrayidx19 = 0, $arrayidx19$1 = 0, $bit$0 = 0, $cmp = 0, $conv = 0, $conv21 = 0, $conv21$1 = 0, $dat$0 = 0, $data_end$0 = 0;
 var $data_end$1 = 0, $dec = 0, $inc = 0, $or = 0, $shl = 0, $shr = 0, $shr$1 = 0, $sub = 0, $sub24 = 0, $sub24$1 = 0, $tobool = 0, $tobool3 = 0, $tobool7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $PoolDataBit = (($psm) + 332|0);
 $0 = HEAP32[$PoolDataBit>>2]|0;
 $cmp = ($0|0)<(6);
 if ($cmp) {
  $TaskCount = (($psm) + 12|0);
  $1 = HEAP32[$TaskCount>>2]|0;
  $tobool = ($1|0)==(0);
  do {
   if ($tobool) {
    $UseEcc = (($psm) + 336|0);
    $5 = HEAP32[$UseEcc>>2]|0;
    $tobool3 = ($5|0)==(0);
    if (!($tobool3)) {
     $EccData = (($psm) + 340|0);
     $6 = HEAP32[$EccData>>2]|0;
     HEAP32[$UseEcc>>2] = 0;
     $bit$0 = 24;$dat$0 = $6;$data_end$0 = 0;
     break;
    }
    $UseCrc = (($psm) + 344|0);
    $7 = HEAP32[$UseCrc>>2]|0;
    $tobool7 = ($7|0)==(0);
    if ($tobool7) {
     $sub = (6 - ($0))|0;
     $bit$0 = $sub;$dat$0 = 0;$data_end$0 = 1;
     break;
    } else {
     $CrcData = (($psm) + 348|0);
     $8 = HEAP32[$CrcData>>2]|0;
     HEAP32[$UseCrc>>2] = 0;
     $bit$0 = 16;$dat$0 = $8;$data_end$0 = 0;
     break;
    }
   } else {
    $TxBlockPos = (($psm) + 324|0);
    $2 = HEAP32[$TxBlockPos>>2]|0;
    $inc = (($2) + 1)|0;
    HEAP32[$TxBlockPos>>2] = $inc;
    $arrayidx = ((($psm) + ($2)|0) + 64|0);
    $3 = HEAP8[$arrayidx>>0]|0;
    $conv = $3&255;
    $4 = HEAP32[$TaskCount>>2]|0;
    $dec = (($4) + -1)|0;
    HEAP32[$TaskCount>>2] = $dec;
    $bit$0 = 8;$dat$0 = $conv;$data_end$0 = 0;
   }
  } while(0);
  $9 = HEAP32[$PoolDataBit>>2]|0;
  $shl = $dat$0 << $9;
  $PoolData = (($psm) + 328|0);
  $10 = HEAP32[$PoolData>>2]|0;
  $or = $10 | $shl;
  HEAP32[$PoolData>>2] = $or;
  $11 = HEAP32[$PoolDataBit>>2]|0;
  $add = (($11) + ($bit$0))|0;
  HEAP32[$PoolDataBit>>2] = $add;
  $data_end$1 = $data_end$0;
 } else {
  $data_end$1 = 0;
 }
 $PoolData20 = (($psm) + 328|0);
 $arrayidx19 = (($psm) + 352|0);
 $12 = HEAP32[$PoolData20>>2]|0;
 $and = $12 & 7;
 $conv21 = $and&255;
 _SyroFunc_GenerateSingleCycle($arrayidx19,$write_page,$conv21,1);
 $13 = HEAP32[$PoolData20>>2]|0;
 $shr = $13 >>> 3;
 HEAP32[$PoolData20>>2] = $shr;
 $14 = HEAP32[$PoolDataBit>>2]|0;
 $sub24 = (($14) + -3)|0;
 HEAP32[$PoolDataBit>>2] = $sub24;
 $arrayidx19$1 = (($psm) + 392|0);
 $15 = HEAP32[$PoolData20>>2]|0;
 $and$1 = $15 & 7;
 $conv21$1 = $and$1&255;
 _SyroFunc_GenerateSingleCycle($arrayidx19$1,$write_page,$conv21$1,1);
 $16 = HEAP32[$PoolData20>>2]|0;
 $shr$1 = $16 >>> 3;
 HEAP32[$PoolData20>>2] = $shr$1;
 $17 = HEAP32[$PoolDataBit>>2]|0;
 $sub24$1 = (($17) + -3)|0;
 HEAP32[$PoolDataBit>>2] = $sub24$1;
 STACKTOP = sp;return ($data_end$1|0);
}
function _SyroVolcaSample_GetFrameSize($num_of_block) {
 $num_of_block = $num_of_block|0;
 var $add1 = 0, $mul = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $mul = ($num_of_block*3096)|0;
 $add1 = (($mul) + 80392)|0;
 STACKTOP = sp;return ($add1|0);
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i144 = 0, $$pre$i66$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i145Z2D = 0, $$pre$phi$i67$iZ2D = 0, $$pre$phi$iZ2D = 0, $$pre$phiZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0;
 var $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0;
 var $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0;
 var $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0;
 var $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0;
 var $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0;
 var $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0;
 var $215 = 0, $216 = 0, $217 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0;
 var $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0;
 var $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0;
 var $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0;
 var $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F$0$i$i = 0, $F104$0 = 0, $F197$0$i = 0, $F224$0$i$i = 0, $F289$0$i = 0, $I252$0$i$i = 0, $I315$0$i = 0, $I57$0$c$i$i = 0, $I57$0$i$i = 0, $K105$017$i$i = 0, $K305$043$i$i = 0, $K372$024$i = 0;
 var $R$0$i = 0, $R$0$i$i = 0, $R$0$i135 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i137 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i134 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i69$i = 0, $T$016$i$i = 0, $T$023$i = 0, $T$042$i$i = 0, $add$i = 0, $add$i$i = 0, $add$i113 = 0, $add$i147 = 0, $add$ptr$i = 0;
 var $add$ptr$i$i = 0, $add$ptr$i$i$i = 0, $add$ptr$i10$i$i = 0, $add$ptr$i11$i = 0, $add$ptr$i126 = 0, $add$ptr$i160 = 0, $add$ptr$i22$i = 0, $add$ptr$i37$i = 0, $add$ptr$sum$i$i = 0, $add$ptr$sum$i141172 = 0, $add$ptr$sum$i173 = 0, $add$ptr$sum1$i = 0, $add$ptr$sum1$i142 = 0, $add$ptr$sum10$i = 0, $add$ptr$sum104 = 0, $add$ptr$sum11$i = 0, $add$ptr$sum12$i = 0, $add$ptr$sum13$i = 0, $add$ptr$sum14$i = 0, $add$ptr$sum2$i = 0;
 var $add$ptr$sum3$i = 0, $add$ptr$sum4$i = 0, $add$ptr$sum5$i = 0, $add$ptr$sum6$i = 0, $add$ptr$sum7$i = 0, $add$ptr$sum8$i = 0, $add$ptr$sum9$i = 0, $add$ptr14$i$i = 0, $add$ptr16$i$i = 0, $add$ptr16$sum$i$i = 0, $add$ptr16$sum23$i$i = 0, $add$ptr16$sum25$i$i = 0, $add$ptr16$sum2627$i$i = 0, $add$ptr16$sum2829$i$i = 0, $add$ptr16$sum3031$i$i = 0, $add$ptr16$sum32$i$i = 0, $add$ptr16$sum4$i$i = 0, $add$ptr16$sum56$i$i = 0, $add$ptr16$sum7$i$i = 0, $add$ptr165 = 0;
 var $add$ptr165$sum = 0, $add$ptr168 = 0, $add$ptr17$i$i = 0, $add$ptr17$sum$i$i = 0, $add$ptr17$sum10$i$i = 0, $add$ptr17$sum11$i$i = 0, $add$ptr17$sum12$i$i = 0, $add$ptr17$sum13$i$i = 0, $add$ptr17$sum16$i$i = 0, $add$ptr17$sum17$i$i = 0, $add$ptr17$sum18$i$i = 0, $add$ptr17$sum19$i$i = 0, $add$ptr17$sum20$i$i = 0, $add$ptr17$sum21$i$i = 0, $add$ptr17$sum22$i$i = 0, $add$ptr17$sum23$i$i = 0, $add$ptr17$sum33$i$i = 0, $add$ptr17$sum34$i$i = 0, $add$ptr17$sum35$i$i = 0, $add$ptr17$sum8$i$i = 0;
 var $add$ptr17$sum9$i$i = 0, $add$ptr177$sum = 0, $add$ptr181 = 0, $add$ptr181$sum$i = 0, $add$ptr186$i = 0, $add$ptr190 = 0, $add$ptr190$i = 0, $add$ptr190$sum = 0, $add$ptr196 = 0, $add$ptr2$sum$i$i = 0, $add$ptr2$sum1$i$i = 0, $add$ptr205$i$i = 0, $add$ptr212$i$i = 0, $add$ptr224$i = 0, $add$ptr224$sum$i = 0, $add$ptr224$sum131$i = 0, $add$ptr224$sum132$i = 0, $add$ptr224$sum133$i = 0, $add$ptr224$sum134$i = 0, $add$ptr224$sum135$i = 0;
 var $add$ptr224$sum136$i = 0, $add$ptr224$sum137$i = 0, $add$ptr224$sum138$i = 0, $add$ptr224$sum139$i = 0, $add$ptr224$sum140$i = 0, $add$ptr224$sum141$i = 0, $add$ptr224$sum142$i = 0, $add$ptr224$sum143$i = 0, $add$ptr225$i = 0, $add$ptr2418$i$i = 0, $add$ptr2420$i$i = 0, $add$ptr255$i = 0, $add$ptr255$sum$i = 0, $add$ptr262$i = 0, $add$ptr272$sum$i = 0, $add$ptr281$i = 0, $add$ptr3$i$i = 0, $add$ptr30$i$i = 0, $add$ptr30$i52$i = 0, $add$ptr30$sum$i$i = 0;
 var $add$ptr368$i$i = 0, $add$ptr4$i$i = 0, $add$ptr4$i$i$i = 0, $add$ptr4$i28$i = 0, $add$ptr4$i43$i = 0, $add$ptr4$sum$i$i = 0, $add$ptr4$sum$i$i$i = 0, $add$ptr4$sum$i31$i = 0, $add$ptr4$sum$i49$i = 0, $add$ptr4$sum1$i$i = 0, $add$ptr4$sum1415$i$i = 0, $add$ptr436$i = 0, $add$ptr5$i$i = 0, $add$ptr6$sum$i$i = 0, $add$ptr6$sum$i$i$i = 0, $add$ptr6$sum$i33$i = 0, $add$ptr7$i$i = 0, $add$ptr82$i$i = 0, $add$ptr95 = 0, $add$ptr95$sum102 = 0;
 var $add$ptr98 = 0, $add10$i = 0, $add107$i = 0, $add13$i = 0, $add137$i = 0, $add14$i = 0, $add143 = 0, $add147$i = 0, $add17$i = 0, $add17$i150 = 0, $add177$i = 0, $add18$i = 0, $add19$i = 0, $add2 = 0, $add20$i = 0, $add206$i$i = 0, $add209$i = 0, $add212$i = 0, $add22$i = 0, $add243$i = 0;
 var $add26$i$i = 0, $add267$i = 0, $add269$i$i = 0, $add274$i$i = 0, $add278$i$i = 0, $add280$i$i = 0, $add283$i$i = 0, $add336$i = 0, $add341$i = 0, $add345$i = 0, $add347$i = 0, $add350$i = 0, $add43$i = 0, $add48$i = 0, $add50 = 0, $add51$i = 0, $add54 = 0, $add58 = 0, $add62 = 0, $add64 = 0;
 var $add74$i = 0, $add74$i$i = 0, $add77$i = 0, $add79$i$i = 0, $add8 = 0, $add81$i = 0, $add83$i$i = 0, $add85$i = 0, $add85$i$i = 0, $add88$i$i = 0, $add89$i = 0, $add9$i = 0, $add91$i = 0, $add98$i = 0, $and = 0, $and$i = 0, $and$i$i = 0, $and$i$i$i = 0, $and$i110 = 0, $and$i12$i = 0;
 var $and$i14$i = 0, $and$i23$i = 0, $and$i38$i = 0, $and101$i = 0, $and103$i = 0, $and106 = 0, $and11$i = 0, $and119$i$i = 0, $and11914$i$i = 0, $and12$i = 0, $and13$i = 0, $and13$i$i = 0, $and133$i$i = 0, $and14 = 0, $and144 = 0, $and17$i = 0, $and191$i = 0, $and193$i = 0, $and199$i = 0, $and209$i$i = 0;
 var $and21$i = 0, $and21$i116 = 0, $and227$i$i = 0, $and233$i = 0, $and26$i = 0, $and264$i$i = 0, $and268$i$i = 0, $and273$i$i = 0, $and282$i$i = 0, $and291$i = 0, $and295$i$i = 0, $and3$i = 0, $and3$i$i = 0, $and3$i$i$i = 0, $and3$i25$i = 0, $and3$i40$i = 0, $and30$i = 0, $and318$i$i = 0, $and31840$i$i = 0, $and32$i = 0;
 var $and32$i$i = 0, $and33$i$i = 0, $and330$i = 0, $and335$i = 0, $and340$i = 0, $and349$i = 0, $and362$i = 0, $and37$i$i = 0, $and386$i = 0, $and38621$i = 0, $and39$i = 0, $and4 = 0, $and40$i$i = 0, $and41 = 0, $and43 = 0, $and46 = 0, $and46$i = 0, $and49 = 0, $and49$i$i = 0, $and53 = 0;
 var $and57 = 0, $and6$i = 0, $and6$i$i = 0, $and6$i44$i = 0, $and61 = 0, $and63$i = 0, $and67$i = 0, $and69$i$i = 0, $and7 = 0, $and7$i$i = 0, $and72$i = 0, $and73$i$i = 0, $and74 = 0, $and76$i = 0, $and77$$i = 0, $and77$i = 0, $and78$i$i = 0, $and8$i = 0, $and80$i = 0, $and84$i = 0;
 var $and87$i$i = 0, $and88$i = 0, $and9$i = 0, $and96$i$i = 0, $and99$i = 0, $arrayidx = 0, $arrayidx$i = 0, $arrayidx$i$i = 0, $arrayidx$i117 = 0, $arrayidx$i21$i = 0, $arrayidx$i57$i = 0, $arrayidx$sum = 0, $arrayidx$sum$i$i = 0, $arrayidx$sum$pre$i$i = 0, $arrayidx$sum1$i$i = 0, $arrayidx$sum9$i$i = 0, $arrayidx103 = 0, $arrayidx103$i$i = 0, $arrayidx103$sum$pre = 0, $arrayidx103$sum103 = 0;
 var $arrayidx105$i = 0, $arrayidx107$i$i = 0, $arrayidx112$i = 0, $arrayidx113$i = 0, $arrayidx121$i = 0, $arrayidx123$i$i = 0, $arrayidx126$i$i = 0, $arrayidx137$i = 0, $arrayidx143$i$i = 0, $arrayidx148$i = 0, $arrayidx150$i = 0, $arrayidx151$i$i = 0, $arrayidx154$i = 0, $arrayidx154$i131 = 0, $arrayidx160$i = 0, $arrayidx164$i = 0, $arrayidx165$i = 0, $arrayidx178$i$i = 0, $arrayidx183$i = 0, $arrayidx184$i$i = 0;
 var $arrayidx195$i$i = 0, $arrayidx196$i = 0, $arrayidx196$sum$pre$i = 0, $arrayidx196$sum2$i = 0, $arrayidx203$i = 0, $arrayidx211$i = 0, $arrayidx223$i$i = 0, $arrayidx223$sum$pre$i$i = 0, $arrayidx223$sum24$i$i = 0, $arrayidx227$i = 0, $arrayidx23$i = 0, $arrayidx238$i = 0, $arrayidx244$i = 0, $arrayidx255$i = 0, $arrayidx27$i = 0, $arrayidx287$i$i = 0, $arrayidx288$i = 0, $arrayidx288$sum$pre$i = 0, $arrayidx288$sum15$i = 0, $arrayidx290$i$i = 0;
 var $arrayidx325$i$i = 0, $arrayidx354$i = 0, $arrayidx357$i = 0, $arrayidx393$i = 0, $arrayidx40$i = 0, $arrayidx44$i = 0, $arrayidx61$i = 0, $arrayidx65$i = 0, $arrayidx66 = 0, $arrayidx66$sum = 0, $arrayidx71$i = 0, $arrayidx75$i = 0, $arrayidx91$i$i = 0, $arrayidx92$i$i = 0, $arrayidx93$i = 0, $arrayidx94$i = 0, $arrayidx96$i$i = 0, $bk = 0, $bk$i = 0, $bk$i$i = 0;
 var $bk$i128 = 0, $bk$i55$i = 0, $bk102$i$i = 0, $bk122 = 0, $bk124 = 0, $bk135$i = 0, $bk139$i$i = 0, $bk155$i$i = 0, $bk158$i$i = 0, $bk218$i = 0, $bk220$i = 0, $bk246$i$i = 0, $bk248$i$i = 0, $bk302$i$i = 0, $bk310$i = 0, $bk312$i = 0, $bk338$i$i = 0, $bk357$i$i = 0, $bk360$i$i = 0, $bk369$i = 0;
 var $bk406$i = 0, $bk425$i = 0, $bk428$i = 0, $bk43$i$i = 0, $bk47$i = 0, $bk55$i$i = 0, $bk67$i$i = 0, $bk74$i$i = 0, $bk78 = 0, $bk82$i$i = 0, $br$0$i = 0, $call$i$i = 0, $call104$i = 0, $call128$i = 0, $call129$i = 0, $call265$i = 0, $call34$$i = 0, $call34$i = 0, $call6$i$i = 0, $call65$i = 0;
 var $call80$$i = 0, $call80$i = 0, $child$i$i = 0, $child166$i$i = 0, $child289$i$i = 0, $child289$sum$i$i = 0, $child356$i = 0, $child356$sum$i = 0, $cmp = 0, $cmp$i = 0, $cmp$i$i$i = 0, $cmp$i107 = 0, $cmp$i11$i$i = 0, $cmp$i13$i = 0, $cmp$i146 = 0, $cmp$i15$i = 0, $cmp$i24$i = 0, $cmp$i39$i = 0, $cmp$i9$i = 0, $cmp1 = 0;
 var $cmp1$i = 0, $cmp1$i$i = 0, $cmp10 = 0, $cmp100$i$i = 0, $cmp101$i = 0, $cmp102$i = 0, $cmp104$i$i = 0, $cmp105$i = 0, $cmp106$i = 0, $cmp106$i$i = 0, $cmp107$i = 0, $cmp108$i$i = 0, $cmp112$i$i = 0, $cmp113 = 0, $cmp114$i = 0, $cmp115$i = 0, $cmp115$i162 = 0, $cmp118$i = 0, $cmp12$i = 0, $cmp120$i = 0;
 var $cmp120$i$i = 0, $cmp120$i63$i = 0, $cmp12015$i$i = 0, $cmp122$i = 0, $cmp124$i = 0, $cmp124$i$i = 0, $cmp126$i = 0, $cmp127$i = 0, $cmp128 = 0, $cmp128$i$i = 0, $cmp130$i = 0, $cmp132$i = 0, $cmp133$i$i = 0, $cmp134$i = 0, $cmp136$i = 0, $cmp137$i$i = 0, $cmp138 = 0, $cmp138$i = 0, $cmp138$i164 = 0, $cmp139$i = 0;
 var $cmp142$i = 0, $cmp144$i$i = 0, $cmp145 = 0, $cmp147$i$i = 0, $cmp148$i = 0, $cmp15 = 0, $cmp15$i = 0, $cmp150$i$i = 0, $cmp151$i = 0, $cmp154$i = 0, $cmp155 = 0, $cmp155$i = 0, $cmp155$i132 = 0, $cmp156$i = 0, $cmp156$i$i = 0, $cmp159$i = 0, $cmp159$i166 = 0, $cmp16 = 0, $cmp160$i$i = 0, $cmp161 = 0;
 var $cmp161$i = 0, $cmp165$i = 0, $cmp168$i$i = 0, $cmp170$i = 0, $cmp172$i$i = 0, $cmp174$i = 0, $cmp179$i = 0, $cmp183 = 0, $cmp183$i = 0, $cmp184$i = 0, $cmp185$i$i = 0, $cmp187$i = 0, $cmp189$i$i = 0, $cmp19$i = 0, $cmp191$i = 0, $cmp197$i = 0, $cmp2$i$i = 0, $cmp2$i$i$i = 0, $cmp20$i$i = 0, $cmp200$i = 0;
 var $cmp204$i = 0, $cmp206$i = 0, $cmp208$i = 0, $cmp21$i = 0, $cmp215$i = 0, $cmp215$i$i = 0, $cmp216$i = 0, $cmp220$i = 0, $cmp221$i = 0, $cmp225$i = 0, $cmp228$i = 0, $cmp232$i = 0, $cmp236$i$i = 0, $cmp24$i = 0, $cmp24$i$i = 0, $cmp245$i = 0, $cmp249$i = 0, $cmp250$i = 0, $cmp254$i$i = 0, $cmp258$i$i = 0;
 var $cmp26$i = 0, $cmp264$i = 0, $cmp27$i$i = 0, $cmp2719$i$i = 0, $cmp28$i = 0, $cmp28$i$i = 0, $cmp283$i = 0, $cmp29 = 0, $cmp29$i = 0, $cmp3$i$i = 0, $cmp300$i = 0, $cmp306$i$i = 0, $cmp31 = 0, $cmp318$i = 0, $cmp319$i$i = 0, $cmp31941$i$i = 0, $cmp32$i = 0, $cmp32$i152 = 0, $cmp322$i = 0, $cmp327$i$i = 0;
 var $cmp33$i = 0, $cmp332$i$i = 0, $cmp34$i = 0, $cmp34$i$i = 0, $cmp346$i$i = 0, $cmp35$i = 0, $cmp35$i154 = 0, $cmp350$i$i = 0, $cmp36$i = 0, $cmp36$i$i = 0, $cmp373$i = 0, $cmp38$i$i = 0, $cmp387$i = 0, $cmp38722$i = 0, $cmp395$i = 0, $cmp40$i = 0, $cmp40$i155 = 0, $cmp400$i = 0, $cmp41$i$i = 0, $cmp414$i = 0;
 var $cmp418$i = 0, $cmp42$i$i = 0, $cmp44$i$i = 0, $cmp45$i = 0, $cmp45$i123 = 0, $cmp46$i = 0, $cmp46$i$i = 0, $cmp46$i59$i = 0, $cmp48$i = 0, $cmp49$i = 0, $cmp5 = 0, $cmp51$i = 0, $cmp52$i = 0, $cmp54$i = 0, $cmp54$i$i = 0, $cmp54$i156 = 0, $cmp56$i = 0, $cmp57$i = 0, $cmp57$i$i = 0, $cmp59$i$i = 0;
 var $cmp60$i = 0, $cmp60$i$i = 0, $cmp62$i = 0, $cmp63$i = 0, $cmp63$i$i = 0, $cmp64$i = 0, $cmp66$i = 0, $cmp66$i158 = 0, $cmp7$i$i = 0, $cmp70 = 0, $cmp72$i = 0, $cmp75$i$i = 0, $cmp76 = 0, $cmp76$i = 0, $cmp78$i = 0, $cmp79 = 0, $cmp81$i = 0, $cmp81$i$i = 0, $cmp82$i = 0, $cmp83$i$i = 0;
 var $cmp86$i = 0, $cmp86$i$i = 0, $cmp88$i = 0, $cmp9$i$i = 0, $cmp90$i = 0, $cmp90$i161 = 0, $cmp93$i = 0, $cmp95$i = 0, $cmp96$i = 0, $cmp9626$i = 0, $cmp97$i$i = 0, $cmp99 = 0, $cond = 0, $cond$i = 0, $cond$i$i = 0, $cond$i$i$i = 0, $cond$i17$i = 0, $cond$i27$i = 0, $cond$i42$i = 0, $cond$v$0$i = 0;
 var $cond115$i$i = 0, $cond13$i$i = 0, $cond15$i$i = 0, $cond18$i = 0, $cond315$i$i = 0, $cond37$i$i = 0, $cond382$i = 0, $cond4$i = 0, $cond6$i = 0, $exitcond$i$i = 0, $fd$i = 0, $fd$i$i = 0, $fd$i129 = 0, $fd103$i$i = 0, $fd123 = 0, $fd138$i = 0, $fd140$i$i = 0, $fd145$i$i = 0, $fd157$i$i = 0, $fd219$i = 0;
 var $fd247$i$i = 0, $fd303$i$i = 0, $fd311$i = 0, $fd339$i$i = 0, $fd344$i$i = 0, $fd359$i$i = 0, $fd370$i = 0, $fd407$i = 0, $fd412$i = 0, $fd427$i = 0, $fd50$i = 0, $fd54$i$i = 0, $fd59$i$i = 0, $fd68$pre$i$i = 0, $fd68$pre$phi$i$iZ2D = 0, $fd69 = 0, $fd78$i$i = 0, $fd85$i$i = 0, $fd9 = 0, $head = 0;
 var $head$i = 0, $head$i$i = 0, $head$i$i$i = 0, $head$i122 = 0, $head$i18$i = 0, $head$i32$i = 0, $head$i50$i = 0, $head118$i$i = 0, $head11813$i$i = 0, $head167 = 0, $head172 = 0, $head176 = 0, $head178 = 0, $head179$i = 0, $head182$i = 0, $head187$i = 0, $head189$i = 0, $head192 = 0, $head195 = 0, $head208$i$i = 0;
 var $head211$i$i = 0, $head23$i$i = 0, $head25 = 0, $head258$i = 0, $head261$i = 0, $head270$i = 0, $head273$i = 0, $head278$i = 0, $head280$i = 0, $head29$i = 0, $head29$i$i = 0, $head31$i$i = 0, $head317$i$i = 0, $head31739$i$i = 0, $head32$i$i = 0, $head34$i$i = 0, $head385$i = 0, $head38520$i = 0, $head7$i$i = 0, $head7$i$i$i = 0;
 var $head7$i34$i = 0, $head94 = 0, $head97 = 0, $head98$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $inc$i$i = 0, $index$i = 0, $index$i$i = 0, $index$i138 = 0, $index$i64$i = 0, $index288$i$i = 0, $index355$i = 0, $mem$0 = 0, $nb$0 = 0, $neg = 0, $neg$i = 0, $neg$i$i = 0, $neg$i139 = 0, $neg$i149 = 0;
 var $neg100$i = 0, $neg13 = 0, $neg132$i$i = 0, $neg45$i = 0, $neg73 = 0, $next$i = 0, $next$i$i = 0, $next$i$i$i = 0, $next228$i = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i157 = 0, $or$cond1$i = 0, $or$cond16$i = 0, $or$cond2$i = 0, $or$cond3$i = 0, $or$cond4$i = 0, $or$cond6$not$i = 0;
 var $or$cond7$i = 0, $or$cond8$i = 0, $or$cond93$i = 0, $or$i = 0, $or$i$i = 0, $or$i$i$i = 0, $or$i163 = 0, $or$i30$i = 0, $or101$i$i = 0, $or110 = 0, $or166 = 0, $or171 = 0, $or175 = 0, $or178$i = 0, $or179 = 0, $or183$i = 0, $or186$i = 0, $or188$i = 0, $or19$i$i = 0, $or191 = 0;
 var $or194 = 0, $or204$i = 0, $or210$i$i = 0, $or22$i$i = 0, $or23 = 0, $or232$i$i = 0, $or257$i = 0, $or26 = 0, $or260$i = 0, $or269$i = 0, $or274$i = 0, $or277$i = 0, $or279$i = 0, $or28$i$i = 0, $or296$i = 0, $or300$i$i = 0, $or33$i$i = 0, $or367$i = 0, $or40 = 0, $or44$i$i = 0;
 var $or93 = 0, $or96 = 0, $parent$i = 0, $parent$i$i = 0, $parent$i127 = 0, $parent$i61$i = 0, $parent135$i = 0, $parent138$i$i = 0, $parent149$i = 0, $parent159$i$i = 0, $parent165$i$i = 0, $parent166$i = 0, $parent179$i$i = 0, $parent196$i$i = 0, $parent225$i = 0, $parent239$i = 0, $parent256$i = 0, $parent301$i$i = 0, $parent337$i$i = 0, $parent361$i$i = 0;
 var $parent368$i = 0, $parent405$i = 0, $parent429$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i120 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$328$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sflags190$i = 0, $sflags232$i = 0, $shl = 0, $shl$i = 0, $shl$i$i = 0, $shl$i111 = 0, $shl$i20$i = 0, $shl$i56$i = 0;
 var $shl102 = 0, $shl105 = 0, $shl116$i$i = 0, $shl12 = 0, $shl127$i$i = 0, $shl131$i$i = 0, $shl15$i = 0, $shl18$i = 0, $shl191$i = 0, $shl195$i = 0, $shl198$i = 0, $shl22 = 0, $shl221$i$i = 0, $shl226$i$i = 0, $shl265$i$i = 0, $shl270$i$i = 0, $shl276$i$i = 0, $shl279$i$i = 0, $shl287$i = 0, $shl290$i = 0;
 var $shl294$i$i = 0, $shl31$i = 0, $shl316$i$i = 0, $shl326$i$i = 0, $shl332$i = 0, $shl337$i = 0, $shl343$i = 0, $shl346$i = 0, $shl35 = 0, $shl361$i = 0, $shl37 = 0, $shl383$i = 0, $shl39$i$i = 0, $shl394$i = 0, $shl48$i$i = 0, $shl52$i = 0, $shl59$i = 0, $shl65 = 0, $shl70$i$i = 0, $shl72 = 0;
 var $shl75$i$i = 0, $shl81$i$i = 0, $shl84$i$i = 0, $shl9$i = 0, $shl90 = 0, $shl95$i$i = 0, $shr = 0, $shr$i = 0, $shr$i$i = 0, $shr$i106 = 0, $shr$i54$i = 0, $shr101 = 0, $shr11$i = 0, $shr11$i114 = 0, $shr110$i$i = 0, $shr12$i = 0, $shr123$i$i = 0, $shr15$i = 0, $shr16$i = 0, $shr16$i115 = 0;
 var $shr19$i = 0, $shr194$i = 0, $shr20$i = 0, $shr214$i$i = 0, $shr253$i$i = 0, $shr263$i$i = 0, $shr267$i$i = 0, $shr27$i = 0, $shr272$i$i = 0, $shr277$i$i = 0, $shr281$i$i = 0, $shr282$i = 0, $shr3 = 0, $shr310$i$i = 0, $shr317$i = 0, $shr322$i$i = 0, $shr329$i = 0, $shr334$i = 0, $shr339$i = 0, $shr344$i = 0;
 var $shr348$i = 0, $shr377$i = 0, $shr390$i = 0, $shr4$i = 0, $shr41$i = 0, $shr45 = 0, $shr47 = 0, $shr48 = 0, $shr5$i = 0, $shr5$i109 = 0, $shr51 = 0, $shr52 = 0, $shr55 = 0, $shr56 = 0, $shr58$i$i = 0, $shr59 = 0, $shr60 = 0, $shr63 = 0, $shr68$i$i = 0, $shr7$i = 0;
 var $shr7$i112 = 0, $shr71$i = 0, $shr72$i$i = 0, $shr74$i = 0, $shr75$i = 0, $shr77$i$i = 0, $shr78$i = 0, $shr79$i = 0, $shr8$i = 0, $shr82$i = 0, $shr82$i$i = 0, $shr83$i = 0, $shr86$i = 0, $shr86$i$i = 0, $shr87$i = 0, $shr90$i = 0, $size$i$i = 0, $size$i$i$i = 0, $size185$i = 0, $size242$i = 0;
 var $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$0109$i = 0, $sp$1105$i = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $sub = 0, $sub$i = 0, $sub$i$i = 0, $sub$i105 = 0, $sub$i148 = 0, $sub$ptr$lhs$cast$i = 0, $sub$ptr$lhs$cast$i$i = 0, $sub$ptr$lhs$cast$i46$i = 0, $sub$ptr$rhs$cast$i = 0, $sub$ptr$rhs$cast$i$i = 0, $sub$ptr$rhs$cast$i47$i = 0;
 var $sub$ptr$sub$i = 0, $sub$ptr$sub$i$i = 0, $sub$ptr$sub$i48$i = 0, $sub$ptr$sub$tsize$1$i = 0, $sub10$i = 0, $sub100$i = 0, $sub100$rsize$3$i = 0, $sub109$i = 0, $sub113$i$i = 0, $sub117$i = 0, $sub14$i = 0, $sub159 = 0, $sub16$i$i = 0, $sub169$i = 0, $sub18$i$i = 0, $sub187 = 0, $sub2$i = 0, $sub22$i = 0, $sub253$i = 0, $sub262$i$i = 0;
 var $sub266$i$i = 0, $sub271$i$i = 0, $sub275$i$i = 0, $sub30$i = 0, $sub31$i = 0, $sub31$rsize$0$i = 0, $sub313$i$i = 0, $sub328$i = 0, $sub33$i = 0, $sub333$i = 0, $sub338$i = 0, $sub342$i = 0, $sub38$i = 0, $sub380$i = 0, $sub4$i = 0, $sub42 = 0, $sub44 = 0, $sub47$i = 0, $sub5$i$i = 0, $sub5$i$i$i = 0;
 var $sub5$i29$i = 0, $sub6$i = 0, $sub62$i = 0, $sub66$i = 0, $sub67$i$i = 0, $sub69$i = 0, $sub71$i$i = 0, $sub76$i$i = 0, $sub80$i$i = 0, $sub91 = 0, $sub96$i = 0, $t$0$i = 0, $t$0$i119 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$227$i = 0, $tbase$0$i = 0, $tbase$291$i = 0, $tobool$i$i = 0;
 var $tobool107 = 0, $tobool192$i = 0, $tobool200$i = 0, $tobool228$i$i = 0, $tobool234$i = 0, $tobool27$i = 0, $tobool292$i = 0, $tobool296$i$i = 0, $tobool363$i = 0, $tobool97$i$i = 0, $tsize$0$i = 0, $tsize$0748284$i = 0, $tsize$1$i = 0, $tsize$290$i = 0, $v$0$i = 0, $v$0$i121 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$329$i = 0;
 var $xor$i$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $cmp = ($bytes>>>0)<(245);
 do {
  if ($cmp) {
   $cmp1 = ($bytes>>>0)<(11);
   if ($cmp1) {
    $cond = 16;
   } else {
    $add2 = (($bytes) + 11)|0;
    $and = $add2 & -8;
    $cond = $and;
   }
   $shr = $cond >>> 3;
   $0 = HEAP32[1344>>2]|0;
   $shr3 = $0 >>> $shr;
   $and4 = $shr3 & 3;
   $cmp5 = ($and4|0)==(0);
   if (!($cmp5)) {
    $neg = $shr3 & 1;
    $and7 = $neg ^ 1;
    $add8 = (($and7) + ($shr))|0;
    $shl = $add8 << 1;
    $arrayidx = ((1344 + ($shl<<2)|0) + 40|0);
    $arrayidx$sum = (($shl) + 2)|0;
    $1 = ((1344 + ($arrayidx$sum<<2)|0) + 40|0);
    $2 = HEAP32[$1>>2]|0;
    $fd9 = (($2) + 8|0);
    $3 = HEAP32[$fd9>>2]|0;
    $cmp10 = ($arrayidx|0)==($3|0);
    do {
     if ($cmp10) {
      $shl12 = 1 << $add8;
      $neg13 = $shl12 ^ -1;
      $and14 = $0 & $neg13;
      HEAP32[1344>>2] = $and14;
     } else {
      $4 = HEAP32[((1344 + 16|0))>>2]|0;
      $cmp15 = ($3>>>0)<($4>>>0);
      if ($cmp15) {
       _abort();
       // unreachable;
      }
      $bk = (($3) + 12|0);
      $5 = HEAP32[$bk>>2]|0;
      $cmp16 = ($5|0)==($2|0);
      if ($cmp16) {
       HEAP32[$bk>>2] = $arrayidx;
       HEAP32[$1>>2] = $3;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $shl22 = $add8 << 3;
    $or23 = $shl22 | 3;
    $head = (($2) + 4|0);
    HEAP32[$head>>2] = $or23;
    $add$ptr$sum104 = $shl22 | 4;
    $head25 = (($2) + ($add$ptr$sum104)|0);
    $6 = HEAP32[$head25>>2]|0;
    $or26 = $6 | 1;
    HEAP32[$head25>>2] = $or26;
    $mem$0 = $fd9;
    STACKTOP = sp;return ($mem$0|0);
   }
   $7 = HEAP32[((1344 + 8|0))>>2]|0;
   $cmp29 = ($cond>>>0)>($7>>>0);
   if ($cmp29) {
    $cmp31 = ($shr3|0)==(0);
    if (!($cmp31)) {
     $shl35 = $shr3 << $shr;
     $shl37 = 2 << $shr;
     $sub = (0 - ($shl37))|0;
     $or40 = $shl37 | $sub;
     $and41 = $shl35 & $or40;
     $sub42 = (0 - ($and41))|0;
     $and43 = $and41 & $sub42;
     $sub44 = (($and43) + -1)|0;
     $shr45 = $sub44 >>> 12;
     $and46 = $shr45 & 16;
     $shr47 = $sub44 >>> $and46;
     $shr48 = $shr47 >>> 5;
     $and49 = $shr48 & 8;
     $add50 = $and49 | $and46;
     $shr51 = $shr47 >>> $and49;
     $shr52 = $shr51 >>> 2;
     $and53 = $shr52 & 4;
     $add54 = $add50 | $and53;
     $shr55 = $shr51 >>> $and53;
     $shr56 = $shr55 >>> 1;
     $and57 = $shr56 & 2;
     $add58 = $add54 | $and57;
     $shr59 = $shr55 >>> $and57;
     $shr60 = $shr59 >>> 1;
     $and61 = $shr60 & 1;
     $add62 = $add58 | $and61;
     $shr63 = $shr59 >>> $and61;
     $add64 = (($add62) + ($shr63))|0;
     $shl65 = $add64 << 1;
     $arrayidx66 = ((1344 + ($shl65<<2)|0) + 40|0);
     $arrayidx66$sum = (($shl65) + 2)|0;
     $8 = ((1344 + ($arrayidx66$sum<<2)|0) + 40|0);
     $9 = HEAP32[$8>>2]|0;
     $fd69 = (($9) + 8|0);
     $10 = HEAP32[$fd69>>2]|0;
     $cmp70 = ($arrayidx66|0)==($10|0);
     do {
      if ($cmp70) {
       $shl72 = 1 << $add64;
       $neg73 = $shl72 ^ -1;
       $and74 = $0 & $neg73;
       HEAP32[1344>>2] = $and74;
      } else {
       $11 = HEAP32[((1344 + 16|0))>>2]|0;
       $cmp76 = ($10>>>0)<($11>>>0);
       if ($cmp76) {
        _abort();
        // unreachable;
       }
       $bk78 = (($10) + 12|0);
       $12 = HEAP32[$bk78>>2]|0;
       $cmp79 = ($12|0)==($9|0);
       if ($cmp79) {
        HEAP32[$bk78>>2] = $arrayidx66;
        HEAP32[$8>>2] = $10;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $shl90 = $add64 << 3;
     $sub91 = (($shl90) - ($cond))|0;
     $or93 = $cond | 3;
     $head94 = (($9) + 4|0);
     HEAP32[$head94>>2] = $or93;
     $add$ptr95 = (($9) + ($cond)|0);
     $or96 = $sub91 | 1;
     $add$ptr95$sum102 = $cond | 4;
     $head97 = (($9) + ($add$ptr95$sum102)|0);
     HEAP32[$head97>>2] = $or96;
     $add$ptr98 = (($9) + ($shl90)|0);
     HEAP32[$add$ptr98>>2] = $sub91;
     $13 = HEAP32[((1344 + 8|0))>>2]|0;
     $cmp99 = ($13|0)==(0);
     if (!($cmp99)) {
      $14 = HEAP32[((1344 + 20|0))>>2]|0;
      $shr101 = $13 >>> 3;
      $shl102 = $shr101 << 1;
      $arrayidx103 = ((1344 + ($shl102<<2)|0) + 40|0);
      $15 = HEAP32[1344>>2]|0;
      $shl105 = 1 << $shr101;
      $and106 = $15 & $shl105;
      $tobool107 = ($and106|0)==(0);
      if ($tobool107) {
       $or110 = $15 | $shl105;
       HEAP32[1344>>2] = $or110;
       $arrayidx103$sum$pre = (($shl102) + 2)|0;
       $$pre = ((1344 + ($arrayidx103$sum$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F104$0 = $arrayidx103;
      } else {
       $arrayidx103$sum103 = (($shl102) + 2)|0;
       $16 = ((1344 + ($arrayidx103$sum103<<2)|0) + 40|0);
       $17 = HEAP32[$16>>2]|0;
       $18 = HEAP32[((1344 + 16|0))>>2]|0;
       $cmp113 = ($17>>>0)<($18>>>0);
       if ($cmp113) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $16;$F104$0 = $17;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $14;
      $bk122 = (($F104$0) + 12|0);
      HEAP32[$bk122>>2] = $14;
      $fd123 = (($14) + 8|0);
      HEAP32[$fd123>>2] = $F104$0;
      $bk124 = (($14) + 12|0);
      HEAP32[$bk124>>2] = $arrayidx103;
     }
     HEAP32[((1344 + 8|0))>>2] = $sub91;
     HEAP32[((1344 + 20|0))>>2] = $add$ptr95;
     $mem$0 = $fd69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $19 = HEAP32[((1344 + 4|0))>>2]|0;
    $cmp128 = ($19|0)==(0);
    if ($cmp128) {
     $nb$0 = $cond;
    } else {
     $sub$i = (0 - ($19))|0;
     $and$i = $19 & $sub$i;
     $sub2$i = (($and$i) + -1)|0;
     $shr$i = $sub2$i >>> 12;
     $and3$i = $shr$i & 16;
     $shr4$i = $sub2$i >>> $and3$i;
     $shr5$i = $shr4$i >>> 5;
     $and6$i = $shr5$i & 8;
     $add$i = $and6$i | $and3$i;
     $shr7$i = $shr4$i >>> $and6$i;
     $shr8$i = $shr7$i >>> 2;
     $and9$i = $shr8$i & 4;
     $add10$i = $add$i | $and9$i;
     $shr11$i = $shr7$i >>> $and9$i;
     $shr12$i = $shr11$i >>> 1;
     $and13$i = $shr12$i & 2;
     $add14$i = $add10$i | $and13$i;
     $shr15$i = $shr11$i >>> $and13$i;
     $shr16$i = $shr15$i >>> 1;
     $and17$i = $shr16$i & 1;
     $add18$i = $add14$i | $and17$i;
     $shr19$i = $shr15$i >>> $and17$i;
     $add20$i = (($add18$i) + ($shr19$i))|0;
     $arrayidx$i = ((1344 + ($add20$i<<2)|0) + 304|0);
     $20 = HEAP32[$arrayidx$i>>2]|0;
     $head$i = (($20) + 4|0);
     $21 = HEAP32[$head$i>>2]|0;
     $and21$i = $21 & -8;
     $sub22$i = (($and21$i) - ($cond))|0;
     $rsize$0$i = $sub22$i;$t$0$i = $20;$v$0$i = $20;
     while(1) {
      $arrayidx23$i = (($t$0$i) + 16|0);
      $22 = HEAP32[$arrayidx23$i>>2]|0;
      $cmp$i = ($22|0)==(0|0);
      if ($cmp$i) {
       $arrayidx27$i = (($t$0$i) + 20|0);
       $23 = HEAP32[$arrayidx27$i>>2]|0;
       $cmp28$i = ($23|0)==(0|0);
       if ($cmp28$i) {
        break;
       } else {
        $cond6$i = $23;
       }
      } else {
       $cond6$i = $22;
      }
      $head29$i = (($cond6$i) + 4|0);
      $24 = HEAP32[$head29$i>>2]|0;
      $and30$i = $24 & -8;
      $sub31$i = (($and30$i) - ($cond))|0;
      $cmp32$i = ($sub31$i>>>0)<($rsize$0$i>>>0);
      $sub31$rsize$0$i = $cmp32$i ? $sub31$i : $rsize$0$i;
      $cond$v$0$i = $cmp32$i ? $cond6$i : $v$0$i;
      $rsize$0$i = $sub31$rsize$0$i;$t$0$i = $cond6$i;$v$0$i = $cond$v$0$i;
     }
     $25 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp33$i = ($v$0$i>>>0)<($25>>>0);
     if ($cmp33$i) {
      _abort();
      // unreachable;
     }
     $add$ptr$i = (($v$0$i) + ($cond)|0);
     $cmp35$i = ($v$0$i>>>0)<($add$ptr$i>>>0);
     if (!($cmp35$i)) {
      _abort();
      // unreachable;
     }
     $parent$i = (($v$0$i) + 24|0);
     $26 = HEAP32[$parent$i>>2]|0;
     $bk$i = (($v$0$i) + 12|0);
     $27 = HEAP32[$bk$i>>2]|0;
     $cmp40$i = ($27|0)==($v$0$i|0);
     do {
      if ($cmp40$i) {
       $arrayidx61$i = (($v$0$i) + 20|0);
       $31 = HEAP32[$arrayidx61$i>>2]|0;
       $cmp62$i = ($31|0)==(0|0);
       if ($cmp62$i) {
        $arrayidx65$i = (($v$0$i) + 16|0);
        $32 = HEAP32[$arrayidx65$i>>2]|0;
        $cmp66$i = ($32|0)==(0|0);
        if ($cmp66$i) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $32;$RP$0$i = $arrayidx65$i;
        }
       } else {
        $R$0$i = $31;$RP$0$i = $arrayidx61$i;
       }
       while(1) {
        $arrayidx71$i = (($R$0$i) + 20|0);
        $33 = HEAP32[$arrayidx71$i>>2]|0;
        $cmp72$i = ($33|0)==(0|0);
        if (!($cmp72$i)) {
         $R$0$i = $33;$RP$0$i = $arrayidx71$i;
         continue;
        }
        $arrayidx75$i = (($R$0$i) + 16|0);
        $34 = HEAP32[$arrayidx75$i>>2]|0;
        $cmp76$i = ($34|0)==(0|0);
        if ($cmp76$i) {
         break;
        } else {
         $R$0$i = $34;$RP$0$i = $arrayidx75$i;
        }
       }
       $cmp81$i = ($RP$0$i>>>0)<($25>>>0);
       if ($cmp81$i) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $fd$i = (($v$0$i) + 8|0);
       $28 = HEAP32[$fd$i>>2]|0;
       $cmp45$i = ($28>>>0)<($25>>>0);
       if ($cmp45$i) {
        _abort();
        // unreachable;
       }
       $bk47$i = (($28) + 12|0);
       $29 = HEAP32[$bk47$i>>2]|0;
       $cmp48$i = ($29|0)==($v$0$i|0);
       if (!($cmp48$i)) {
        _abort();
        // unreachable;
       }
       $fd50$i = (($27) + 8|0);
       $30 = HEAP32[$fd50$i>>2]|0;
       $cmp51$i = ($30|0)==($v$0$i|0);
       if ($cmp51$i) {
        HEAP32[$bk47$i>>2] = $27;
        HEAP32[$fd50$i>>2] = $28;
        $R$1$i = $27;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $cmp90$i = ($26|0)==(0|0);
     do {
      if (!($cmp90$i)) {
       $index$i = (($v$0$i) + 28|0);
       $35 = HEAP32[$index$i>>2]|0;
       $arrayidx94$i = ((1344 + ($35<<2)|0) + 304|0);
       $36 = HEAP32[$arrayidx94$i>>2]|0;
       $cmp95$i = ($v$0$i|0)==($36|0);
       if ($cmp95$i) {
        HEAP32[$arrayidx94$i>>2] = $R$1$i;
        $cond4$i = ($R$1$i|0)==(0|0);
        if ($cond4$i) {
         $shl$i = 1 << $35;
         $neg$i = $shl$i ^ -1;
         $37 = HEAP32[((1344 + 4|0))>>2]|0;
         $and103$i = $37 & $neg$i;
         HEAP32[((1344 + 4|0))>>2] = $and103$i;
         break;
        }
       } else {
        $38 = HEAP32[((1344 + 16|0))>>2]|0;
        $cmp107$i = ($26>>>0)<($38>>>0);
        if ($cmp107$i) {
         _abort();
         // unreachable;
        }
        $arrayidx113$i = (($26) + 16|0);
        $39 = HEAP32[$arrayidx113$i>>2]|0;
        $cmp114$i = ($39|0)==($v$0$i|0);
        if ($cmp114$i) {
         HEAP32[$arrayidx113$i>>2] = $R$1$i;
        } else {
         $arrayidx121$i = (($26) + 20|0);
         HEAP32[$arrayidx121$i>>2] = $R$1$i;
        }
        $cmp126$i = ($R$1$i|0)==(0|0);
        if ($cmp126$i) {
         break;
        }
       }
       $40 = HEAP32[((1344 + 16|0))>>2]|0;
       $cmp130$i = ($R$1$i>>>0)<($40>>>0);
       if ($cmp130$i) {
        _abort();
        // unreachable;
       }
       $parent135$i = (($R$1$i) + 24|0);
       HEAP32[$parent135$i>>2] = $26;
       $arrayidx137$i = (($v$0$i) + 16|0);
       $41 = HEAP32[$arrayidx137$i>>2]|0;
       $cmp138$i = ($41|0)==(0|0);
       do {
        if (!($cmp138$i)) {
         $42 = HEAP32[((1344 + 16|0))>>2]|0;
         $cmp142$i = ($41>>>0)<($42>>>0);
         if ($cmp142$i) {
          _abort();
          // unreachable;
         } else {
          $arrayidx148$i = (($R$1$i) + 16|0);
          HEAP32[$arrayidx148$i>>2] = $41;
          $parent149$i = (($41) + 24|0);
          HEAP32[$parent149$i>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $arrayidx154$i = (($v$0$i) + 20|0);
       $43 = HEAP32[$arrayidx154$i>>2]|0;
       $cmp155$i = ($43|0)==(0|0);
       if (!($cmp155$i)) {
        $44 = HEAP32[((1344 + 16|0))>>2]|0;
        $cmp159$i = ($43>>>0)<($44>>>0);
        if ($cmp159$i) {
         _abort();
         // unreachable;
        } else {
         $arrayidx165$i = (($R$1$i) + 20|0);
         HEAP32[$arrayidx165$i>>2] = $43;
         $parent166$i = (($43) + 24|0);
         HEAP32[$parent166$i>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $cmp174$i = ($rsize$0$i>>>0)<(16);
     if ($cmp174$i) {
      $add177$i = (($rsize$0$i) + ($cond))|0;
      $or178$i = $add177$i | 3;
      $head179$i = (($v$0$i) + 4|0);
      HEAP32[$head179$i>>2] = $or178$i;
      $add$ptr181$sum$i = (($add177$i) + 4)|0;
      $head182$i = (($v$0$i) + ($add$ptr181$sum$i)|0);
      $45 = HEAP32[$head182$i>>2]|0;
      $or183$i = $45 | 1;
      HEAP32[$head182$i>>2] = $or183$i;
     } else {
      $or186$i = $cond | 3;
      $head187$i = (($v$0$i) + 4|0);
      HEAP32[$head187$i>>2] = $or186$i;
      $or188$i = $rsize$0$i | 1;
      $add$ptr$sum$i173 = $cond | 4;
      $head189$i = (($v$0$i) + ($add$ptr$sum$i173)|0);
      HEAP32[$head189$i>>2] = $or188$i;
      $add$ptr$sum1$i = (($rsize$0$i) + ($cond))|0;
      $add$ptr190$i = (($v$0$i) + ($add$ptr$sum1$i)|0);
      HEAP32[$add$ptr190$i>>2] = $rsize$0$i;
      $46 = HEAP32[((1344 + 8|0))>>2]|0;
      $cmp191$i = ($46|0)==(0);
      if (!($cmp191$i)) {
       $47 = HEAP32[((1344 + 20|0))>>2]|0;
       $shr194$i = $46 >>> 3;
       $shl195$i = $shr194$i << 1;
       $arrayidx196$i = ((1344 + ($shl195$i<<2)|0) + 40|0);
       $48 = HEAP32[1344>>2]|0;
       $shl198$i = 1 << $shr194$i;
       $and199$i = $48 & $shl198$i;
       $tobool200$i = ($and199$i|0)==(0);
       if ($tobool200$i) {
        $or204$i = $48 | $shl198$i;
        HEAP32[1344>>2] = $or204$i;
        $arrayidx196$sum$pre$i = (($shl195$i) + 2)|0;
        $$pre$i = ((1344 + ($arrayidx196$sum$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F197$0$i = $arrayidx196$i;
       } else {
        $arrayidx196$sum2$i = (($shl195$i) + 2)|0;
        $49 = ((1344 + ($arrayidx196$sum2$i<<2)|0) + 40|0);
        $50 = HEAP32[$49>>2]|0;
        $51 = HEAP32[((1344 + 16|0))>>2]|0;
        $cmp208$i = ($50>>>0)<($51>>>0);
        if ($cmp208$i) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $49;$F197$0$i = $50;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $47;
       $bk218$i = (($F197$0$i) + 12|0);
       HEAP32[$bk218$i>>2] = $47;
       $fd219$i = (($47) + 8|0);
       HEAP32[$fd219$i>>2] = $F197$0$i;
       $bk220$i = (($47) + 12|0);
       HEAP32[$bk220$i>>2] = $arrayidx196$i;
      }
      HEAP32[((1344 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((1344 + 20|0))>>2] = $add$ptr$i;
     }
     $add$ptr225$i = (($v$0$i) + 8|0);
     $mem$0 = $add$ptr225$i;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $cond;
   }
  } else {
   $cmp138 = ($bytes>>>0)>(4294967231);
   if ($cmp138) {
    $nb$0 = -1;
   } else {
    $add143 = (($bytes) + 11)|0;
    $and144 = $add143 & -8;
    $52 = HEAP32[((1344 + 4|0))>>2]|0;
    $cmp145 = ($52|0)==(0);
    if ($cmp145) {
     $nb$0 = $and144;
    } else {
     $sub$i105 = (0 - ($and144))|0;
     $shr$i106 = $add143 >>> 8;
     $cmp$i107 = ($shr$i106|0)==(0);
     if ($cmp$i107) {
      $idx$0$i = 0;
     } else {
      $cmp1$i = ($and144>>>0)>(16777215);
      if ($cmp1$i) {
       $idx$0$i = 31;
      } else {
       $sub4$i = (($shr$i106) + 1048320)|0;
       $shr5$i109 = $sub4$i >>> 16;
       $and$i110 = $shr5$i109 & 8;
       $shl$i111 = $shr$i106 << $and$i110;
       $sub6$i = (($shl$i111) + 520192)|0;
       $shr7$i112 = $sub6$i >>> 16;
       $and8$i = $shr7$i112 & 4;
       $add$i113 = $and8$i | $and$i110;
       $shl9$i = $shl$i111 << $and8$i;
       $sub10$i = (($shl9$i) + 245760)|0;
       $shr11$i114 = $sub10$i >>> 16;
       $and12$i = $shr11$i114 & 2;
       $add13$i = $add$i113 | $and12$i;
       $sub14$i = (14 - ($add13$i))|0;
       $shl15$i = $shl9$i << $and12$i;
       $shr16$i115 = $shl15$i >>> 15;
       $add17$i = (($sub14$i) + ($shr16$i115))|0;
       $shl18$i = $add17$i << 1;
       $add19$i = (($add17$i) + 7)|0;
       $shr20$i = $and144 >>> $add19$i;
       $and21$i116 = $shr20$i & 1;
       $add22$i = $and21$i116 | $shl18$i;
       $idx$0$i = $add22$i;
      }
     }
     $arrayidx$i117 = ((1344 + ($idx$0$i<<2)|0) + 304|0);
     $53 = HEAP32[$arrayidx$i117>>2]|0;
     $cmp24$i = ($53|0)==(0|0);
     L126: do {
      if ($cmp24$i) {
       $rsize$2$i = $sub$i105;$t$1$i = 0;$v$2$i = 0;
      } else {
       $cmp26$i = ($idx$0$i|0)==(31);
       if ($cmp26$i) {
        $cond$i = 0;
       } else {
        $shr27$i = $idx$0$i >>> 1;
        $sub30$i = (25 - ($shr27$i))|0;
        $cond$i = $sub30$i;
       }
       $shl31$i = $and144 << $cond$i;
       $rsize$0$i120 = $sub$i105;$rst$0$i = 0;$sizebits$0$i = $shl31$i;$t$0$i119 = $53;$v$0$i121 = 0;
       while(1) {
        $head$i122 = (($t$0$i119) + 4|0);
        $54 = HEAP32[$head$i122>>2]|0;
        $and32$i = $54 & -8;
        $sub33$i = (($and32$i) - ($and144))|0;
        $cmp34$i = ($sub33$i>>>0)<($rsize$0$i120>>>0);
        if ($cmp34$i) {
         $cmp36$i = ($and32$i|0)==($and144|0);
         if ($cmp36$i) {
          $rsize$2$i = $sub33$i;$t$1$i = $t$0$i119;$v$2$i = $t$0$i119;
          break L126;
         } else {
          $rsize$1$i = $sub33$i;$v$1$i = $t$0$i119;
         }
        } else {
         $rsize$1$i = $rsize$0$i120;$v$1$i = $v$0$i121;
        }
        $arrayidx40$i = (($t$0$i119) + 20|0);
        $55 = HEAP32[$arrayidx40$i>>2]|0;
        $shr41$i = $sizebits$0$i >>> 31;
        $arrayidx44$i = ((($t$0$i119) + ($shr41$i<<2)|0) + 16|0);
        $56 = HEAP32[$arrayidx44$i>>2]|0;
        $cmp45$i123 = ($55|0)==(0|0);
        $cmp46$i = ($55|0)==($56|0);
        $or$cond$i = $cmp45$i123 | $cmp46$i;
        $rst$1$i = $or$cond$i ? $rst$0$i : $55;
        $cmp49$i = ($56|0)==(0|0);
        $shl52$i = $sizebits$0$i << 1;
        if ($cmp49$i) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i120 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $shl52$i;$t$0$i119 = $56;$v$0$i121 = $v$1$i;
        }
       }
      }
     } while(0);
     $cmp54$i = ($t$1$i|0)==(0|0);
     $cmp56$i = ($v$2$i|0)==(0|0);
     $or$cond16$i = $cmp54$i & $cmp56$i;
     if ($or$cond16$i) {
      $shl59$i = 2 << $idx$0$i;
      $sub62$i = (0 - ($shl59$i))|0;
      $or$i = $shl59$i | $sub62$i;
      $and63$i = $52 & $or$i;
      $cmp64$i = ($and63$i|0)==(0);
      if ($cmp64$i) {
       $nb$0 = $and144;
       break;
      }
      $sub66$i = (0 - ($and63$i))|0;
      $and67$i = $and63$i & $sub66$i;
      $sub69$i = (($and67$i) + -1)|0;
      $shr71$i = $sub69$i >>> 12;
      $and72$i = $shr71$i & 16;
      $shr74$i = $sub69$i >>> $and72$i;
      $shr75$i = $shr74$i >>> 5;
      $and76$i = $shr75$i & 8;
      $add77$i = $and76$i | $and72$i;
      $shr78$i = $shr74$i >>> $and76$i;
      $shr79$i = $shr78$i >>> 2;
      $and80$i = $shr79$i & 4;
      $add81$i = $add77$i | $and80$i;
      $shr82$i = $shr78$i >>> $and80$i;
      $shr83$i = $shr82$i >>> 1;
      $and84$i = $shr83$i & 2;
      $add85$i = $add81$i | $and84$i;
      $shr86$i = $shr82$i >>> $and84$i;
      $shr87$i = $shr86$i >>> 1;
      $and88$i = $shr87$i & 1;
      $add89$i = $add85$i | $and88$i;
      $shr90$i = $shr86$i >>> $and88$i;
      $add91$i = (($add89$i) + ($shr90$i))|0;
      $arrayidx93$i = ((1344 + ($add91$i<<2)|0) + 304|0);
      $57 = HEAP32[$arrayidx93$i>>2]|0;
      $t$2$ph$i = $57;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $cmp9626$i = ($t$2$ph$i|0)==(0|0);
     if ($cmp9626$i) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$328$i = $rsize$2$i;$t$227$i = $t$2$ph$i;$v$329$i = $v$2$i;
      while(1) {
       $head98$i = (($t$227$i) + 4|0);
       $58 = HEAP32[$head98$i>>2]|0;
       $and99$i = $58 & -8;
       $sub100$i = (($and99$i) - ($and144))|0;
       $cmp101$i = ($sub100$i>>>0)<($rsize$328$i>>>0);
       $sub100$rsize$3$i = $cmp101$i ? $sub100$i : $rsize$328$i;
       $t$2$v$3$i = $cmp101$i ? $t$227$i : $v$329$i;
       $arrayidx105$i = (($t$227$i) + 16|0);
       $59 = HEAP32[$arrayidx105$i>>2]|0;
       $cmp106$i = ($59|0)==(0|0);
       if (!($cmp106$i)) {
        $rsize$328$i = $sub100$rsize$3$i;$t$227$i = $59;$v$329$i = $t$2$v$3$i;
        continue;
       }
       $arrayidx112$i = (($t$227$i) + 20|0);
       $60 = HEAP32[$arrayidx112$i>>2]|0;
       $cmp96$i = ($60|0)==(0|0);
       if ($cmp96$i) {
        $rsize$3$lcssa$i = $sub100$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$328$i = $sub100$rsize$3$i;$t$227$i = $60;$v$329$i = $t$2$v$3$i;
       }
      }
     }
     $cmp115$i = ($v$3$lcssa$i|0)==(0|0);
     if ($cmp115$i) {
      $nb$0 = $and144;
     } else {
      $61 = HEAP32[((1344 + 8|0))>>2]|0;
      $sub117$i = (($61) - ($and144))|0;
      $cmp118$i = ($rsize$3$lcssa$i>>>0)<($sub117$i>>>0);
      if ($cmp118$i) {
       $62 = HEAP32[((1344 + 16|0))>>2]|0;
       $cmp120$i = ($v$3$lcssa$i>>>0)<($62>>>0);
       if ($cmp120$i) {
        _abort();
        // unreachable;
       }
       $add$ptr$i126 = (($v$3$lcssa$i) + ($and144)|0);
       $cmp122$i = ($v$3$lcssa$i>>>0)<($add$ptr$i126>>>0);
       if (!($cmp122$i)) {
        _abort();
        // unreachable;
       }
       $parent$i127 = (($v$3$lcssa$i) + 24|0);
       $63 = HEAP32[$parent$i127>>2]|0;
       $bk$i128 = (($v$3$lcssa$i) + 12|0);
       $64 = HEAP32[$bk$i128>>2]|0;
       $cmp127$i = ($64|0)==($v$3$lcssa$i|0);
       do {
        if ($cmp127$i) {
         $arrayidx150$i = (($v$3$lcssa$i) + 20|0);
         $68 = HEAP32[$arrayidx150$i>>2]|0;
         $cmp151$i = ($68|0)==(0|0);
         if ($cmp151$i) {
          $arrayidx154$i131 = (($v$3$lcssa$i) + 16|0);
          $69 = HEAP32[$arrayidx154$i131>>2]|0;
          $cmp155$i132 = ($69|0)==(0|0);
          if ($cmp155$i132) {
           $R$1$i137 = 0;
           break;
          } else {
           $R$0$i135 = $69;$RP$0$i134 = $arrayidx154$i131;
          }
         } else {
          $R$0$i135 = $68;$RP$0$i134 = $arrayidx150$i;
         }
         while(1) {
          $arrayidx160$i = (($R$0$i135) + 20|0);
          $70 = HEAP32[$arrayidx160$i>>2]|0;
          $cmp161$i = ($70|0)==(0|0);
          if (!($cmp161$i)) {
           $R$0$i135 = $70;$RP$0$i134 = $arrayidx160$i;
           continue;
          }
          $arrayidx164$i = (($R$0$i135) + 16|0);
          $71 = HEAP32[$arrayidx164$i>>2]|0;
          $cmp165$i = ($71|0)==(0|0);
          if ($cmp165$i) {
           break;
          } else {
           $R$0$i135 = $71;$RP$0$i134 = $arrayidx164$i;
          }
         }
         $cmp170$i = ($RP$0$i134>>>0)<($62>>>0);
         if ($cmp170$i) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i134>>2] = 0;
          $R$1$i137 = $R$0$i135;
          break;
         }
        } else {
         $fd$i129 = (($v$3$lcssa$i) + 8|0);
         $65 = HEAP32[$fd$i129>>2]|0;
         $cmp132$i = ($65>>>0)<($62>>>0);
         if ($cmp132$i) {
          _abort();
          // unreachable;
         }
         $bk135$i = (($65) + 12|0);
         $66 = HEAP32[$bk135$i>>2]|0;
         $cmp136$i = ($66|0)==($v$3$lcssa$i|0);
         if (!($cmp136$i)) {
          _abort();
          // unreachable;
         }
         $fd138$i = (($64) + 8|0);
         $67 = HEAP32[$fd138$i>>2]|0;
         $cmp139$i = ($67|0)==($v$3$lcssa$i|0);
         if ($cmp139$i) {
          HEAP32[$bk135$i>>2] = $64;
          HEAP32[$fd138$i>>2] = $65;
          $R$1$i137 = $64;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $cmp179$i = ($63|0)==(0|0);
       do {
        if (!($cmp179$i)) {
         $index$i138 = (($v$3$lcssa$i) + 28|0);
         $72 = HEAP32[$index$i138>>2]|0;
         $arrayidx183$i = ((1344 + ($72<<2)|0) + 304|0);
         $73 = HEAP32[$arrayidx183$i>>2]|0;
         $cmp184$i = ($v$3$lcssa$i|0)==($73|0);
         if ($cmp184$i) {
          HEAP32[$arrayidx183$i>>2] = $R$1$i137;
          $cond18$i = ($R$1$i137|0)==(0|0);
          if ($cond18$i) {
           $shl191$i = 1 << $72;
           $neg$i139 = $shl191$i ^ -1;
           $74 = HEAP32[((1344 + 4|0))>>2]|0;
           $and193$i = $74 & $neg$i139;
           HEAP32[((1344 + 4|0))>>2] = $and193$i;
           break;
          }
         } else {
          $75 = HEAP32[((1344 + 16|0))>>2]|0;
          $cmp197$i = ($63>>>0)<($75>>>0);
          if ($cmp197$i) {
           _abort();
           // unreachable;
          }
          $arrayidx203$i = (($63) + 16|0);
          $76 = HEAP32[$arrayidx203$i>>2]|0;
          $cmp204$i = ($76|0)==($v$3$lcssa$i|0);
          if ($cmp204$i) {
           HEAP32[$arrayidx203$i>>2] = $R$1$i137;
          } else {
           $arrayidx211$i = (($63) + 20|0);
           HEAP32[$arrayidx211$i>>2] = $R$1$i137;
          }
          $cmp216$i = ($R$1$i137|0)==(0|0);
          if ($cmp216$i) {
           break;
          }
         }
         $77 = HEAP32[((1344 + 16|0))>>2]|0;
         $cmp220$i = ($R$1$i137>>>0)<($77>>>0);
         if ($cmp220$i) {
          _abort();
          // unreachable;
         }
         $parent225$i = (($R$1$i137) + 24|0);
         HEAP32[$parent225$i>>2] = $63;
         $arrayidx227$i = (($v$3$lcssa$i) + 16|0);
         $78 = HEAP32[$arrayidx227$i>>2]|0;
         $cmp228$i = ($78|0)==(0|0);
         do {
          if (!($cmp228$i)) {
           $79 = HEAP32[((1344 + 16|0))>>2]|0;
           $cmp232$i = ($78>>>0)<($79>>>0);
           if ($cmp232$i) {
            _abort();
            // unreachable;
           } else {
            $arrayidx238$i = (($R$1$i137) + 16|0);
            HEAP32[$arrayidx238$i>>2] = $78;
            $parent239$i = (($78) + 24|0);
            HEAP32[$parent239$i>>2] = $R$1$i137;
            break;
           }
          }
         } while(0);
         $arrayidx244$i = (($v$3$lcssa$i) + 20|0);
         $80 = HEAP32[$arrayidx244$i>>2]|0;
         $cmp245$i = ($80|0)==(0|0);
         if (!($cmp245$i)) {
          $81 = HEAP32[((1344 + 16|0))>>2]|0;
          $cmp249$i = ($80>>>0)<($81>>>0);
          if ($cmp249$i) {
           _abort();
           // unreachable;
          } else {
           $arrayidx255$i = (($R$1$i137) + 20|0);
           HEAP32[$arrayidx255$i>>2] = $80;
           $parent256$i = (($80) + 24|0);
           HEAP32[$parent256$i>>2] = $R$1$i137;
           break;
          }
         }
        }
       } while(0);
       $cmp264$i = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($cmp264$i) {
         $add267$i = (($rsize$3$lcssa$i) + ($and144))|0;
         $or269$i = $add267$i | 3;
         $head270$i = (($v$3$lcssa$i) + 4|0);
         HEAP32[$head270$i>>2] = $or269$i;
         $add$ptr272$sum$i = (($add267$i) + 4)|0;
         $head273$i = (($v$3$lcssa$i) + ($add$ptr272$sum$i)|0);
         $82 = HEAP32[$head273$i>>2]|0;
         $or274$i = $82 | 1;
         HEAP32[$head273$i>>2] = $or274$i;
        } else {
         $or277$i = $and144 | 3;
         $head278$i = (($v$3$lcssa$i) + 4|0);
         HEAP32[$head278$i>>2] = $or277$i;
         $or279$i = $rsize$3$lcssa$i | 1;
         $add$ptr$sum$i141172 = $and144 | 4;
         $head280$i = (($v$3$lcssa$i) + ($add$ptr$sum$i141172)|0);
         HEAP32[$head280$i>>2] = $or279$i;
         $add$ptr$sum1$i142 = (($rsize$3$lcssa$i) + ($and144))|0;
         $add$ptr281$i = (($v$3$lcssa$i) + ($add$ptr$sum1$i142)|0);
         HEAP32[$add$ptr281$i>>2] = $rsize$3$lcssa$i;
         $shr282$i = $rsize$3$lcssa$i >>> 3;
         $cmp283$i = ($rsize$3$lcssa$i>>>0)<(256);
         if ($cmp283$i) {
          $shl287$i = $shr282$i << 1;
          $arrayidx288$i = ((1344 + ($shl287$i<<2)|0) + 40|0);
          $83 = HEAP32[1344>>2]|0;
          $shl290$i = 1 << $shr282$i;
          $and291$i = $83 & $shl290$i;
          $tobool292$i = ($and291$i|0)==(0);
          do {
           if ($tobool292$i) {
            $or296$i = $83 | $shl290$i;
            HEAP32[1344>>2] = $or296$i;
            $arrayidx288$sum$pre$i = (($shl287$i) + 2)|0;
            $$pre$i144 = ((1344 + ($arrayidx288$sum$pre$i<<2)|0) + 40|0);
            $$pre$phi$i145Z2D = $$pre$i144;$F289$0$i = $arrayidx288$i;
           } else {
            $arrayidx288$sum15$i = (($shl287$i) + 2)|0;
            $84 = ((1344 + ($arrayidx288$sum15$i<<2)|0) + 40|0);
            $85 = HEAP32[$84>>2]|0;
            $86 = HEAP32[((1344 + 16|0))>>2]|0;
            $cmp300$i = ($85>>>0)<($86>>>0);
            if (!($cmp300$i)) {
             $$pre$phi$i145Z2D = $84;$F289$0$i = $85;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i145Z2D>>2] = $add$ptr$i126;
          $bk310$i = (($F289$0$i) + 12|0);
          HEAP32[$bk310$i>>2] = $add$ptr$i126;
          $add$ptr$sum13$i = (($and144) + 8)|0;
          $fd311$i = (($v$3$lcssa$i) + ($add$ptr$sum13$i)|0);
          HEAP32[$fd311$i>>2] = $F289$0$i;
          $add$ptr$sum14$i = (($and144) + 12)|0;
          $bk312$i = (($v$3$lcssa$i) + ($add$ptr$sum14$i)|0);
          HEAP32[$bk312$i>>2] = $arrayidx288$i;
          break;
         }
         $shr317$i = $rsize$3$lcssa$i >>> 8;
         $cmp318$i = ($shr317$i|0)==(0);
         if ($cmp318$i) {
          $I315$0$i = 0;
         } else {
          $cmp322$i = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($cmp322$i) {
           $I315$0$i = 31;
          } else {
           $sub328$i = (($shr317$i) + 1048320)|0;
           $shr329$i = $sub328$i >>> 16;
           $and330$i = $shr329$i & 8;
           $shl332$i = $shr317$i << $and330$i;
           $sub333$i = (($shl332$i) + 520192)|0;
           $shr334$i = $sub333$i >>> 16;
           $and335$i = $shr334$i & 4;
           $add336$i = $and335$i | $and330$i;
           $shl337$i = $shl332$i << $and335$i;
           $sub338$i = (($shl337$i) + 245760)|0;
           $shr339$i = $sub338$i >>> 16;
           $and340$i = $shr339$i & 2;
           $add341$i = $add336$i | $and340$i;
           $sub342$i = (14 - ($add341$i))|0;
           $shl343$i = $shl337$i << $and340$i;
           $shr344$i = $shl343$i >>> 15;
           $add345$i = (($sub342$i) + ($shr344$i))|0;
           $shl346$i = $add345$i << 1;
           $add347$i = (($add345$i) + 7)|0;
           $shr348$i = $rsize$3$lcssa$i >>> $add347$i;
           $and349$i = $shr348$i & 1;
           $add350$i = $and349$i | $shl346$i;
           $I315$0$i = $add350$i;
          }
         }
         $arrayidx354$i = ((1344 + ($I315$0$i<<2)|0) + 304|0);
         $add$ptr$sum2$i = (($and144) + 28)|0;
         $index355$i = (($v$3$lcssa$i) + ($add$ptr$sum2$i)|0);
         HEAP32[$index355$i>>2] = $I315$0$i;
         $add$ptr$sum3$i = (($and144) + 16)|0;
         $child356$i = (($v$3$lcssa$i) + ($add$ptr$sum3$i)|0);
         $child356$sum$i = (($and144) + 20)|0;
         $arrayidx357$i = (($v$3$lcssa$i) + ($child356$sum$i)|0);
         HEAP32[$arrayidx357$i>>2] = 0;
         HEAP32[$child356$i>>2] = 0;
         $87 = HEAP32[((1344 + 4|0))>>2]|0;
         $shl361$i = 1 << $I315$0$i;
         $and362$i = $87 & $shl361$i;
         $tobool363$i = ($and362$i|0)==(0);
         if ($tobool363$i) {
          $or367$i = $87 | $shl361$i;
          HEAP32[((1344 + 4|0))>>2] = $or367$i;
          HEAP32[$arrayidx354$i>>2] = $add$ptr$i126;
          $add$ptr$sum4$i = (($and144) + 24)|0;
          $parent368$i = (($v$3$lcssa$i) + ($add$ptr$sum4$i)|0);
          HEAP32[$parent368$i>>2] = $arrayidx354$i;
          $add$ptr$sum5$i = (($and144) + 12)|0;
          $bk369$i = (($v$3$lcssa$i) + ($add$ptr$sum5$i)|0);
          HEAP32[$bk369$i>>2] = $add$ptr$i126;
          $add$ptr$sum6$i = (($and144) + 8)|0;
          $fd370$i = (($v$3$lcssa$i) + ($add$ptr$sum6$i)|0);
          HEAP32[$fd370$i>>2] = $add$ptr$i126;
          break;
         }
         $88 = HEAP32[$arrayidx354$i>>2]|0;
         $cmp373$i = ($I315$0$i|0)==(31);
         if ($cmp373$i) {
          $cond382$i = 0;
         } else {
          $shr377$i = $I315$0$i >>> 1;
          $sub380$i = (25 - ($shr377$i))|0;
          $cond382$i = $sub380$i;
         }
         $head38520$i = (($88) + 4|0);
         $89 = HEAP32[$head38520$i>>2]|0;
         $and38621$i = $89 & -8;
         $cmp38722$i = ($and38621$i|0)==($rsize$3$lcssa$i|0);
         L224: do {
          if ($cmp38722$i) {
           $T$0$lcssa$i = $88;
          } else {
           $shl383$i = $rsize$3$lcssa$i << $cond382$i;
           $K372$024$i = $shl383$i;$T$023$i = $88;
           while(1) {
            $shr390$i = $K372$024$i >>> 31;
            $arrayidx393$i = ((($T$023$i) + ($shr390$i<<2)|0) + 16|0);
            $90 = HEAP32[$arrayidx393$i>>2]|0;
            $cmp395$i = ($90|0)==(0|0);
            if ($cmp395$i) {
             break;
            }
            $shl394$i = $K372$024$i << 1;
            $head385$i = (($90) + 4|0);
            $91 = HEAP32[$head385$i>>2]|0;
            $and386$i = $91 & -8;
            $cmp387$i = ($and386$i|0)==($rsize$3$lcssa$i|0);
            if ($cmp387$i) {
             $T$0$lcssa$i = $90;
             break L224;
            } else {
             $K372$024$i = $shl394$i;$T$023$i = $90;
            }
           }
           $92 = HEAP32[((1344 + 16|0))>>2]|0;
           $cmp400$i = ($arrayidx393$i>>>0)<($92>>>0);
           if ($cmp400$i) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$arrayidx393$i>>2] = $add$ptr$i126;
            $add$ptr$sum10$i = (($and144) + 24)|0;
            $parent405$i = (($v$3$lcssa$i) + ($add$ptr$sum10$i)|0);
            HEAP32[$parent405$i>>2] = $T$023$i;
            $add$ptr$sum11$i = (($and144) + 12)|0;
            $bk406$i = (($v$3$lcssa$i) + ($add$ptr$sum11$i)|0);
            HEAP32[$bk406$i>>2] = $add$ptr$i126;
            $add$ptr$sum12$i = (($and144) + 8)|0;
            $fd407$i = (($v$3$lcssa$i) + ($add$ptr$sum12$i)|0);
            HEAP32[$fd407$i>>2] = $add$ptr$i126;
            break L204;
           }
          }
         } while(0);
         $fd412$i = (($T$0$lcssa$i) + 8|0);
         $93 = HEAP32[$fd412$i>>2]|0;
         $94 = HEAP32[((1344 + 16|0))>>2]|0;
         $cmp414$i = ($T$0$lcssa$i>>>0)<($94>>>0);
         if ($cmp414$i) {
          _abort();
          // unreachable;
         }
         $cmp418$i = ($93>>>0)<($94>>>0);
         if ($cmp418$i) {
          _abort();
          // unreachable;
         } else {
          $bk425$i = (($93) + 12|0);
          HEAP32[$bk425$i>>2] = $add$ptr$i126;
          HEAP32[$fd412$i>>2] = $add$ptr$i126;
          $add$ptr$sum7$i = (($and144) + 8)|0;
          $fd427$i = (($v$3$lcssa$i) + ($add$ptr$sum7$i)|0);
          HEAP32[$fd427$i>>2] = $93;
          $add$ptr$sum8$i = (($and144) + 12)|0;
          $bk428$i = (($v$3$lcssa$i) + ($add$ptr$sum8$i)|0);
          HEAP32[$bk428$i>>2] = $T$0$lcssa$i;
          $add$ptr$sum9$i = (($and144) + 24)|0;
          $parent429$i = (($v$3$lcssa$i) + ($add$ptr$sum9$i)|0);
          HEAP32[$parent429$i>>2] = 0;
          break;
         }
        }
       } while(0);
       $add$ptr436$i = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $add$ptr436$i;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $and144;
      }
     }
    }
   }
  }
 } while(0);
 $95 = HEAP32[((1344 + 8|0))>>2]|0;
 $cmp155 = ($nb$0>>>0)>($95>>>0);
 if (!($cmp155)) {
  $sub159 = (($95) - ($nb$0))|0;
  $96 = HEAP32[((1344 + 20|0))>>2]|0;
  $cmp161 = ($sub159>>>0)>(15);
  if ($cmp161) {
   $add$ptr165 = (($96) + ($nb$0)|0);
   HEAP32[((1344 + 20|0))>>2] = $add$ptr165;
   HEAP32[((1344 + 8|0))>>2] = $sub159;
   $or166 = $sub159 | 1;
   $add$ptr165$sum = (($nb$0) + 4)|0;
   $head167 = (($96) + ($add$ptr165$sum)|0);
   HEAP32[$head167>>2] = $or166;
   $add$ptr168 = (($96) + ($95)|0);
   HEAP32[$add$ptr168>>2] = $sub159;
   $or171 = $nb$0 | 3;
   $head172 = (($96) + 4|0);
   HEAP32[$head172>>2] = $or171;
  } else {
   HEAP32[((1344 + 8|0))>>2] = 0;
   HEAP32[((1344 + 20|0))>>2] = 0;
   $or175 = $95 | 3;
   $head176 = (($96) + 4|0);
   HEAP32[$head176>>2] = $or175;
   $add$ptr177$sum = (($95) + 4)|0;
   $head178 = (($96) + ($add$ptr177$sum)|0);
   $97 = HEAP32[$head178>>2]|0;
   $or179 = $97 | 1;
   HEAP32[$head178>>2] = $or179;
  }
  $add$ptr181 = (($96) + 8|0);
  $mem$0 = $add$ptr181;
  STACKTOP = sp;return ($mem$0|0);
 }
 $98 = HEAP32[((1344 + 12|0))>>2]|0;
 $cmp183 = ($nb$0>>>0)<($98>>>0);
 if ($cmp183) {
  $sub187 = (($98) - ($nb$0))|0;
  HEAP32[((1344 + 12|0))>>2] = $sub187;
  $99 = HEAP32[((1344 + 24|0))>>2]|0;
  $add$ptr190 = (($99) + ($nb$0)|0);
  HEAP32[((1344 + 24|0))>>2] = $add$ptr190;
  $or191 = $sub187 | 1;
  $add$ptr190$sum = (($nb$0) + 4)|0;
  $head192 = (($99) + ($add$ptr190$sum)|0);
  HEAP32[$head192>>2] = $or191;
  $or194 = $nb$0 | 3;
  $head195 = (($99) + 4|0);
  HEAP32[$head195>>2] = $or194;
  $add$ptr196 = (($99) + 8|0);
  $mem$0 = $add$ptr196;
  STACKTOP = sp;return ($mem$0|0);
 }
 $100 = HEAP32[1816>>2]|0;
 $cmp$i146 = ($100|0)==(0);
 do {
  if ($cmp$i146) {
   $call$i$i = (_sysconf(30)|0);
   $sub$i$i = (($call$i$i) + -1)|0;
   $and$i$i = $sub$i$i & $call$i$i;
   $cmp1$i$i = ($and$i$i|0)==(0);
   if ($cmp1$i$i) {
    HEAP32[((1816 + 8|0))>>2] = $call$i$i;
    HEAP32[((1816 + 4|0))>>2] = $call$i$i;
    HEAP32[((1816 + 12|0))>>2] = -1;
    HEAP32[((1816 + 16|0))>>2] = -1;
    HEAP32[((1816 + 20|0))>>2] = 0;
    HEAP32[((1344 + 444|0))>>2] = 0;
    $call6$i$i = (_time((0|0))|0);
    $xor$i$i = $call6$i$i & -16;
    $and7$i$i = $xor$i$i ^ 1431655768;
    HEAP32[1816>>2] = $and7$i$i;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $add$i147 = (($nb$0) + 48)|0;
 $101 = HEAP32[((1816 + 8|0))>>2]|0;
 $sub$i148 = (($nb$0) + 47)|0;
 $add9$i = (($101) + ($sub$i148))|0;
 $neg$i149 = (0 - ($101))|0;
 $and11$i = $add9$i & $neg$i149;
 $cmp12$i = ($and11$i>>>0)>($nb$0>>>0);
 if (!($cmp12$i)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $102 = HEAP32[((1344 + 440|0))>>2]|0;
 $cmp15$i = ($102|0)==(0);
 if (!($cmp15$i)) {
  $103 = HEAP32[((1344 + 432|0))>>2]|0;
  $add17$i150 = (($103) + ($and11$i))|0;
  $cmp19$i = ($add17$i150>>>0)<=($103>>>0);
  $cmp21$i = ($add17$i150>>>0)>($102>>>0);
  $or$cond1$i = $cmp19$i | $cmp21$i;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $104 = HEAP32[((1344 + 444|0))>>2]|0;
 $and26$i = $104 & 4;
 $tobool27$i = ($and26$i|0)==(0);
 L269: do {
  if ($tobool27$i) {
   $105 = HEAP32[((1344 + 24|0))>>2]|0;
   $cmp29$i = ($105|0)==(0|0);
   L271: do {
    if ($cmp29$i) {
     label = 182;
    } else {
     $sp$0$i$i = ((1344 + 448|0));
     while(1) {
      $106 = HEAP32[$sp$0$i$i>>2]|0;
      $cmp$i9$i = ($106>>>0)>($105>>>0);
      if (!($cmp$i9$i)) {
       $size$i$i = (($sp$0$i$i) + 4|0);
       $107 = HEAP32[$size$i$i>>2]|0;
       $add$ptr$i$i = (($106) + ($107)|0);
       $cmp2$i$i = ($add$ptr$i$i>>>0)>($105>>>0);
       if ($cmp2$i$i) {
        break;
       }
      }
      $next$i$i = (($sp$0$i$i) + 8|0);
      $108 = HEAP32[$next$i$i>>2]|0;
      $cmp3$i$i = ($108|0)==(0|0);
      if ($cmp3$i$i) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $108;
      }
     }
     $cmp32$i152 = ($sp$0$i$i|0)==(0|0);
     if ($cmp32$i152) {
      label = 182;
     } else {
      $113 = HEAP32[((1344 + 12|0))>>2]|0;
      $add74$i = (($add9$i) - ($113))|0;
      $and77$i = $add74$i & $neg$i149;
      $cmp78$i = ($and77$i>>>0)<(2147483647);
      if ($cmp78$i) {
       $call80$i = (_sbrk(($and77$i|0))|0);
       $114 = HEAP32[$sp$0$i$i>>2]|0;
       $115 = HEAP32[$size$i$i>>2]|0;
       $add$ptr$i160 = (($114) + ($115)|0);
       $cmp82$i = ($call80$i|0)==($add$ptr$i160|0);
       $and77$$i = $cmp82$i ? $and77$i : 0;
       $call80$$i = $cmp82$i ? $call80$i : (-1);
       $br$0$i = $call80$i;$ssize$1$i = $and77$i;$tbase$0$i = $call80$$i;$tsize$0$i = $and77$$i;
       label = 191;
      } else {
       $tsize$0748284$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $call34$i = (_sbrk(0)|0);
     $cmp35$i154 = ($call34$i|0)==((-1)|0);
     if ($cmp35$i154) {
      $tsize$0748284$i = 0;
     } else {
      $109 = $call34$i;
      $110 = HEAP32[((1816 + 4|0))>>2]|0;
      $sub38$i = (($110) + -1)|0;
      $and39$i = $sub38$i & $109;
      $cmp40$i155 = ($and39$i|0)==(0);
      if ($cmp40$i155) {
       $ssize$0$i = $and11$i;
      } else {
       $add43$i = (($sub38$i) + ($109))|0;
       $neg45$i = (0 - ($110))|0;
       $and46$i = $add43$i & $neg45$i;
       $sub47$i = (($and11$i) - ($109))|0;
       $add48$i = (($sub47$i) + ($and46$i))|0;
       $ssize$0$i = $add48$i;
      }
      $111 = HEAP32[((1344 + 432|0))>>2]|0;
      $add51$i = (($111) + ($ssize$0$i))|0;
      $cmp52$i = ($ssize$0$i>>>0)>($nb$0>>>0);
      $cmp54$i156 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i157 = $cmp52$i & $cmp54$i156;
      if ($or$cond$i157) {
       $112 = HEAP32[((1344 + 440|0))>>2]|0;
       $cmp57$i = ($112|0)==(0);
       if (!($cmp57$i)) {
        $cmp60$i = ($add51$i>>>0)<=($111>>>0);
        $cmp63$i = ($add51$i>>>0)>($112>>>0);
        $or$cond2$i = $cmp60$i | $cmp63$i;
        if ($or$cond2$i) {
         $tsize$0748284$i = 0;
         break;
        }
       }
       $call65$i = (_sbrk(($ssize$0$i|0))|0);
       $cmp66$i158 = ($call65$i|0)==($call34$i|0);
       $ssize$0$$i = $cmp66$i158 ? $ssize$0$i : 0;
       $call34$$i = $cmp66$i158 ? $call34$i : (-1);
       $br$0$i = $call65$i;$ssize$1$i = $ssize$0$i;$tbase$0$i = $call34$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0748284$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $sub109$i = (0 - ($ssize$1$i))|0;
     $cmp86$i = ($tbase$0$i|0)==((-1)|0);
     if (!($cmp86$i)) {
      $tbase$291$i = $tbase$0$i;$tsize$290$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $cmp88$i = ($br$0$i|0)!=((-1)|0);
     $cmp90$i161 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond3$i = $cmp88$i & $cmp90$i161;
     $cmp93$i = ($ssize$1$i>>>0)<($add$i147>>>0);
     $or$cond4$i = $or$cond3$i & $cmp93$i;
     do {
      if ($or$cond4$i) {
       $116 = HEAP32[((1816 + 8|0))>>2]|0;
       $sub96$i = (($sub$i148) - ($ssize$1$i))|0;
       $add98$i = (($sub96$i) + ($116))|0;
       $neg100$i = (0 - ($116))|0;
       $and101$i = $add98$i & $neg100$i;
       $cmp102$i = ($and101$i>>>0)<(2147483647);
       if ($cmp102$i) {
        $call104$i = (_sbrk(($and101$i|0))|0);
        $cmp105$i = ($call104$i|0)==((-1)|0);
        if ($cmp105$i) {
         (_sbrk(($sub109$i|0))|0);
         $tsize$0748284$i = $tsize$0$i;
         break L291;
        } else {
         $add107$i = (($and101$i) + ($ssize$1$i))|0;
         $ssize$2$i = $add107$i;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $cmp115$i162 = ($br$0$i|0)==((-1)|0);
     if ($cmp115$i162) {
      $tsize$0748284$i = $tsize$0$i;
     } else {
      $tbase$291$i = $br$0$i;$tsize$290$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $117 = HEAP32[((1344 + 444|0))>>2]|0;
   $or$i163 = $117 | 4;
   HEAP32[((1344 + 444|0))>>2] = $or$i163;
   $tsize$1$i = $tsize$0748284$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $cmp124$i = ($and11$i>>>0)<(2147483647);
  if ($cmp124$i) {
   $call128$i = (_sbrk(($and11$i|0))|0);
   $call129$i = (_sbrk(0)|0);
   $notlhs$i = ($call128$i|0)!=((-1)|0);
   $notrhs$i = ($call129$i|0)!=((-1)|0);
   $or$cond6$not$i = $notrhs$i & $notlhs$i;
   $cmp134$i = ($call128$i>>>0)<($call129$i>>>0);
   $or$cond7$i = $or$cond6$not$i & $cmp134$i;
   if ($or$cond7$i) {
    $sub$ptr$lhs$cast$i = $call129$i;
    $sub$ptr$rhs$cast$i = $call128$i;
    $sub$ptr$sub$i = (($sub$ptr$lhs$cast$i) - ($sub$ptr$rhs$cast$i))|0;
    $add137$i = (($nb$0) + 40)|0;
    $cmp138$i164 = ($sub$ptr$sub$i>>>0)>($add137$i>>>0);
    $sub$ptr$sub$tsize$1$i = $cmp138$i164 ? $sub$ptr$sub$i : $tsize$1$i;
    if ($cmp138$i164) {
     $tbase$291$i = $call128$i;$tsize$290$i = $sub$ptr$sub$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $118 = HEAP32[((1344 + 432|0))>>2]|0;
  $add147$i = (($118) + ($tsize$290$i))|0;
  HEAP32[((1344 + 432|0))>>2] = $add147$i;
  $119 = HEAP32[((1344 + 436|0))>>2]|0;
  $cmp148$i = ($add147$i>>>0)>($119>>>0);
  if ($cmp148$i) {
   HEAP32[((1344 + 436|0))>>2] = $add147$i;
  }
  $120 = HEAP32[((1344 + 24|0))>>2]|0;
  $cmp154$i = ($120|0)==(0|0);
  L311: do {
   if ($cmp154$i) {
    $121 = HEAP32[((1344 + 16|0))>>2]|0;
    $cmp156$i = ($121|0)==(0|0);
    $cmp159$i166 = ($tbase$291$i>>>0)<($121>>>0);
    $or$cond8$i = $cmp156$i | $cmp159$i166;
    if ($or$cond8$i) {
     HEAP32[((1344 + 16|0))>>2] = $tbase$291$i;
    }
    HEAP32[((1344 + 448|0))>>2] = $tbase$291$i;
    HEAP32[((1344 + 452|0))>>2] = $tsize$290$i;
    HEAP32[((1344 + 460|0))>>2] = 0;
    $122 = HEAP32[1816>>2]|0;
    HEAP32[((1344 + 36|0))>>2] = $122;
    HEAP32[((1344 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $shl$i$i = $i$02$i$i << 1;
     $arrayidx$i$i = ((1344 + ($shl$i$i<<2)|0) + 40|0);
     $arrayidx$sum$i$i = (($shl$i$i) + 3)|0;
     $123 = ((1344 + ($arrayidx$sum$i$i<<2)|0) + 40|0);
     HEAP32[$123>>2] = $arrayidx$i$i;
     $arrayidx$sum1$i$i = (($shl$i$i) + 2)|0;
     $124 = ((1344 + ($arrayidx$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$124>>2] = $arrayidx$i$i;
     $inc$i$i = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($inc$i$i|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $inc$i$i;
     }
    }
    $sub169$i = (($tsize$290$i) + -40)|0;
    $add$ptr$i11$i = (($tbase$291$i) + 8|0);
    $125 = $add$ptr$i11$i;
    $and$i12$i = $125 & 7;
    $cmp$i13$i = ($and$i12$i|0)==(0);
    if ($cmp$i13$i) {
     $cond$i$i = 0;
    } else {
     $126 = (0 - ($125))|0;
     $and3$i$i = $126 & 7;
     $cond$i$i = $and3$i$i;
    }
    $add$ptr4$i$i = (($tbase$291$i) + ($cond$i$i)|0);
    $sub5$i$i = (($sub169$i) - ($cond$i$i))|0;
    HEAP32[((1344 + 24|0))>>2] = $add$ptr4$i$i;
    HEAP32[((1344 + 12|0))>>2] = $sub5$i$i;
    $or$i$i = $sub5$i$i | 1;
    $add$ptr4$sum$i$i = (($cond$i$i) + 4)|0;
    $head$i$i = (($tbase$291$i) + ($add$ptr4$sum$i$i)|0);
    HEAP32[$head$i$i>>2] = $or$i$i;
    $add$ptr6$sum$i$i = (($tsize$290$i) + -36)|0;
    $head7$i$i = (($tbase$291$i) + ($add$ptr6$sum$i$i)|0);
    HEAP32[$head7$i$i>>2] = 40;
    $127 = HEAP32[((1816 + 16|0))>>2]|0;
    HEAP32[((1344 + 28|0))>>2] = $127;
   } else {
    $sp$0109$i = ((1344 + 448|0));
    while(1) {
     $128 = HEAP32[$sp$0109$i>>2]|0;
     $size185$i = (($sp$0109$i) + 4|0);
     $129 = HEAP32[$size185$i>>2]|0;
     $add$ptr186$i = (($128) + ($129)|0);
     $cmp187$i = ($tbase$291$i|0)==($add$ptr186$i|0);
     if ($cmp187$i) {
      label = 214;
      break;
     }
     $next$i = (($sp$0109$i) + 8|0);
     $130 = HEAP32[$next$i>>2]|0;
     $cmp183$i = ($130|0)==(0|0);
     if ($cmp183$i) {
      break;
     } else {
      $sp$0109$i = $130;
     }
    }
    if ((label|0) == 214) {
     $sflags190$i = (($sp$0109$i) + 12|0);
     $131 = HEAP32[$sflags190$i>>2]|0;
     $and191$i = $131 & 8;
     $tobool192$i = ($and191$i|0)==(0);
     if ($tobool192$i) {
      $cmp200$i = ($120>>>0)>=($128>>>0);
      $cmp206$i = ($120>>>0)<($tbase$291$i>>>0);
      $or$cond93$i = $cmp200$i & $cmp206$i;
      if ($or$cond93$i) {
       $add209$i = (($129) + ($tsize$290$i))|0;
       HEAP32[$size185$i>>2] = $add209$i;
       $132 = HEAP32[((1344 + 12|0))>>2]|0;
       $add212$i = (($132) + ($tsize$290$i))|0;
       $add$ptr$i22$i = (($120) + 8|0);
       $133 = $add$ptr$i22$i;
       $and$i23$i = $133 & 7;
       $cmp$i24$i = ($and$i23$i|0)==(0);
       if ($cmp$i24$i) {
        $cond$i27$i = 0;
       } else {
        $134 = (0 - ($133))|0;
        $and3$i25$i = $134 & 7;
        $cond$i27$i = $and3$i25$i;
       }
       $add$ptr4$i28$i = (($120) + ($cond$i27$i)|0);
       $sub5$i29$i = (($add212$i) - ($cond$i27$i))|0;
       HEAP32[((1344 + 24|0))>>2] = $add$ptr4$i28$i;
       HEAP32[((1344 + 12|0))>>2] = $sub5$i29$i;
       $or$i30$i = $sub5$i29$i | 1;
       $add$ptr4$sum$i31$i = (($cond$i27$i) + 4)|0;
       $head$i32$i = (($120) + ($add$ptr4$sum$i31$i)|0);
       HEAP32[$head$i32$i>>2] = $or$i30$i;
       $add$ptr6$sum$i33$i = (($add212$i) + 4)|0;
       $head7$i34$i = (($120) + ($add$ptr6$sum$i33$i)|0);
       HEAP32[$head7$i34$i>>2] = 40;
       $135 = HEAP32[((1816 + 16|0))>>2]|0;
       HEAP32[((1344 + 28|0))>>2] = $135;
       break;
      }
     }
    }
    $136 = HEAP32[((1344 + 16|0))>>2]|0;
    $cmp215$i = ($tbase$291$i>>>0)<($136>>>0);
    if ($cmp215$i) {
     HEAP32[((1344 + 16|0))>>2] = $tbase$291$i;
    }
    $add$ptr224$i = (($tbase$291$i) + ($tsize$290$i)|0);
    $sp$1105$i = ((1344 + 448|0));
    while(1) {
     $137 = HEAP32[$sp$1105$i>>2]|0;
     $cmp225$i = ($137|0)==($add$ptr224$i|0);
     if ($cmp225$i) {
      label = 224;
      break;
     }
     $next228$i = (($sp$1105$i) + 8|0);
     $138 = HEAP32[$next228$i>>2]|0;
     $cmp221$i = ($138|0)==(0|0);
     if ($cmp221$i) {
      break;
     } else {
      $sp$1105$i = $138;
     }
    }
    if ((label|0) == 224) {
     $sflags232$i = (($sp$1105$i) + 12|0);
     $139 = HEAP32[$sflags232$i>>2]|0;
     $and233$i = $139 & 8;
     $tobool234$i = ($and233$i|0)==(0);
     if ($tobool234$i) {
      HEAP32[$sp$1105$i>>2] = $tbase$291$i;
      $size242$i = (($sp$1105$i) + 4|0);
      $140 = HEAP32[$size242$i>>2]|0;
      $add243$i = (($140) + ($tsize$290$i))|0;
      HEAP32[$size242$i>>2] = $add243$i;
      $add$ptr$i37$i = (($tbase$291$i) + 8|0);
      $141 = $add$ptr$i37$i;
      $and$i38$i = $141 & 7;
      $cmp$i39$i = ($and$i38$i|0)==(0);
      if ($cmp$i39$i) {
       $cond$i42$i = 0;
      } else {
       $142 = (0 - ($141))|0;
       $and3$i40$i = $142 & 7;
       $cond$i42$i = $and3$i40$i;
      }
      $add$ptr4$i43$i = (($tbase$291$i) + ($cond$i42$i)|0);
      $add$ptr224$sum$i = (($tsize$290$i) + 8)|0;
      $add$ptr5$i$i = (($tbase$291$i) + ($add$ptr224$sum$i)|0);
      $143 = $add$ptr5$i$i;
      $and6$i44$i = $143 & 7;
      $cmp7$i$i = ($and6$i44$i|0)==(0);
      if ($cmp7$i$i) {
       $cond15$i$i = 0;
      } else {
       $144 = (0 - ($143))|0;
       $and13$i$i = $144 & 7;
       $cond15$i$i = $and13$i$i;
      }
      $add$ptr224$sum131$i = (($cond15$i$i) + ($tsize$290$i))|0;
      $add$ptr16$i$i = (($tbase$291$i) + ($add$ptr224$sum131$i)|0);
      $sub$ptr$lhs$cast$i46$i = $add$ptr16$i$i;
      $sub$ptr$rhs$cast$i47$i = $add$ptr4$i43$i;
      $sub$ptr$sub$i48$i = (($sub$ptr$lhs$cast$i46$i) - ($sub$ptr$rhs$cast$i47$i))|0;
      $add$ptr4$sum$i49$i = (($cond$i42$i) + ($nb$0))|0;
      $add$ptr17$i$i = (($tbase$291$i) + ($add$ptr4$sum$i49$i)|0);
      $sub18$i$i = (($sub$ptr$sub$i48$i) - ($nb$0))|0;
      $or19$i$i = $nb$0 | 3;
      $add$ptr4$sum1$i$i = (($cond$i42$i) + 4)|0;
      $head$i50$i = (($tbase$291$i) + ($add$ptr4$sum1$i$i)|0);
      HEAP32[$head$i50$i>>2] = $or19$i$i;
      $145 = HEAP32[((1344 + 24|0))>>2]|0;
      $cmp20$i$i = ($add$ptr16$i$i|0)==($145|0);
      L348: do {
       if ($cmp20$i$i) {
        $146 = HEAP32[((1344 + 12|0))>>2]|0;
        $add$i$i = (($146) + ($sub18$i$i))|0;
        HEAP32[((1344 + 12|0))>>2] = $add$i$i;
        HEAP32[((1344 + 24|0))>>2] = $add$ptr17$i$i;
        $or22$i$i = $add$i$i | 1;
        $add$ptr17$sum35$i$i = (($add$ptr4$sum$i49$i) + 4)|0;
        $head23$i$i = (($tbase$291$i) + ($add$ptr17$sum35$i$i)|0);
        HEAP32[$head23$i$i>>2] = $or22$i$i;
       } else {
        $147 = HEAP32[((1344 + 20|0))>>2]|0;
        $cmp24$i$i = ($add$ptr16$i$i|0)==($147|0);
        if ($cmp24$i$i) {
         $148 = HEAP32[((1344 + 8|0))>>2]|0;
         $add26$i$i = (($148) + ($sub18$i$i))|0;
         HEAP32[((1344 + 8|0))>>2] = $add26$i$i;
         HEAP32[((1344 + 20|0))>>2] = $add$ptr17$i$i;
         $or28$i$i = $add26$i$i | 1;
         $add$ptr17$sum33$i$i = (($add$ptr4$sum$i49$i) + 4)|0;
         $head29$i$i = (($tbase$291$i) + ($add$ptr17$sum33$i$i)|0);
         HEAP32[$head29$i$i>>2] = $or28$i$i;
         $add$ptr17$sum34$i$i = (($add26$i$i) + ($add$ptr4$sum$i49$i))|0;
         $add$ptr30$i52$i = (($tbase$291$i) + ($add$ptr17$sum34$i$i)|0);
         HEAP32[$add$ptr30$i52$i>>2] = $add26$i$i;
         break;
        }
        $add$ptr16$sum$i$i = (($tsize$290$i) + 4)|0;
        $add$ptr224$sum132$i = (($add$ptr16$sum$i$i) + ($cond15$i$i))|0;
        $head32$i$i = (($tbase$291$i) + ($add$ptr224$sum132$i)|0);
        $149 = HEAP32[$head32$i$i>>2]|0;
        $and33$i$i = $149 & 3;
        $cmp34$i$i = ($and33$i$i|0)==(1);
        if ($cmp34$i$i) {
         $and37$i$i = $149 & -8;
         $shr$i54$i = $149 >>> 3;
         $cmp38$i$i = ($149>>>0)<(256);
         L356: do {
          if ($cmp38$i$i) {
           $add$ptr16$sum3031$i$i = $cond15$i$i | 8;
           $add$ptr224$sum142$i = (($add$ptr16$sum3031$i$i) + ($tsize$290$i))|0;
           $fd$i$i = (($tbase$291$i) + ($add$ptr224$sum142$i)|0);
           $150 = HEAP32[$fd$i$i>>2]|0;
           $add$ptr16$sum32$i$i = (($tsize$290$i) + 12)|0;
           $add$ptr224$sum143$i = (($add$ptr16$sum32$i$i) + ($cond15$i$i))|0;
           $bk$i55$i = (($tbase$291$i) + ($add$ptr224$sum143$i)|0);
           $151 = HEAP32[$bk$i55$i>>2]|0;
           $shl$i56$i = $shr$i54$i << 1;
           $arrayidx$i57$i = ((1344 + ($shl$i56$i<<2)|0) + 40|0);
           $cmp41$i$i = ($150|0)==($arrayidx$i57$i|0);
           do {
            if (!($cmp41$i$i)) {
             $152 = HEAP32[((1344 + 16|0))>>2]|0;
             $cmp42$i$i = ($150>>>0)<($152>>>0);
             if ($cmp42$i$i) {
              _abort();
              // unreachable;
             }
             $bk43$i$i = (($150) + 12|0);
             $153 = HEAP32[$bk43$i$i>>2]|0;
             $cmp44$i$i = ($153|0)==($add$ptr16$i$i|0);
             if ($cmp44$i$i) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $cmp46$i59$i = ($151|0)==($150|0);
           if ($cmp46$i59$i) {
            $shl48$i$i = 1 << $shr$i54$i;
            $neg$i$i = $shl48$i$i ^ -1;
            $154 = HEAP32[1344>>2]|0;
            $and49$i$i = $154 & $neg$i$i;
            HEAP32[1344>>2] = $and49$i$i;
            break;
           }
           $cmp54$i$i = ($151|0)==($arrayidx$i57$i|0);
           do {
            if ($cmp54$i$i) {
             $fd68$pre$i$i = (($151) + 8|0);
             $fd68$pre$phi$i$iZ2D = $fd68$pre$i$i;
            } else {
             $155 = HEAP32[((1344 + 16|0))>>2]|0;
             $cmp57$i$i = ($151>>>0)<($155>>>0);
             if ($cmp57$i$i) {
              _abort();
              // unreachable;
             }
             $fd59$i$i = (($151) + 8|0);
             $156 = HEAP32[$fd59$i$i>>2]|0;
             $cmp60$i$i = ($156|0)==($add$ptr16$i$i|0);
             if ($cmp60$i$i) {
              $fd68$pre$phi$i$iZ2D = $fd59$i$i;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $bk67$i$i = (($150) + 12|0);
           HEAP32[$bk67$i$i>>2] = $151;
           HEAP32[$fd68$pre$phi$i$iZ2D>>2] = $150;
          } else {
           $add$ptr16$sum23$i$i = $cond15$i$i | 24;
           $add$ptr224$sum133$i = (($add$ptr16$sum23$i$i) + ($tsize$290$i))|0;
           $parent$i61$i = (($tbase$291$i) + ($add$ptr224$sum133$i)|0);
           $157 = HEAP32[$parent$i61$i>>2]|0;
           $add$ptr16$sum4$i$i = (($tsize$290$i) + 12)|0;
           $add$ptr224$sum134$i = (($add$ptr16$sum4$i$i) + ($cond15$i$i))|0;
           $bk74$i$i = (($tbase$291$i) + ($add$ptr224$sum134$i)|0);
           $158 = HEAP32[$bk74$i$i>>2]|0;
           $cmp75$i$i = ($158|0)==($add$ptr16$i$i|0);
           do {
            if ($cmp75$i$i) {
             $add$ptr16$sum56$i$i = $cond15$i$i | 16;
             $add$ptr224$sum140$i = (($add$ptr16$sum$i$i) + ($add$ptr16$sum56$i$i))|0;
             $arrayidx96$i$i = (($tbase$291$i) + ($add$ptr224$sum140$i)|0);
             $163 = HEAP32[$arrayidx96$i$i>>2]|0;
             $cmp97$i$i = ($163|0)==(0|0);
             if ($cmp97$i$i) {
              $add$ptr224$sum141$i = (($add$ptr16$sum56$i$i) + ($tsize$290$i))|0;
              $child$i$i = (($tbase$291$i) + ($add$ptr224$sum141$i)|0);
              $164 = HEAP32[$child$i$i>>2]|0;
              $cmp100$i$i = ($164|0)==(0|0);
              if ($cmp100$i$i) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $164;$RP$0$i$i = $child$i$i;
              }
             } else {
              $R$0$i$i = $163;$RP$0$i$i = $arrayidx96$i$i;
             }
             while(1) {
              $arrayidx103$i$i = (($R$0$i$i) + 20|0);
              $165 = HEAP32[$arrayidx103$i$i>>2]|0;
              $cmp104$i$i = ($165|0)==(0|0);
              if (!($cmp104$i$i)) {
               $R$0$i$i = $165;$RP$0$i$i = $arrayidx103$i$i;
               continue;
              }
              $arrayidx107$i$i = (($R$0$i$i) + 16|0);
              $166 = HEAP32[$arrayidx107$i$i>>2]|0;
              $cmp108$i$i = ($166|0)==(0|0);
              if ($cmp108$i$i) {
               break;
              } else {
               $R$0$i$i = $166;$RP$0$i$i = $arrayidx107$i$i;
              }
             }
             $167 = HEAP32[((1344 + 16|0))>>2]|0;
             $cmp112$i$i = ($RP$0$i$i>>>0)<($167>>>0);
             if ($cmp112$i$i) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $add$ptr16$sum2829$i$i = $cond15$i$i | 8;
             $add$ptr224$sum135$i = (($add$ptr16$sum2829$i$i) + ($tsize$290$i))|0;
             $fd78$i$i = (($tbase$291$i) + ($add$ptr224$sum135$i)|0);
             $159 = HEAP32[$fd78$i$i>>2]|0;
             $160 = HEAP32[((1344 + 16|0))>>2]|0;
             $cmp81$i$i = ($159>>>0)<($160>>>0);
             if ($cmp81$i$i) {
              _abort();
              // unreachable;
             }
             $bk82$i$i = (($159) + 12|0);
             $161 = HEAP32[$bk82$i$i>>2]|0;
             $cmp83$i$i = ($161|0)==($add$ptr16$i$i|0);
             if (!($cmp83$i$i)) {
              _abort();
              // unreachable;
             }
             $fd85$i$i = (($158) + 8|0);
             $162 = HEAP32[$fd85$i$i>>2]|0;
             $cmp86$i$i = ($162|0)==($add$ptr16$i$i|0);
             if ($cmp86$i$i) {
              HEAP32[$bk82$i$i>>2] = $158;
              HEAP32[$fd85$i$i>>2] = $159;
              $R$1$i$i = $158;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $cmp120$i63$i = ($157|0)==(0|0);
           if ($cmp120$i63$i) {
            break;
           }
           $add$ptr16$sum25$i$i = (($tsize$290$i) + 28)|0;
           $add$ptr224$sum136$i = (($add$ptr16$sum25$i$i) + ($cond15$i$i))|0;
           $index$i64$i = (($tbase$291$i) + ($add$ptr224$sum136$i)|0);
           $168 = HEAP32[$index$i64$i>>2]|0;
           $arrayidx123$i$i = ((1344 + ($168<<2)|0) + 304|0);
           $169 = HEAP32[$arrayidx123$i$i>>2]|0;
           $cmp124$i$i = ($add$ptr16$i$i|0)==($169|0);
           do {
            if ($cmp124$i$i) {
             HEAP32[$arrayidx123$i$i>>2] = $R$1$i$i;
             $cond37$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond37$i$i)) {
              break;
             }
             $shl131$i$i = 1 << $168;
             $neg132$i$i = $shl131$i$i ^ -1;
             $170 = HEAP32[((1344 + 4|0))>>2]|0;
             $and133$i$i = $170 & $neg132$i$i;
             HEAP32[((1344 + 4|0))>>2] = $and133$i$i;
             break L356;
            } else {
             $171 = HEAP32[((1344 + 16|0))>>2]|0;
             $cmp137$i$i = ($157>>>0)<($171>>>0);
             if ($cmp137$i$i) {
              _abort();
              // unreachable;
             }
             $arrayidx143$i$i = (($157) + 16|0);
             $172 = HEAP32[$arrayidx143$i$i>>2]|0;
             $cmp144$i$i = ($172|0)==($add$ptr16$i$i|0);
             if ($cmp144$i$i) {
              HEAP32[$arrayidx143$i$i>>2] = $R$1$i$i;
             } else {
              $arrayidx151$i$i = (($157) + 20|0);
              HEAP32[$arrayidx151$i$i>>2] = $R$1$i$i;
             }
             $cmp156$i$i = ($R$1$i$i|0)==(0|0);
             if ($cmp156$i$i) {
              break L356;
             }
            }
           } while(0);
           $173 = HEAP32[((1344 + 16|0))>>2]|0;
           $cmp160$i$i = ($R$1$i$i>>>0)<($173>>>0);
           if ($cmp160$i$i) {
            _abort();
            // unreachable;
           }
           $parent165$i$i = (($R$1$i$i) + 24|0);
           HEAP32[$parent165$i$i>>2] = $157;
           $add$ptr16$sum2627$i$i = $cond15$i$i | 16;
           $add$ptr224$sum137$i = (($add$ptr16$sum2627$i$i) + ($tsize$290$i))|0;
           $child166$i$i = (($tbase$291$i) + ($add$ptr224$sum137$i)|0);
           $174 = HEAP32[$child166$i$i>>2]|0;
           $cmp168$i$i = ($174|0)==(0|0);
           do {
            if (!($cmp168$i$i)) {
             $175 = HEAP32[((1344 + 16|0))>>2]|0;
             $cmp172$i$i = ($174>>>0)<($175>>>0);
             if ($cmp172$i$i) {
              _abort();
              // unreachable;
             } else {
              $arrayidx178$i$i = (($R$1$i$i) + 16|0);
              HEAP32[$arrayidx178$i$i>>2] = $174;
              $parent179$i$i = (($174) + 24|0);
              HEAP32[$parent179$i$i>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $add$ptr224$sum138$i = (($add$ptr16$sum$i$i) + ($add$ptr16$sum2627$i$i))|0;
           $arrayidx184$i$i = (($tbase$291$i) + ($add$ptr224$sum138$i)|0);
           $176 = HEAP32[$arrayidx184$i$i>>2]|0;
           $cmp185$i$i = ($176|0)==(0|0);
           if ($cmp185$i$i) {
            break;
           }
           $177 = HEAP32[((1344 + 16|0))>>2]|0;
           $cmp189$i$i = ($176>>>0)<($177>>>0);
           if ($cmp189$i$i) {
            _abort();
            // unreachable;
           } else {
            $arrayidx195$i$i = (($R$1$i$i) + 20|0);
            HEAP32[$arrayidx195$i$i>>2] = $176;
            $parent196$i$i = (($176) + 24|0);
            HEAP32[$parent196$i$i>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $add$ptr16$sum7$i$i = $and37$i$i | $cond15$i$i;
         $add$ptr224$sum139$i = (($add$ptr16$sum7$i$i) + ($tsize$290$i))|0;
         $add$ptr205$i$i = (($tbase$291$i) + ($add$ptr224$sum139$i)|0);
         $add206$i$i = (($and37$i$i) + ($sub18$i$i))|0;
         $oldfirst$0$i$i = $add$ptr205$i$i;$qsize$0$i$i = $add206$i$i;
        } else {
         $oldfirst$0$i$i = $add$ptr16$i$i;$qsize$0$i$i = $sub18$i$i;
        }
        $head208$i$i = (($oldfirst$0$i$i) + 4|0);
        $178 = HEAP32[$head208$i$i>>2]|0;
        $and209$i$i = $178 & -2;
        HEAP32[$head208$i$i>>2] = $and209$i$i;
        $or210$i$i = $qsize$0$i$i | 1;
        $add$ptr17$sum$i$i = (($add$ptr4$sum$i49$i) + 4)|0;
        $head211$i$i = (($tbase$291$i) + ($add$ptr17$sum$i$i)|0);
        HEAP32[$head211$i$i>>2] = $or210$i$i;
        $add$ptr17$sum8$i$i = (($qsize$0$i$i) + ($add$ptr4$sum$i49$i))|0;
        $add$ptr212$i$i = (($tbase$291$i) + ($add$ptr17$sum8$i$i)|0);
        HEAP32[$add$ptr212$i$i>>2] = $qsize$0$i$i;
        $shr214$i$i = $qsize$0$i$i >>> 3;
        $cmp215$i$i = ($qsize$0$i$i>>>0)<(256);
        if ($cmp215$i$i) {
         $shl221$i$i = $shr214$i$i << 1;
         $arrayidx223$i$i = ((1344 + ($shl221$i$i<<2)|0) + 40|0);
         $179 = HEAP32[1344>>2]|0;
         $shl226$i$i = 1 << $shr214$i$i;
         $and227$i$i = $179 & $shl226$i$i;
         $tobool228$i$i = ($and227$i$i|0)==(0);
         do {
          if ($tobool228$i$i) {
           $or232$i$i = $179 | $shl226$i$i;
           HEAP32[1344>>2] = $or232$i$i;
           $arrayidx223$sum$pre$i$i = (($shl221$i$i) + 2)|0;
           $$pre$i66$i = ((1344 + ($arrayidx223$sum$pre$i$i<<2)|0) + 40|0);
           $$pre$phi$i67$iZ2D = $$pre$i66$i;$F224$0$i$i = $arrayidx223$i$i;
          } else {
           $arrayidx223$sum24$i$i = (($shl221$i$i) + 2)|0;
           $180 = ((1344 + ($arrayidx223$sum24$i$i<<2)|0) + 40|0);
           $181 = HEAP32[$180>>2]|0;
           $182 = HEAP32[((1344 + 16|0))>>2]|0;
           $cmp236$i$i = ($181>>>0)<($182>>>0);
           if (!($cmp236$i$i)) {
            $$pre$phi$i67$iZ2D = $180;$F224$0$i$i = $181;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i67$iZ2D>>2] = $add$ptr17$i$i;
         $bk246$i$i = (($F224$0$i$i) + 12|0);
         HEAP32[$bk246$i$i>>2] = $add$ptr17$i$i;
         $add$ptr17$sum22$i$i = (($add$ptr4$sum$i49$i) + 8)|0;
         $fd247$i$i = (($tbase$291$i) + ($add$ptr17$sum22$i$i)|0);
         HEAP32[$fd247$i$i>>2] = $F224$0$i$i;
         $add$ptr17$sum23$i$i = (($add$ptr4$sum$i49$i) + 12)|0;
         $bk248$i$i = (($tbase$291$i) + ($add$ptr17$sum23$i$i)|0);
         HEAP32[$bk248$i$i>>2] = $arrayidx223$i$i;
         break;
        }
        $shr253$i$i = $qsize$0$i$i >>> 8;
        $cmp254$i$i = ($shr253$i$i|0)==(0);
        do {
         if ($cmp254$i$i) {
          $I252$0$i$i = 0;
         } else {
          $cmp258$i$i = ($qsize$0$i$i>>>0)>(16777215);
          if ($cmp258$i$i) {
           $I252$0$i$i = 31;
           break;
          }
          $sub262$i$i = (($shr253$i$i) + 1048320)|0;
          $shr263$i$i = $sub262$i$i >>> 16;
          $and264$i$i = $shr263$i$i & 8;
          $shl265$i$i = $shr253$i$i << $and264$i$i;
          $sub266$i$i = (($shl265$i$i) + 520192)|0;
          $shr267$i$i = $sub266$i$i >>> 16;
          $and268$i$i = $shr267$i$i & 4;
          $add269$i$i = $and268$i$i | $and264$i$i;
          $shl270$i$i = $shl265$i$i << $and268$i$i;
          $sub271$i$i = (($shl270$i$i) + 245760)|0;
          $shr272$i$i = $sub271$i$i >>> 16;
          $and273$i$i = $shr272$i$i & 2;
          $add274$i$i = $add269$i$i | $and273$i$i;
          $sub275$i$i = (14 - ($add274$i$i))|0;
          $shl276$i$i = $shl270$i$i << $and273$i$i;
          $shr277$i$i = $shl276$i$i >>> 15;
          $add278$i$i = (($sub275$i$i) + ($shr277$i$i))|0;
          $shl279$i$i = $add278$i$i << 1;
          $add280$i$i = (($add278$i$i) + 7)|0;
          $shr281$i$i = $qsize$0$i$i >>> $add280$i$i;
          $and282$i$i = $shr281$i$i & 1;
          $add283$i$i = $and282$i$i | $shl279$i$i;
          $I252$0$i$i = $add283$i$i;
         }
        } while(0);
        $arrayidx287$i$i = ((1344 + ($I252$0$i$i<<2)|0) + 304|0);
        $add$ptr17$sum9$i$i = (($add$ptr4$sum$i49$i) + 28)|0;
        $index288$i$i = (($tbase$291$i) + ($add$ptr17$sum9$i$i)|0);
        HEAP32[$index288$i$i>>2] = $I252$0$i$i;
        $add$ptr17$sum10$i$i = (($add$ptr4$sum$i49$i) + 16)|0;
        $child289$i$i = (($tbase$291$i) + ($add$ptr17$sum10$i$i)|0);
        $child289$sum$i$i = (($add$ptr4$sum$i49$i) + 20)|0;
        $arrayidx290$i$i = (($tbase$291$i) + ($child289$sum$i$i)|0);
        HEAP32[$arrayidx290$i$i>>2] = 0;
        HEAP32[$child289$i$i>>2] = 0;
        $183 = HEAP32[((1344 + 4|0))>>2]|0;
        $shl294$i$i = 1 << $I252$0$i$i;
        $and295$i$i = $183 & $shl294$i$i;
        $tobool296$i$i = ($and295$i$i|0)==(0);
        if ($tobool296$i$i) {
         $or300$i$i = $183 | $shl294$i$i;
         HEAP32[((1344 + 4|0))>>2] = $or300$i$i;
         HEAP32[$arrayidx287$i$i>>2] = $add$ptr17$i$i;
         $add$ptr17$sum11$i$i = (($add$ptr4$sum$i49$i) + 24)|0;
         $parent301$i$i = (($tbase$291$i) + ($add$ptr17$sum11$i$i)|0);
         HEAP32[$parent301$i$i>>2] = $arrayidx287$i$i;
         $add$ptr17$sum12$i$i = (($add$ptr4$sum$i49$i) + 12)|0;
         $bk302$i$i = (($tbase$291$i) + ($add$ptr17$sum12$i$i)|0);
         HEAP32[$bk302$i$i>>2] = $add$ptr17$i$i;
         $add$ptr17$sum13$i$i = (($add$ptr4$sum$i49$i) + 8)|0;
         $fd303$i$i = (($tbase$291$i) + ($add$ptr17$sum13$i$i)|0);
         HEAP32[$fd303$i$i>>2] = $add$ptr17$i$i;
         break;
        }
        $184 = HEAP32[$arrayidx287$i$i>>2]|0;
        $cmp306$i$i = ($I252$0$i$i|0)==(31);
        if ($cmp306$i$i) {
         $cond315$i$i = 0;
        } else {
         $shr310$i$i = $I252$0$i$i >>> 1;
         $sub313$i$i = (25 - ($shr310$i$i))|0;
         $cond315$i$i = $sub313$i$i;
        }
        $head31739$i$i = (($184) + 4|0);
        $185 = HEAP32[$head31739$i$i>>2]|0;
        $and31840$i$i = $185 & -8;
        $cmp31941$i$i = ($and31840$i$i|0)==($qsize$0$i$i|0);
        L445: do {
         if ($cmp31941$i$i) {
          $T$0$lcssa$i69$i = $184;
         } else {
          $shl316$i$i = $qsize$0$i$i << $cond315$i$i;
          $K305$043$i$i = $shl316$i$i;$T$042$i$i = $184;
          while(1) {
           $shr322$i$i = $K305$043$i$i >>> 31;
           $arrayidx325$i$i = ((($T$042$i$i) + ($shr322$i$i<<2)|0) + 16|0);
           $186 = HEAP32[$arrayidx325$i$i>>2]|0;
           $cmp327$i$i = ($186|0)==(0|0);
           if ($cmp327$i$i) {
            break;
           }
           $shl326$i$i = $K305$043$i$i << 1;
           $head317$i$i = (($186) + 4|0);
           $187 = HEAP32[$head317$i$i>>2]|0;
           $and318$i$i = $187 & -8;
           $cmp319$i$i = ($and318$i$i|0)==($qsize$0$i$i|0);
           if ($cmp319$i$i) {
            $T$0$lcssa$i69$i = $186;
            break L445;
           } else {
            $K305$043$i$i = $shl326$i$i;$T$042$i$i = $186;
           }
          }
          $188 = HEAP32[((1344 + 16|0))>>2]|0;
          $cmp332$i$i = ($arrayidx325$i$i>>>0)<($188>>>0);
          if ($cmp332$i$i) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$arrayidx325$i$i>>2] = $add$ptr17$i$i;
           $add$ptr17$sum19$i$i = (($add$ptr4$sum$i49$i) + 24)|0;
           $parent337$i$i = (($tbase$291$i) + ($add$ptr17$sum19$i$i)|0);
           HEAP32[$parent337$i$i>>2] = $T$042$i$i;
           $add$ptr17$sum20$i$i = (($add$ptr4$sum$i49$i) + 12)|0;
           $bk338$i$i = (($tbase$291$i) + ($add$ptr17$sum20$i$i)|0);
           HEAP32[$bk338$i$i>>2] = $add$ptr17$i$i;
           $add$ptr17$sum21$i$i = (($add$ptr4$sum$i49$i) + 8)|0;
           $fd339$i$i = (($tbase$291$i) + ($add$ptr17$sum21$i$i)|0);
           HEAP32[$fd339$i$i>>2] = $add$ptr17$i$i;
           break L348;
          }
         }
        } while(0);
        $fd344$i$i = (($T$0$lcssa$i69$i) + 8|0);
        $189 = HEAP32[$fd344$i$i>>2]|0;
        $190 = HEAP32[((1344 + 16|0))>>2]|0;
        $cmp346$i$i = ($T$0$lcssa$i69$i>>>0)<($190>>>0);
        if ($cmp346$i$i) {
         _abort();
         // unreachable;
        }
        $cmp350$i$i = ($189>>>0)<($190>>>0);
        if ($cmp350$i$i) {
         _abort();
         // unreachable;
        } else {
         $bk357$i$i = (($189) + 12|0);
         HEAP32[$bk357$i$i>>2] = $add$ptr17$i$i;
         HEAP32[$fd344$i$i>>2] = $add$ptr17$i$i;
         $add$ptr17$sum16$i$i = (($add$ptr4$sum$i49$i) + 8)|0;
         $fd359$i$i = (($tbase$291$i) + ($add$ptr17$sum16$i$i)|0);
         HEAP32[$fd359$i$i>>2] = $189;
         $add$ptr17$sum17$i$i = (($add$ptr4$sum$i49$i) + 12)|0;
         $bk360$i$i = (($tbase$291$i) + ($add$ptr17$sum17$i$i)|0);
         HEAP32[$bk360$i$i>>2] = $T$0$lcssa$i69$i;
         $add$ptr17$sum18$i$i = (($add$ptr4$sum$i49$i) + 24)|0;
         $parent361$i$i = (($tbase$291$i) + ($add$ptr17$sum18$i$i)|0);
         HEAP32[$parent361$i$i>>2] = 0;
         break;
        }
       }
      } while(0);
      $add$ptr4$sum1415$i$i = $cond$i42$i | 8;
      $add$ptr368$i$i = (($tbase$291$i) + ($add$ptr4$sum1415$i$i)|0);
      $mem$0 = $add$ptr368$i$i;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((1344 + 448|0));
    while(1) {
     $191 = HEAP32[$sp$0$i$i$i>>2]|0;
     $cmp$i$i$i = ($191>>>0)>($120>>>0);
     if (!($cmp$i$i$i)) {
      $size$i$i$i = (($sp$0$i$i$i) + 4|0);
      $192 = HEAP32[$size$i$i$i>>2]|0;
      $add$ptr$i$i$i = (($191) + ($192)|0);
      $cmp2$i$i$i = ($add$ptr$i$i$i>>>0)>($120>>>0);
      if ($cmp2$i$i$i) {
       break;
      }
     }
     $next$i$i$i = (($sp$0$i$i$i) + 8|0);
     $193 = HEAP32[$next$i$i$i>>2]|0;
     $sp$0$i$i$i = $193;
    }
    $add$ptr$sum$i$i = (($192) + -47)|0;
    $add$ptr2$sum$i$i = (($192) + -39)|0;
    $add$ptr3$i$i = (($191) + ($add$ptr2$sum$i$i)|0);
    $194 = $add$ptr3$i$i;
    $and$i14$i = $194 & 7;
    $cmp$i15$i = ($and$i14$i|0)==(0);
    if ($cmp$i15$i) {
     $cond$i17$i = 0;
    } else {
     $195 = (0 - ($194))|0;
     $and6$i$i = $195 & 7;
     $cond$i17$i = $and6$i$i;
    }
    $add$ptr2$sum1$i$i = (($add$ptr$sum$i$i) + ($cond$i17$i))|0;
    $add$ptr7$i$i = (($191) + ($add$ptr2$sum1$i$i)|0);
    $add$ptr82$i$i = (($120) + 16|0);
    $cmp9$i$i = ($add$ptr7$i$i>>>0)<($add$ptr82$i$i>>>0);
    $cond13$i$i = $cmp9$i$i ? $120 : $add$ptr7$i$i;
    $add$ptr14$i$i = (($cond13$i$i) + 8|0);
    $sub16$i$i = (($tsize$290$i) + -40)|0;
    $add$ptr$i10$i$i = (($tbase$291$i) + 8|0);
    $196 = $add$ptr$i10$i$i;
    $and$i$i$i = $196 & 7;
    $cmp$i11$i$i = ($and$i$i$i|0)==(0);
    if ($cmp$i11$i$i) {
     $cond$i$i$i = 0;
    } else {
     $197 = (0 - ($196))|0;
     $and3$i$i$i = $197 & 7;
     $cond$i$i$i = $and3$i$i$i;
    }
    $add$ptr4$i$i$i = (($tbase$291$i) + ($cond$i$i$i)|0);
    $sub5$i$i$i = (($sub16$i$i) - ($cond$i$i$i))|0;
    HEAP32[((1344 + 24|0))>>2] = $add$ptr4$i$i$i;
    HEAP32[((1344 + 12|0))>>2] = $sub5$i$i$i;
    $or$i$i$i = $sub5$i$i$i | 1;
    $add$ptr4$sum$i$i$i = (($cond$i$i$i) + 4)|0;
    $head$i$i$i = (($tbase$291$i) + ($add$ptr4$sum$i$i$i)|0);
    HEAP32[$head$i$i$i>>2] = $or$i$i$i;
    $add$ptr6$sum$i$i$i = (($tsize$290$i) + -36)|0;
    $head7$i$i$i = (($tbase$291$i) + ($add$ptr6$sum$i$i$i)|0);
    HEAP32[$head7$i$i$i>>2] = 40;
    $198 = HEAP32[((1816 + 16|0))>>2]|0;
    HEAP32[((1344 + 28|0))>>2] = $198;
    $head$i18$i = (($cond13$i$i) + 4|0);
    HEAP32[$head$i18$i>>2] = 27;
    ;HEAP32[$add$ptr14$i$i+0>>2]=HEAP32[((1344 + 448|0))+0>>2]|0;HEAP32[$add$ptr14$i$i+4>>2]=HEAP32[((1344 + 448|0))+4>>2]|0;HEAP32[$add$ptr14$i$i+8>>2]=HEAP32[((1344 + 448|0))+8>>2]|0;HEAP32[$add$ptr14$i$i+12>>2]=HEAP32[((1344 + 448|0))+12>>2]|0;
    HEAP32[((1344 + 448|0))>>2] = $tbase$291$i;
    HEAP32[((1344 + 452|0))>>2] = $tsize$290$i;
    HEAP32[((1344 + 460|0))>>2] = 0;
    HEAP32[((1344 + 456|0))>>2] = $add$ptr14$i$i;
    $add$ptr2418$i$i = (($cond13$i$i) + 28|0);
    HEAP32[$add$ptr2418$i$i>>2] = 7;
    $199 = (($cond13$i$i) + 32|0);
    $cmp2719$i$i = ($199>>>0)<($add$ptr$i$i$i>>>0);
    if ($cmp2719$i$i) {
     $add$ptr2420$i$i = $add$ptr2418$i$i;
     while(1) {
      $200 = (($add$ptr2420$i$i) + 4|0);
      HEAP32[$200>>2] = 7;
      $201 = (($add$ptr2420$i$i) + 8|0);
      $cmp27$i$i = ($201>>>0)<($add$ptr$i$i$i>>>0);
      if ($cmp27$i$i) {
       $add$ptr2420$i$i = $200;
      } else {
       break;
      }
     }
    }
    $cmp28$i$i = ($cond13$i$i|0)==($120|0);
    if (!($cmp28$i$i)) {
     $sub$ptr$lhs$cast$i$i = $cond13$i$i;
     $sub$ptr$rhs$cast$i$i = $120;
     $sub$ptr$sub$i$i = (($sub$ptr$lhs$cast$i$i) - ($sub$ptr$rhs$cast$i$i))|0;
     $add$ptr30$i$i = (($120) + ($sub$ptr$sub$i$i)|0);
     $add$ptr30$sum$i$i = (($sub$ptr$sub$i$i) + 4)|0;
     $head31$i$i = (($120) + ($add$ptr30$sum$i$i)|0);
     $202 = HEAP32[$head31$i$i>>2]|0;
     $and32$i$i = $202 & -2;
     HEAP32[$head31$i$i>>2] = $and32$i$i;
     $or33$i$i = $sub$ptr$sub$i$i | 1;
     $head34$i$i = (($120) + 4|0);
     HEAP32[$head34$i$i>>2] = $or33$i$i;
     HEAP32[$add$ptr30$i$i>>2] = $sub$ptr$sub$i$i;
     $shr$i$i = $sub$ptr$sub$i$i >>> 3;
     $cmp36$i$i = ($sub$ptr$sub$i$i>>>0)<(256);
     if ($cmp36$i$i) {
      $shl$i20$i = $shr$i$i << 1;
      $arrayidx$i21$i = ((1344 + ($shl$i20$i<<2)|0) + 40|0);
      $203 = HEAP32[1344>>2]|0;
      $shl39$i$i = 1 << $shr$i$i;
      $and40$i$i = $203 & $shl39$i$i;
      $tobool$i$i = ($and40$i$i|0)==(0);
      do {
       if ($tobool$i$i) {
        $or44$i$i = $203 | $shl39$i$i;
        HEAP32[1344>>2] = $or44$i$i;
        $arrayidx$sum$pre$i$i = (($shl$i20$i) + 2)|0;
        $$pre$i$i = ((1344 + ($arrayidx$sum$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $arrayidx$i21$i;
       } else {
        $arrayidx$sum9$i$i = (($shl$i20$i) + 2)|0;
        $204 = ((1344 + ($arrayidx$sum9$i$i<<2)|0) + 40|0);
        $205 = HEAP32[$204>>2]|0;
        $206 = HEAP32[((1344 + 16|0))>>2]|0;
        $cmp46$i$i = ($205>>>0)<($206>>>0);
        if (!($cmp46$i$i)) {
         $$pre$phi$i$iZ2D = $204;$F$0$i$i = $205;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $120;
      $bk$i$i = (($F$0$i$i) + 12|0);
      HEAP32[$bk$i$i>>2] = $120;
      $fd54$i$i = (($120) + 8|0);
      HEAP32[$fd54$i$i>>2] = $F$0$i$i;
      $bk55$i$i = (($120) + 12|0);
      HEAP32[$bk55$i$i>>2] = $arrayidx$i21$i;
      break;
     }
     $shr58$i$i = $sub$ptr$sub$i$i >>> 8;
     $cmp59$i$i = ($shr58$i$i|0)==(0);
     if ($cmp59$i$i) {
      $I57$0$i$i = 0;
     } else {
      $cmp63$i$i = ($sub$ptr$sub$i$i>>>0)>(16777215);
      if ($cmp63$i$i) {
       $I57$0$i$i = 31;
      } else {
       $sub67$i$i = (($shr58$i$i) + 1048320)|0;
       $shr68$i$i = $sub67$i$i >>> 16;
       $and69$i$i = $shr68$i$i & 8;
       $shl70$i$i = $shr58$i$i << $and69$i$i;
       $sub71$i$i = (($shl70$i$i) + 520192)|0;
       $shr72$i$i = $sub71$i$i >>> 16;
       $and73$i$i = $shr72$i$i & 4;
       $add74$i$i = $and73$i$i | $and69$i$i;
       $shl75$i$i = $shl70$i$i << $and73$i$i;
       $sub76$i$i = (($shl75$i$i) + 245760)|0;
       $shr77$i$i = $sub76$i$i >>> 16;
       $and78$i$i = $shr77$i$i & 2;
       $add79$i$i = $add74$i$i | $and78$i$i;
       $sub80$i$i = (14 - ($add79$i$i))|0;
       $shl81$i$i = $shl75$i$i << $and78$i$i;
       $shr82$i$i = $shl81$i$i >>> 15;
       $add83$i$i = (($sub80$i$i) + ($shr82$i$i))|0;
       $shl84$i$i = $add83$i$i << 1;
       $add85$i$i = (($add83$i$i) + 7)|0;
       $shr86$i$i = $sub$ptr$sub$i$i >>> $add85$i$i;
       $and87$i$i = $shr86$i$i & 1;
       $add88$i$i = $and87$i$i | $shl84$i$i;
       $I57$0$i$i = $add88$i$i;
      }
     }
     $arrayidx91$i$i = ((1344 + ($I57$0$i$i<<2)|0) + 304|0);
     $index$i$i = (($120) + 28|0);
     $I57$0$c$i$i = $I57$0$i$i;
     HEAP32[$index$i$i>>2] = $I57$0$c$i$i;
     $arrayidx92$i$i = (($120) + 20|0);
     HEAP32[$arrayidx92$i$i>>2] = 0;
     $207 = (($120) + 16|0);
     HEAP32[$207>>2] = 0;
     $208 = HEAP32[((1344 + 4|0))>>2]|0;
     $shl95$i$i = 1 << $I57$0$i$i;
     $and96$i$i = $208 & $shl95$i$i;
     $tobool97$i$i = ($and96$i$i|0)==(0);
     if ($tobool97$i$i) {
      $or101$i$i = $208 | $shl95$i$i;
      HEAP32[((1344 + 4|0))>>2] = $or101$i$i;
      HEAP32[$arrayidx91$i$i>>2] = $120;
      $parent$i$i = (($120) + 24|0);
      HEAP32[$parent$i$i>>2] = $arrayidx91$i$i;
      $bk102$i$i = (($120) + 12|0);
      HEAP32[$bk102$i$i>>2] = $120;
      $fd103$i$i = (($120) + 8|0);
      HEAP32[$fd103$i$i>>2] = $120;
      break;
     }
     $209 = HEAP32[$arrayidx91$i$i>>2]|0;
     $cmp106$i$i = ($I57$0$i$i|0)==(31);
     if ($cmp106$i$i) {
      $cond115$i$i = 0;
     } else {
      $shr110$i$i = $I57$0$i$i >>> 1;
      $sub113$i$i = (25 - ($shr110$i$i))|0;
      $cond115$i$i = $sub113$i$i;
     }
     $head11813$i$i = (($209) + 4|0);
     $210 = HEAP32[$head11813$i$i>>2]|0;
     $and11914$i$i = $210 & -8;
     $cmp12015$i$i = ($and11914$i$i|0)==($sub$ptr$sub$i$i|0);
     L499: do {
      if ($cmp12015$i$i) {
       $T$0$lcssa$i$i = $209;
      } else {
       $shl116$i$i = $sub$ptr$sub$i$i << $cond115$i$i;
       $K105$017$i$i = $shl116$i$i;$T$016$i$i = $209;
       while(1) {
        $shr123$i$i = $K105$017$i$i >>> 31;
        $arrayidx126$i$i = ((($T$016$i$i) + ($shr123$i$i<<2)|0) + 16|0);
        $211 = HEAP32[$arrayidx126$i$i>>2]|0;
        $cmp128$i$i = ($211|0)==(0|0);
        if ($cmp128$i$i) {
         break;
        }
        $shl127$i$i = $K105$017$i$i << 1;
        $head118$i$i = (($211) + 4|0);
        $212 = HEAP32[$head118$i$i>>2]|0;
        $and119$i$i = $212 & -8;
        $cmp120$i$i = ($and119$i$i|0)==($sub$ptr$sub$i$i|0);
        if ($cmp120$i$i) {
         $T$0$lcssa$i$i = $211;
         break L499;
        } else {
         $K105$017$i$i = $shl127$i$i;$T$016$i$i = $211;
        }
       }
       $213 = HEAP32[((1344 + 16|0))>>2]|0;
       $cmp133$i$i = ($arrayidx126$i$i>>>0)<($213>>>0);
       if ($cmp133$i$i) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$arrayidx126$i$i>>2] = $120;
        $parent138$i$i = (($120) + 24|0);
        HEAP32[$parent138$i$i>>2] = $T$016$i$i;
        $bk139$i$i = (($120) + 12|0);
        HEAP32[$bk139$i$i>>2] = $120;
        $fd140$i$i = (($120) + 8|0);
        HEAP32[$fd140$i$i>>2] = $120;
        break L311;
       }
      }
     } while(0);
     $fd145$i$i = (($T$0$lcssa$i$i) + 8|0);
     $214 = HEAP32[$fd145$i$i>>2]|0;
     $215 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp147$i$i = ($T$0$lcssa$i$i>>>0)<($215>>>0);
     if ($cmp147$i$i) {
      _abort();
      // unreachable;
     }
     $cmp150$i$i = ($214>>>0)<($215>>>0);
     if ($cmp150$i$i) {
      _abort();
      // unreachable;
     } else {
      $bk155$i$i = (($214) + 12|0);
      HEAP32[$bk155$i$i>>2] = $120;
      HEAP32[$fd145$i$i>>2] = $120;
      $fd157$i$i = (($120) + 8|0);
      HEAP32[$fd157$i$i>>2] = $214;
      $bk158$i$i = (($120) + 12|0);
      HEAP32[$bk158$i$i>>2] = $T$0$lcssa$i$i;
      $parent159$i$i = (($120) + 24|0);
      HEAP32[$parent159$i$i>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $216 = HEAP32[((1344 + 12|0))>>2]|0;
  $cmp250$i = ($216>>>0)>($nb$0>>>0);
  if ($cmp250$i) {
   $sub253$i = (($216) - ($nb$0))|0;
   HEAP32[((1344 + 12|0))>>2] = $sub253$i;
   $217 = HEAP32[((1344 + 24|0))>>2]|0;
   $add$ptr255$i = (($217) + ($nb$0)|0);
   HEAP32[((1344 + 24|0))>>2] = $add$ptr255$i;
   $or257$i = $sub253$i | 1;
   $add$ptr255$sum$i = (($nb$0) + 4)|0;
   $head258$i = (($217) + ($add$ptr255$sum$i)|0);
   HEAP32[$head258$i>>2] = $or257$i;
   $or260$i = $nb$0 | 3;
   $head261$i = (($217) + 4|0);
   HEAP32[$head261$i>>2] = $or260$i;
   $add$ptr262$i = (($217) + 8|0);
   $mem$0 = $add$ptr262$i;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $call265$i = (___errno_location()|0);
 HEAP32[$call265$i>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phiZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
 var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $8 = 0;
 var $9 = 0, $F502$0 = 0, $I526$0 = 0, $I526$0$c = 0, $K575$0270 = 0, $R$0 = 0, $R$1 = 0, $R327$0 = 0, $R327$1 = 0, $RP$0 = 0, $RP355$0 = 0, $T$0$lcssa = 0, $T$0269 = 0, $add$ptr = 0, $add$ptr$sum = 0, $add$ptr$sum230 = 0, $add$ptr16 = 0, $add$ptr16$sum = 0, $add$ptr16$sum251 = 0, $add$ptr16$sum252 = 0;
 var $add$ptr16$sum253 = 0, $add$ptr16$sum254 = 0, $add$ptr16$sum255 = 0, $add$ptr16$sum256 = 0, $add$ptr16$sum257 = 0, $add$ptr16$sum258 = 0, $add$ptr257 = 0, $add$ptr477 = 0, $add$ptr490 = 0, $add$ptr6 = 0, $add$ptr6$sum = 0, $add$ptr6$sum232 = 0, $add$ptr6$sum233234 = 0, $add$ptr6$sum235 = 0, $add$ptr6$sum243 = 0, $add$ptr6$sum244 = 0, $add$ptr6$sum247248 = 0, $add$ptr6$sum249 = 0, $add17 = 0, $add243 = 0;
 var $add254 = 0, $add262 = 0, $add542 = 0, $add547 = 0, $add551 = 0, $add553 = 0, $add556 = 0, $and = 0, $and140 = 0, $and210 = 0, $and215 = 0, $and229 = 0, $and237 = 0, $and261 = 0, $and296 = 0, $and405 = 0, $and46 = 0, $and487 = 0, $and5 = 0, $and504 = 0;
 var $and537 = 0, $and541 = 0, $and546 = 0, $and555 = 0, $and566 = 0, $and584 = 0, $and584267 = 0, $and8 = 0, $arrayidx = 0, $arrayidx108 = 0, $arrayidx113 = 0, $arrayidx130 = 0, $arrayidx149 = 0, $arrayidx157 = 0, $arrayidx182 = 0, $arrayidx188 = 0, $arrayidx198 = 0, $arrayidx274 = 0, $arrayidx357 = 0, $arrayidx369 = 0;
 var $arrayidx374 = 0, $arrayidx395 = 0, $arrayidx414 = 0, $arrayidx422 = 0, $arrayidx449 = 0, $arrayidx455 = 0, $arrayidx465 = 0, $arrayidx501 = 0, $arrayidx501$sum$pre = 0, $arrayidx501$sum242 = 0, $arrayidx559 = 0, $arrayidx562 = 0, $arrayidx591 = 0, $arrayidx99 = 0, $bk = 0, $bk270 = 0, $bk281 = 0, $bk316 = 0, $bk328 = 0, $bk338 = 0;
 var $bk34 = 0, $bk521 = 0, $bk523 = 0, $bk572 = 0, $bk603 = 0, $bk620 = 0, $bk623 = 0, $bk66 = 0, $bk73 = 0, $bk82 = 0, $child = 0, $child$sum = 0, $child171 = 0, $child171$sum = 0, $child356 = 0, $child356$sum = 0, $child438 = 0, $child438$sum = 0, $cmp = 0, $cmp$i = 0;
 var $cmp1 = 0, $cmp100 = 0, $cmp104 = 0, $cmp109 = 0, $cmp114 = 0, $cmp118 = 0, $cmp127 = 0, $cmp13 = 0, $cmp131 = 0, $cmp143 = 0, $cmp150 = 0, $cmp162 = 0, $cmp165 = 0, $cmp173 = 0, $cmp176 = 0, $cmp18 = 0, $cmp189 = 0, $cmp192 = 0, $cmp2 = 0, $cmp211 = 0;
 var $cmp22 = 0, $cmp225 = 0, $cmp240 = 0, $cmp246 = 0, $cmp25 = 0, $cmp251 = 0, $cmp264 = 0, $cmp275 = 0, $cmp278 = 0, $cmp282 = 0, $cmp29 = 0, $cmp291 = 0, $cmp300 = 0, $cmp303 = 0, $cmp307 = 0, $cmp31 = 0, $cmp329 = 0, $cmp335 = 0, $cmp339 = 0, $cmp343 = 0;
 var $cmp35 = 0, $cmp358 = 0, $cmp363 = 0, $cmp370 = 0, $cmp375 = 0, $cmp381 = 0, $cmp390 = 0, $cmp396 = 0, $cmp408 = 0, $cmp415 = 0, $cmp42 = 0, $cmp427 = 0, $cmp430 = 0, $cmp440 = 0, $cmp443 = 0, $cmp456 = 0, $cmp459 = 0, $cmp479 = 0, $cmp494 = 0, $cmp50 = 0;
 var $cmp511 = 0, $cmp528 = 0, $cmp53 = 0, $cmp532 = 0, $cmp57 = 0, $cmp576 = 0, $cmp585 = 0, $cmp585268 = 0, $cmp593 = 0, $cmp597 = 0, $cmp610 = 0, $cmp613 = 0, $cmp628 = 0, $cmp74 = 0, $cmp80 = 0, $cmp83 = 0, $cmp87 = 0, $cond = 0, $cond263 = 0, $cond264 = 0;
 var $dec = 0, $fd = 0, $fd268 = 0, $fd306 = 0, $fd317$pre = 0, $fd317$pre$phiZ2D = 0, $fd333 = 0, $fd342 = 0, $fd522 = 0, $fd56 = 0, $fd573 = 0, $fd604 = 0, $fd609 = 0, $fd622 = 0, $fd67$pre = 0, $fd67$pre$phiZ2D = 0, $fd78 = 0, $fd86 = 0, $head = 0, $head209 = 0;
 var $head216 = 0, $head228 = 0, $head245 = 0, $head256 = 0, $head476 = 0, $head489 = 0, $head583 = 0, $head583266 = 0, $index = 0, $index394 = 0, $index560 = 0, $neg = 0, $neg139 = 0, $neg295 = 0, $neg404 = 0, $next4$i = 0, $or = 0, $or244 = 0, $or255 = 0, $or475 = 0;
 var $or488 = 0, $or508 = 0, $or570 = 0, $p$0 = 0, $parent = 0, $parent170 = 0, $parent183 = 0, $parent199 = 0, $parent326 = 0, $parent437 = 0, $parent450 = 0, $parent466 = 0, $parent571 = 0, $parent602 = 0, $parent624 = 0, $psize$0 = 0, $psize$1 = 0, $shl = 0, $shl138 = 0, $shl273 = 0;
 var $shl294 = 0, $shl403 = 0, $shl45 = 0, $shl500 = 0, $shl503 = 0, $shl538 = 0, $shl543 = 0, $shl549 = 0, $shl552 = 0, $shl565 = 0, $shl582 = 0, $shl592 = 0, $shr = 0, $shr263 = 0, $shr493 = 0, $shr527 = 0, $shr536 = 0, $shr540 = 0, $shr545 = 0, $shr550 = 0;
 var $shr554 = 0, $shr578 = 0, $shr588 = 0, $sp$0$i = 0, $sp$0$in$i = 0, $sub = 0, $sub539 = 0, $sub544 = 0, $sub548 = 0, $sub581 = 0, $tobool230 = 0, $tobool238 = 0, $tobool505 = 0, $tobool567 = 0, $tobool9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $cmp = ($mem|0)==(0|0);
 if ($cmp) {
  STACKTOP = sp;return;
 }
 $add$ptr = (($mem) + -8|0);
 $0 = HEAP32[((1344 + 16|0))>>2]|0;
 $cmp1 = ($add$ptr>>>0)<($0>>>0);
 if ($cmp1) {
  _abort();
  // unreachable;
 }
 $head = (($mem) + -4|0);
 $1 = HEAP32[$head>>2]|0;
 $and = $1 & 3;
 $cmp2 = ($and|0)==(1);
 if ($cmp2) {
  _abort();
  // unreachable;
 }
 $and5 = $1 & -8;
 $add$ptr$sum = (($and5) + -8)|0;
 $add$ptr6 = (($mem) + ($add$ptr$sum)|0);
 $and8 = $1 & 1;
 $tobool9 = ($and8|0)==(0);
 do {
  if ($tobool9) {
   $2 = HEAP32[$add$ptr>>2]|0;
   $cmp13 = ($and|0)==(0);
   if ($cmp13) {
    STACKTOP = sp;return;
   }
   $add$ptr$sum230 = (-8 - ($2))|0;
   $add$ptr16 = (($mem) + ($add$ptr$sum230)|0);
   $add17 = (($2) + ($and5))|0;
   $cmp18 = ($add$ptr16>>>0)<($0>>>0);
   if ($cmp18) {
    _abort();
    // unreachable;
   }
   $3 = HEAP32[((1344 + 20|0))>>2]|0;
   $cmp22 = ($add$ptr16|0)==($3|0);
   if ($cmp22) {
    $add$ptr6$sum = (($and5) + -4)|0;
    $head209 = (($mem) + ($add$ptr6$sum)|0);
    $28 = HEAP32[$head209>>2]|0;
    $and210 = $28 & 3;
    $cmp211 = ($and210|0)==(3);
    if (!($cmp211)) {
     $p$0 = $add$ptr16;$psize$0 = $add17;
     break;
    }
    HEAP32[((1344 + 8|0))>>2] = $add17;
    $29 = HEAP32[$head209>>2]|0;
    $and215 = $29 & -2;
    HEAP32[$head209>>2] = $and215;
    $or = $add17 | 1;
    $add$ptr16$sum = (($add$ptr$sum230) + 4)|0;
    $head216 = (($mem) + ($add$ptr16$sum)|0);
    HEAP32[$head216>>2] = $or;
    HEAP32[$add$ptr6>>2] = $add17;
    STACKTOP = sp;return;
   }
   $shr = $2 >>> 3;
   $cmp25 = ($2>>>0)<(256);
   if ($cmp25) {
    $add$ptr16$sum257 = (($add$ptr$sum230) + 8)|0;
    $fd = (($mem) + ($add$ptr16$sum257)|0);
    $4 = HEAP32[$fd>>2]|0;
    $add$ptr16$sum258 = (($add$ptr$sum230) + 12)|0;
    $bk = (($mem) + ($add$ptr16$sum258)|0);
    $5 = HEAP32[$bk>>2]|0;
    $shl = $shr << 1;
    $arrayidx = ((1344 + ($shl<<2)|0) + 40|0);
    $cmp29 = ($4|0)==($arrayidx|0);
    if (!($cmp29)) {
     $cmp31 = ($4>>>0)<($0>>>0);
     if ($cmp31) {
      _abort();
      // unreachable;
     }
     $bk34 = (($4) + 12|0);
     $6 = HEAP32[$bk34>>2]|0;
     $cmp35 = ($6|0)==($add$ptr16|0);
     if (!($cmp35)) {
      _abort();
      // unreachable;
     }
    }
    $cmp42 = ($5|0)==($4|0);
    if ($cmp42) {
     $shl45 = 1 << $shr;
     $neg = $shl45 ^ -1;
     $7 = HEAP32[1344>>2]|0;
     $and46 = $7 & $neg;
     HEAP32[1344>>2] = $and46;
     $p$0 = $add$ptr16;$psize$0 = $add17;
     break;
    }
    $cmp50 = ($5|0)==($arrayidx|0);
    if ($cmp50) {
     $fd67$pre = (($5) + 8|0);
     $fd67$pre$phiZ2D = $fd67$pre;
    } else {
     $cmp53 = ($5>>>0)<($0>>>0);
     if ($cmp53) {
      _abort();
      // unreachable;
     }
     $fd56 = (($5) + 8|0);
     $8 = HEAP32[$fd56>>2]|0;
     $cmp57 = ($8|0)==($add$ptr16|0);
     if ($cmp57) {
      $fd67$pre$phiZ2D = $fd56;
     } else {
      _abort();
      // unreachable;
     }
    }
    $bk66 = (($4) + 12|0);
    HEAP32[$bk66>>2] = $5;
    HEAP32[$fd67$pre$phiZ2D>>2] = $4;
    $p$0 = $add$ptr16;$psize$0 = $add17;
    break;
   }
   $add$ptr16$sum251 = (($add$ptr$sum230) + 24)|0;
   $parent = (($mem) + ($add$ptr16$sum251)|0);
   $9 = HEAP32[$parent>>2]|0;
   $add$ptr16$sum252 = (($add$ptr$sum230) + 12)|0;
   $bk73 = (($mem) + ($add$ptr16$sum252)|0);
   $10 = HEAP32[$bk73>>2]|0;
   $cmp74 = ($10|0)==($add$ptr16|0);
   do {
    if ($cmp74) {
     $child$sum = (($add$ptr$sum230) + 20)|0;
     $arrayidx99 = (($mem) + ($child$sum)|0);
     $14 = HEAP32[$arrayidx99>>2]|0;
     $cmp100 = ($14|0)==(0|0);
     if ($cmp100) {
      $add$ptr16$sum253 = (($add$ptr$sum230) + 16)|0;
      $child = (($mem) + ($add$ptr16$sum253)|0);
      $15 = HEAP32[$child>>2]|0;
      $cmp104 = ($15|0)==(0|0);
      if ($cmp104) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $15;$RP$0 = $child;
      }
     } else {
      $R$0 = $14;$RP$0 = $arrayidx99;
     }
     while(1) {
      $arrayidx108 = (($R$0) + 20|0);
      $16 = HEAP32[$arrayidx108>>2]|0;
      $cmp109 = ($16|0)==(0|0);
      if (!($cmp109)) {
       $R$0 = $16;$RP$0 = $arrayidx108;
       continue;
      }
      $arrayidx113 = (($R$0) + 16|0);
      $17 = HEAP32[$arrayidx113>>2]|0;
      $cmp114 = ($17|0)==(0|0);
      if ($cmp114) {
       break;
      } else {
       $R$0 = $17;$RP$0 = $arrayidx113;
      }
     }
     $cmp118 = ($RP$0>>>0)<($0>>>0);
     if ($cmp118) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $add$ptr16$sum256 = (($add$ptr$sum230) + 8)|0;
     $fd78 = (($mem) + ($add$ptr16$sum256)|0);
     $11 = HEAP32[$fd78>>2]|0;
     $cmp80 = ($11>>>0)<($0>>>0);
     if ($cmp80) {
      _abort();
      // unreachable;
     }
     $bk82 = (($11) + 12|0);
     $12 = HEAP32[$bk82>>2]|0;
     $cmp83 = ($12|0)==($add$ptr16|0);
     if (!($cmp83)) {
      _abort();
      // unreachable;
     }
     $fd86 = (($10) + 8|0);
     $13 = HEAP32[$fd86>>2]|0;
     $cmp87 = ($13|0)==($add$ptr16|0);
     if ($cmp87) {
      HEAP32[$bk82>>2] = $10;
      HEAP32[$fd86>>2] = $11;
      $R$1 = $10;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $cmp127 = ($9|0)==(0|0);
   if ($cmp127) {
    $p$0 = $add$ptr16;$psize$0 = $add17;
   } else {
    $add$ptr16$sum254 = (($add$ptr$sum230) + 28)|0;
    $index = (($mem) + ($add$ptr16$sum254)|0);
    $18 = HEAP32[$index>>2]|0;
    $arrayidx130 = ((1344 + ($18<<2)|0) + 304|0);
    $19 = HEAP32[$arrayidx130>>2]|0;
    $cmp131 = ($add$ptr16|0)==($19|0);
    if ($cmp131) {
     HEAP32[$arrayidx130>>2] = $R$1;
     $cond263 = ($R$1|0)==(0|0);
     if ($cond263) {
      $shl138 = 1 << $18;
      $neg139 = $shl138 ^ -1;
      $20 = HEAP32[((1344 + 4|0))>>2]|0;
      $and140 = $20 & $neg139;
      HEAP32[((1344 + 4|0))>>2] = $and140;
      $p$0 = $add$ptr16;$psize$0 = $add17;
      break;
     }
    } else {
     $21 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp143 = ($9>>>0)<($21>>>0);
     if ($cmp143) {
      _abort();
      // unreachable;
     }
     $arrayidx149 = (($9) + 16|0);
     $22 = HEAP32[$arrayidx149>>2]|0;
     $cmp150 = ($22|0)==($add$ptr16|0);
     if ($cmp150) {
      HEAP32[$arrayidx149>>2] = $R$1;
     } else {
      $arrayidx157 = (($9) + 20|0);
      HEAP32[$arrayidx157>>2] = $R$1;
     }
     $cmp162 = ($R$1|0)==(0|0);
     if ($cmp162) {
      $p$0 = $add$ptr16;$psize$0 = $add17;
      break;
     }
    }
    $23 = HEAP32[((1344 + 16|0))>>2]|0;
    $cmp165 = ($R$1>>>0)<($23>>>0);
    if ($cmp165) {
     _abort();
     // unreachable;
    }
    $parent170 = (($R$1) + 24|0);
    HEAP32[$parent170>>2] = $9;
    $add$ptr16$sum255 = (($add$ptr$sum230) + 16)|0;
    $child171 = (($mem) + ($add$ptr16$sum255)|0);
    $24 = HEAP32[$child171>>2]|0;
    $cmp173 = ($24|0)==(0|0);
    do {
     if (!($cmp173)) {
      $25 = HEAP32[((1344 + 16|0))>>2]|0;
      $cmp176 = ($24>>>0)<($25>>>0);
      if ($cmp176) {
       _abort();
       // unreachable;
      } else {
       $arrayidx182 = (($R$1) + 16|0);
       HEAP32[$arrayidx182>>2] = $24;
       $parent183 = (($24) + 24|0);
       HEAP32[$parent183>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $child171$sum = (($add$ptr$sum230) + 20)|0;
    $arrayidx188 = (($mem) + ($child171$sum)|0);
    $26 = HEAP32[$arrayidx188>>2]|0;
    $cmp189 = ($26|0)==(0|0);
    if ($cmp189) {
     $p$0 = $add$ptr16;$psize$0 = $add17;
    } else {
     $27 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp192 = ($26>>>0)<($27>>>0);
     if ($cmp192) {
      _abort();
      // unreachable;
     } else {
      $arrayidx198 = (($R$1) + 20|0);
      HEAP32[$arrayidx198>>2] = $26;
      $parent199 = (($26) + 24|0);
      HEAP32[$parent199>>2] = $R$1;
      $p$0 = $add$ptr16;$psize$0 = $add17;
      break;
     }
    }
   }
  } else {
   $p$0 = $add$ptr;$psize$0 = $and5;
  }
 } while(0);
 $cmp225 = ($p$0>>>0)<($add$ptr6>>>0);
 if (!($cmp225)) {
  _abort();
  // unreachable;
 }
 $add$ptr6$sum249 = (($and5) + -4)|0;
 $head228 = (($mem) + ($add$ptr6$sum249)|0);
 $30 = HEAP32[$head228>>2]|0;
 $and229 = $30 & 1;
 $tobool230 = ($and229|0)==(0);
 if ($tobool230) {
  _abort();
  // unreachable;
 }
 $and237 = $30 & 2;
 $tobool238 = ($and237|0)==(0);
 if ($tobool238) {
  $31 = HEAP32[((1344 + 24|0))>>2]|0;
  $cmp240 = ($add$ptr6|0)==($31|0);
  if ($cmp240) {
   $32 = HEAP32[((1344 + 12|0))>>2]|0;
   $add243 = (($32) + ($psize$0))|0;
   HEAP32[((1344 + 12|0))>>2] = $add243;
   HEAP32[((1344 + 24|0))>>2] = $p$0;
   $or244 = $add243 | 1;
   $head245 = (($p$0) + 4|0);
   HEAP32[$head245>>2] = $or244;
   $33 = HEAP32[((1344 + 20|0))>>2]|0;
   $cmp246 = ($p$0|0)==($33|0);
   if (!($cmp246)) {
    STACKTOP = sp;return;
   }
   HEAP32[((1344 + 20|0))>>2] = 0;
   HEAP32[((1344 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $34 = HEAP32[((1344 + 20|0))>>2]|0;
  $cmp251 = ($add$ptr6|0)==($34|0);
  if ($cmp251) {
   $35 = HEAP32[((1344 + 8|0))>>2]|0;
   $add254 = (($35) + ($psize$0))|0;
   HEAP32[((1344 + 8|0))>>2] = $add254;
   HEAP32[((1344 + 20|0))>>2] = $p$0;
   $or255 = $add254 | 1;
   $head256 = (($p$0) + 4|0);
   HEAP32[$head256>>2] = $or255;
   $add$ptr257 = (($p$0) + ($add254)|0);
   HEAP32[$add$ptr257>>2] = $add254;
   STACKTOP = sp;return;
  }
  $and261 = $30 & -8;
  $add262 = (($and261) + ($psize$0))|0;
  $shr263 = $30 >>> 3;
  $cmp264 = ($30>>>0)<(256);
  do {
   if ($cmp264) {
    $fd268 = (($mem) + ($and5)|0);
    $36 = HEAP32[$fd268>>2]|0;
    $add$ptr6$sum247248 = $and5 | 4;
    $bk270 = (($mem) + ($add$ptr6$sum247248)|0);
    $37 = HEAP32[$bk270>>2]|0;
    $shl273 = $shr263 << 1;
    $arrayidx274 = ((1344 + ($shl273<<2)|0) + 40|0);
    $cmp275 = ($36|0)==($arrayidx274|0);
    if (!($cmp275)) {
     $38 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp278 = ($36>>>0)<($38>>>0);
     if ($cmp278) {
      _abort();
      // unreachable;
     }
     $bk281 = (($36) + 12|0);
     $39 = HEAP32[$bk281>>2]|0;
     $cmp282 = ($39|0)==($add$ptr6|0);
     if (!($cmp282)) {
      _abort();
      // unreachable;
     }
    }
    $cmp291 = ($37|0)==($36|0);
    if ($cmp291) {
     $shl294 = 1 << $shr263;
     $neg295 = $shl294 ^ -1;
     $40 = HEAP32[1344>>2]|0;
     $and296 = $40 & $neg295;
     HEAP32[1344>>2] = $and296;
     break;
    }
    $cmp300 = ($37|0)==($arrayidx274|0);
    if ($cmp300) {
     $fd317$pre = (($37) + 8|0);
     $fd317$pre$phiZ2D = $fd317$pre;
    } else {
     $41 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp303 = ($37>>>0)<($41>>>0);
     if ($cmp303) {
      _abort();
      // unreachable;
     }
     $fd306 = (($37) + 8|0);
     $42 = HEAP32[$fd306>>2]|0;
     $cmp307 = ($42|0)==($add$ptr6|0);
     if ($cmp307) {
      $fd317$pre$phiZ2D = $fd306;
     } else {
      _abort();
      // unreachable;
     }
    }
    $bk316 = (($36) + 12|0);
    HEAP32[$bk316>>2] = $37;
    HEAP32[$fd317$pre$phiZ2D>>2] = $36;
   } else {
    $add$ptr6$sum232 = (($and5) + 16)|0;
    $parent326 = (($mem) + ($add$ptr6$sum232)|0);
    $43 = HEAP32[$parent326>>2]|0;
    $add$ptr6$sum233234 = $and5 | 4;
    $bk328 = (($mem) + ($add$ptr6$sum233234)|0);
    $44 = HEAP32[$bk328>>2]|0;
    $cmp329 = ($44|0)==($add$ptr6|0);
    do {
     if ($cmp329) {
      $child356$sum = (($and5) + 12)|0;
      $arrayidx357 = (($mem) + ($child356$sum)|0);
      $49 = HEAP32[$arrayidx357>>2]|0;
      $cmp358 = ($49|0)==(0|0);
      if ($cmp358) {
       $add$ptr6$sum235 = (($and5) + 8)|0;
       $child356 = (($mem) + ($add$ptr6$sum235)|0);
       $50 = HEAP32[$child356>>2]|0;
       $cmp363 = ($50|0)==(0|0);
       if ($cmp363) {
        $R327$1 = 0;
        break;
       } else {
        $R327$0 = $50;$RP355$0 = $child356;
       }
      } else {
       $R327$0 = $49;$RP355$0 = $arrayidx357;
      }
      while(1) {
       $arrayidx369 = (($R327$0) + 20|0);
       $51 = HEAP32[$arrayidx369>>2]|0;
       $cmp370 = ($51|0)==(0|0);
       if (!($cmp370)) {
        $R327$0 = $51;$RP355$0 = $arrayidx369;
        continue;
       }
       $arrayidx374 = (($R327$0) + 16|0);
       $52 = HEAP32[$arrayidx374>>2]|0;
       $cmp375 = ($52|0)==(0|0);
       if ($cmp375) {
        break;
       } else {
        $R327$0 = $52;$RP355$0 = $arrayidx374;
       }
      }
      $53 = HEAP32[((1344 + 16|0))>>2]|0;
      $cmp381 = ($RP355$0>>>0)<($53>>>0);
      if ($cmp381) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP355$0>>2] = 0;
       $R327$1 = $R327$0;
       break;
      }
     } else {
      $fd333 = (($mem) + ($and5)|0);
      $45 = HEAP32[$fd333>>2]|0;
      $46 = HEAP32[((1344 + 16|0))>>2]|0;
      $cmp335 = ($45>>>0)<($46>>>0);
      if ($cmp335) {
       _abort();
       // unreachable;
      }
      $bk338 = (($45) + 12|0);
      $47 = HEAP32[$bk338>>2]|0;
      $cmp339 = ($47|0)==($add$ptr6|0);
      if (!($cmp339)) {
       _abort();
       // unreachable;
      }
      $fd342 = (($44) + 8|0);
      $48 = HEAP32[$fd342>>2]|0;
      $cmp343 = ($48|0)==($add$ptr6|0);
      if ($cmp343) {
       HEAP32[$bk338>>2] = $44;
       HEAP32[$fd342>>2] = $45;
       $R327$1 = $44;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $cmp390 = ($43|0)==(0|0);
    if (!($cmp390)) {
     $add$ptr6$sum243 = (($and5) + 20)|0;
     $index394 = (($mem) + ($add$ptr6$sum243)|0);
     $54 = HEAP32[$index394>>2]|0;
     $arrayidx395 = ((1344 + ($54<<2)|0) + 304|0);
     $55 = HEAP32[$arrayidx395>>2]|0;
     $cmp396 = ($add$ptr6|0)==($55|0);
     if ($cmp396) {
      HEAP32[$arrayidx395>>2] = $R327$1;
      $cond264 = ($R327$1|0)==(0|0);
      if ($cond264) {
       $shl403 = 1 << $54;
       $neg404 = $shl403 ^ -1;
       $56 = HEAP32[((1344 + 4|0))>>2]|0;
       $and405 = $56 & $neg404;
       HEAP32[((1344 + 4|0))>>2] = $and405;
       break;
      }
     } else {
      $57 = HEAP32[((1344 + 16|0))>>2]|0;
      $cmp408 = ($43>>>0)<($57>>>0);
      if ($cmp408) {
       _abort();
       // unreachable;
      }
      $arrayidx414 = (($43) + 16|0);
      $58 = HEAP32[$arrayidx414>>2]|0;
      $cmp415 = ($58|0)==($add$ptr6|0);
      if ($cmp415) {
       HEAP32[$arrayidx414>>2] = $R327$1;
      } else {
       $arrayidx422 = (($43) + 20|0);
       HEAP32[$arrayidx422>>2] = $R327$1;
      }
      $cmp427 = ($R327$1|0)==(0|0);
      if ($cmp427) {
       break;
      }
     }
     $59 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp430 = ($R327$1>>>0)<($59>>>0);
     if ($cmp430) {
      _abort();
      // unreachable;
     }
     $parent437 = (($R327$1) + 24|0);
     HEAP32[$parent437>>2] = $43;
     $add$ptr6$sum244 = (($and5) + 8)|0;
     $child438 = (($mem) + ($add$ptr6$sum244)|0);
     $60 = HEAP32[$child438>>2]|0;
     $cmp440 = ($60|0)==(0|0);
     do {
      if (!($cmp440)) {
       $61 = HEAP32[((1344 + 16|0))>>2]|0;
       $cmp443 = ($60>>>0)<($61>>>0);
       if ($cmp443) {
        _abort();
        // unreachable;
       } else {
        $arrayidx449 = (($R327$1) + 16|0);
        HEAP32[$arrayidx449>>2] = $60;
        $parent450 = (($60) + 24|0);
        HEAP32[$parent450>>2] = $R327$1;
        break;
       }
      }
     } while(0);
     $child438$sum = (($and5) + 12)|0;
     $arrayidx455 = (($mem) + ($child438$sum)|0);
     $62 = HEAP32[$arrayidx455>>2]|0;
     $cmp456 = ($62|0)==(0|0);
     if (!($cmp456)) {
      $63 = HEAP32[((1344 + 16|0))>>2]|0;
      $cmp459 = ($62>>>0)<($63>>>0);
      if ($cmp459) {
       _abort();
       // unreachable;
      } else {
       $arrayidx465 = (($R327$1) + 20|0);
       HEAP32[$arrayidx465>>2] = $62;
       $parent466 = (($62) + 24|0);
       HEAP32[$parent466>>2] = $R327$1;
       break;
      }
     }
    }
   }
  } while(0);
  $or475 = $add262 | 1;
  $head476 = (($p$0) + 4|0);
  HEAP32[$head476>>2] = $or475;
  $add$ptr477 = (($p$0) + ($add262)|0);
  HEAP32[$add$ptr477>>2] = $add262;
  $64 = HEAP32[((1344 + 20|0))>>2]|0;
  $cmp479 = ($p$0|0)==($64|0);
  if ($cmp479) {
   HEAP32[((1344 + 8|0))>>2] = $add262;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $add262;
  }
 } else {
  $and487 = $30 & -2;
  HEAP32[$head228>>2] = $and487;
  $or488 = $psize$0 | 1;
  $head489 = (($p$0) + 4|0);
  HEAP32[$head489>>2] = $or488;
  $add$ptr490 = (($p$0) + ($psize$0)|0);
  HEAP32[$add$ptr490>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $shr493 = $psize$1 >>> 3;
 $cmp494 = ($psize$1>>>0)<(256);
 if ($cmp494) {
  $shl500 = $shr493 << 1;
  $arrayidx501 = ((1344 + ($shl500<<2)|0) + 40|0);
  $65 = HEAP32[1344>>2]|0;
  $shl503 = 1 << $shr493;
  $and504 = $65 & $shl503;
  $tobool505 = ($and504|0)==(0);
  if ($tobool505) {
   $or508 = $65 | $shl503;
   HEAP32[1344>>2] = $or508;
   $arrayidx501$sum$pre = (($shl500) + 2)|0;
   $$pre = ((1344 + ($arrayidx501$sum$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F502$0 = $arrayidx501;
  } else {
   $arrayidx501$sum242 = (($shl500) + 2)|0;
   $66 = ((1344 + ($arrayidx501$sum242<<2)|0) + 40|0);
   $67 = HEAP32[$66>>2]|0;
   $68 = HEAP32[((1344 + 16|0))>>2]|0;
   $cmp511 = ($67>>>0)<($68>>>0);
   if ($cmp511) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $66;$F502$0 = $67;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $bk521 = (($F502$0) + 12|0);
  HEAP32[$bk521>>2] = $p$0;
  $fd522 = (($p$0) + 8|0);
  HEAP32[$fd522>>2] = $F502$0;
  $bk523 = (($p$0) + 12|0);
  HEAP32[$bk523>>2] = $arrayidx501;
  STACKTOP = sp;return;
 }
 $shr527 = $psize$1 >>> 8;
 $cmp528 = ($shr527|0)==(0);
 if ($cmp528) {
  $I526$0 = 0;
 } else {
  $cmp532 = ($psize$1>>>0)>(16777215);
  if ($cmp532) {
   $I526$0 = 31;
  } else {
   $sub = (($shr527) + 1048320)|0;
   $shr536 = $sub >>> 16;
   $and537 = $shr536 & 8;
   $shl538 = $shr527 << $and537;
   $sub539 = (($shl538) + 520192)|0;
   $shr540 = $sub539 >>> 16;
   $and541 = $shr540 & 4;
   $add542 = $and541 | $and537;
   $shl543 = $shl538 << $and541;
   $sub544 = (($shl543) + 245760)|0;
   $shr545 = $sub544 >>> 16;
   $and546 = $shr545 & 2;
   $add547 = $add542 | $and546;
   $sub548 = (14 - ($add547))|0;
   $shl549 = $shl543 << $and546;
   $shr550 = $shl549 >>> 15;
   $add551 = (($sub548) + ($shr550))|0;
   $shl552 = $add551 << 1;
   $add553 = (($add551) + 7)|0;
   $shr554 = $psize$1 >>> $add553;
   $and555 = $shr554 & 1;
   $add556 = $and555 | $shl552;
   $I526$0 = $add556;
  }
 }
 $arrayidx559 = ((1344 + ($I526$0<<2)|0) + 304|0);
 $index560 = (($p$0) + 28|0);
 $I526$0$c = $I526$0;
 HEAP32[$index560>>2] = $I526$0$c;
 $arrayidx562 = (($p$0) + 20|0);
 HEAP32[$arrayidx562>>2] = 0;
 $69 = (($p$0) + 16|0);
 HEAP32[$69>>2] = 0;
 $70 = HEAP32[((1344 + 4|0))>>2]|0;
 $shl565 = 1 << $I526$0;
 $and566 = $70 & $shl565;
 $tobool567 = ($and566|0)==(0);
 L199: do {
  if ($tobool567) {
   $or570 = $70 | $shl565;
   HEAP32[((1344 + 4|0))>>2] = $or570;
   HEAP32[$arrayidx559>>2] = $p$0;
   $parent571 = (($p$0) + 24|0);
   HEAP32[$parent571>>2] = $arrayidx559;
   $bk572 = (($p$0) + 12|0);
   HEAP32[$bk572>>2] = $p$0;
   $fd573 = (($p$0) + 8|0);
   HEAP32[$fd573>>2] = $p$0;
  } else {
   $71 = HEAP32[$arrayidx559>>2]|0;
   $cmp576 = ($I526$0|0)==(31);
   if ($cmp576) {
    $cond = 0;
   } else {
    $shr578 = $I526$0 >>> 1;
    $sub581 = (25 - ($shr578))|0;
    $cond = $sub581;
   }
   $head583266 = (($71) + 4|0);
   $72 = HEAP32[$head583266>>2]|0;
   $and584267 = $72 & -8;
   $cmp585268 = ($and584267|0)==($psize$1|0);
   L204: do {
    if ($cmp585268) {
     $T$0$lcssa = $71;
    } else {
     $shl582 = $psize$1 << $cond;
     $K575$0270 = $shl582;$T$0269 = $71;
     while(1) {
      $shr588 = $K575$0270 >>> 31;
      $arrayidx591 = ((($T$0269) + ($shr588<<2)|0) + 16|0);
      $73 = HEAP32[$arrayidx591>>2]|0;
      $cmp593 = ($73|0)==(0|0);
      if ($cmp593) {
       break;
      }
      $shl592 = $K575$0270 << 1;
      $head583 = (($73) + 4|0);
      $74 = HEAP32[$head583>>2]|0;
      $and584 = $74 & -8;
      $cmp585 = ($and584|0)==($psize$1|0);
      if ($cmp585) {
       $T$0$lcssa = $73;
       break L204;
      } else {
       $K575$0270 = $shl592;$T$0269 = $73;
      }
     }
     $75 = HEAP32[((1344 + 16|0))>>2]|0;
     $cmp597 = ($arrayidx591>>>0)<($75>>>0);
     if ($cmp597) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$arrayidx591>>2] = $p$0;
      $parent602 = (($p$0) + 24|0);
      HEAP32[$parent602>>2] = $T$0269;
      $bk603 = (($p$0) + 12|0);
      HEAP32[$bk603>>2] = $p$0;
      $fd604 = (($p$0) + 8|0);
      HEAP32[$fd604>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $fd609 = (($T$0$lcssa) + 8|0);
   $76 = HEAP32[$fd609>>2]|0;
   $77 = HEAP32[((1344 + 16|0))>>2]|0;
   $cmp610 = ($T$0$lcssa>>>0)<($77>>>0);
   if ($cmp610) {
    _abort();
    // unreachable;
   }
   $cmp613 = ($76>>>0)<($77>>>0);
   if ($cmp613) {
    _abort();
    // unreachable;
   } else {
    $bk620 = (($76) + 12|0);
    HEAP32[$bk620>>2] = $p$0;
    HEAP32[$fd609>>2] = $p$0;
    $fd622 = (($p$0) + 8|0);
    HEAP32[$fd622>>2] = $76;
    $bk623 = (($p$0) + 12|0);
    HEAP32[$bk623>>2] = $T$0$lcssa;
    $parent624 = (($p$0) + 24|0);
    HEAP32[$parent624>>2] = 0;
    break;
   }
  }
 } while(0);
 $78 = HEAP32[((1344 + 32|0))>>2]|0;
 $dec = (($78) + -1)|0;
 HEAP32[((1344 + 32|0))>>2] = $dec;
 $cmp628 = ($dec|0)==(0);
 if ($cmp628) {
  $sp$0$in$i = ((1344 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $cmp$i = ($sp$0$i|0)==(0|0);
  $next4$i = (($sp$0$i) + 8|0);
  if ($cmp$i) {
   break;
  } else {
   $sp$0$in$i = $next4$i;
  }
 }
 HEAP32[((1344 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function _memcmp($vl,$vr,$n) {
 $vl = $vl|0;
 $vr = $vr|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $cmp = 0, $cond = 0, $conv5 = 0, $conv6 = 0, $dec = 0, $incdec$ptr = 0, $incdec$ptr3 = 0, $l$010 = 0, $n$addr$09 = 0, $r$011 = 0, $sub = 0, $tobool = 0, $tobool8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $tobool8 = ($n|0)==(0);
 if ($tobool8) {
  $cond = 0;
  STACKTOP = sp;return ($cond|0);
 } else {
  $l$010 = $vl;$n$addr$09 = $n;$r$011 = $vr;
 }
 while(1) {
  $0 = HEAP8[$l$010>>0]|0;
  $1 = HEAP8[$r$011>>0]|0;
  $cmp = ($0<<24>>24)==($1<<24>>24);
  if (!($cmp)) {
   break;
  }
  $dec = (($n$addr$09) + -1)|0;
  $incdec$ptr = (($l$010) + 1|0);
  $incdec$ptr3 = (($r$011) + 1|0);
  $tobool = ($dec|0)==(0);
  if ($tobool) {
   $cond = 0;
   label = 5;
   break;
  } else {
   $l$010 = $incdec$ptr;$n$addr$09 = $dec;$r$011 = $incdec$ptr3;
  }
 }
 if ((label|0) == 5) {
  STACKTOP = sp;return ($cond|0);
 }
 $conv5 = $0&255;
 $conv6 = $1&255;
 $sub = (($conv5) - ($conv6))|0;
 $cond = $sub;
 STACKTOP = sp;return ($cond|0);
}
function runPostSets() {
 
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _memcpy(dest, src, num) {

    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}

// EMSCRIPTEN_END_FUNCS

    

  // EMSCRIPTEN_END_FUNCS
  

    return { _strlen: _strlen, _free: _free, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _syrializer: _syrializer, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0 };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "min": Math_min, "_puts": _puts, "_fflush": _fflush, "__formatString": __formatString, "_fputc": _fputc, "_send": _send, "_pwrite": _pwrite, "_fputs": _fputs, "_abort": _abort, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_sbrk": _sbrk, "_printf": _printf, "_mkport": _mkport, "__reallyNegative": __reallyNegative, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_write": _write, "_fprintf": _fprintf, "_sysconf": _sysconf, "___errno_location": ___errno_location, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
  var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _syrializer = Module["_syrializer"] = asm["_syrializer"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
  
  Runtime.stackAlloc = asm['stackAlloc'];
  Runtime.stackSave = asm['stackSave'];
  Runtime.stackRestore = asm['stackRestore'];
  Runtime.setTempRet0 = asm['setTempRet0'];
  Runtime.getTempRet0 = asm['getTempRet0'];
  

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (typeof Module['locateFile'] === 'function') {
    memoryInitializer = Module['locateFile'](memoryInitializer);
  } else if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  if (Module['noExitRuntime']) {
    return;
  }

  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else
  if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



(function(window) {
    function intFromBytes(x, big_endian) {
        var val = 0;
        for (var i = 0; i < x.length; ++i) {

            if (big_endian) {
                val += x[i];
            } else {
                val += x[x.length - i - 1];
            }

            if (i < x.length - 1) {
                val = val << 8;
            }
        }
        return val;
    }

    function uint8ArrayToArrayBuffer(buffer) {
        var output = new ArrayBuffer(buffer.byteLength);
        for (var i = 0; i < buffer.byteLength; ++i) {
            output[i] = buffer[i];
        }
        return output;
    }

    var Syrialize = function(audio, num, callback) {
        syro = Module.cwrap(
            'syrializer', 'number', ['number', 'number', 'number', 'number']
        );

        var reader = new FileReader();

        reader.onload = function() {
            data = new Uint8Array(reader.result);

            console.log("data=", data);
            var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
            var dataPtr = Module._malloc(nDataBytes);

            HEAPU8.set(data, dataPtr);

            var size_dest_bytes = 4; // 32 unsigned is 4 bytes;
            var size_dest_ptr = Module._malloc(size_dest_bytes);

            var syralizedData = syro(dataPtr, size_dest_ptr, nDataBytes, num);

            var len = intFromBytes(HEAPU8.subarray(size_dest_ptr, size_dest_ptr + 4), false);

            var res = new Uint8Array(HEAPU8.subarray(syralizedData, syralizedData + len));

            this.audio = new Blob(new Array(res.buffer), {
                type: blob.type
            });

            callback(this.audio);
        };

        reader.readAsArrayBuffer(blob);
    }

    window.Syrialize = Syrialize;

})(window);
