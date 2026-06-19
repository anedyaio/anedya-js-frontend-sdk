"use strict";
var AnedyaSDK = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target2, all) => {
    for (var name in all)
      __defProp(target2, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // dist/index.mjs
  var index_exports = {};
  __export(index_exports, {
    Anedya: () => V,
    AnedyaDataType: () => X,
    AnedyaDeleteKeyReq: () => x,
    AnedyaDeleteKeyResp: () => S,
    AnedyaError: () => K,
    AnedyaGetDataReq: () => C,
    AnedyaGetDataResp: () => m,
    AnedyaGetDeviceStatusResp: () => A,
    AnedyaGetKeyReq: () => T,
    AnedyaGetKeyResp: () => b,
    AnedyaGetLatestDataResp: () => h,
    AnedyaGetSnapshotReq: () => E,
    AnedyaGetSnapshotResp: () => I,
    AnedyaScanKeysReq: () => k,
    AnedyaScanKeysResp: () => f,
    AnedyaScope: () => z,
    AnedyaSetKeyReq: () => N,
    AnedyaSetKeyResp: () => g,
    getAnedyaErrorMessage: () => j
  });

  // node_modules/cbor-x/decode.js
  var decoder;
  try {
    decoder = new TextDecoder();
  } catch (error) {
  }
  var src;
  var srcEnd;
  var position = 0;
  var EMPTY_ARRAY = [];
  var LEGACY_RECORD_INLINE_ID = 105;
  var RECORD_DEFINITIONS_ID = 57342;
  var RECORD_INLINE_ID = 57343;
  var BUNDLED_STRINGS_ID = 57337;
  var PACKED_REFERENCE_TAG_ID = 6;
  var STOP_CODE = {};
  var maxArraySize = 11281e4;
  var maxMapSize = 1681e4;
  var strings = EMPTY_ARRAY;
  var stringPosition = 0;
  var currentDecoder = {};
  var currentStructures;
  var srcString;
  var srcStringStart = 0;
  var srcStringEnd = 0;
  var bundledStrings;
  var referenceMap;
  var currentExtensions = [];
  var currentExtensionRanges = [];
  var packedValues;
  var dataView;
  var restoreMapsAsObject;
  var defaultOptions = {
    useRecords: false,
    mapsAsObjects: true
  };
  var sequentialMode = false;
  var inlineObjectReadThreshold = 2;
  try {
    new Function("");
  } catch (error) {
    inlineObjectReadThreshold = Infinity;
  }
  var Decoder = class _Decoder {
    constructor(options) {
      if (options) {
        if ((options.keyMap || options._keyMap) && !options.useRecords) {
          options.useRecords = false;
          options.mapsAsObjects = true;
        }
        if (options.useRecords === false && options.mapsAsObjects === void 0)
          options.mapsAsObjects = true;
        if (options.getStructures)
          options.getShared = options.getStructures;
        if (options.getShared && !options.structures)
          (options.structures = []).uninitialized = true;
        if (options.keyMap) {
          this.mapKey = /* @__PURE__ */ new Map();
          for (let [k2, v2] of Object.entries(options.keyMap)) this.mapKey.set(v2, k2);
        }
      }
      Object.assign(this, options);
    }
    /*
    decodeKey(key) {
    	return this.keyMap
    		? Object.keys(this.keyMap)[Object.values(this.keyMap).indexOf(key)] || key
    		: key
    }
    */
    decodeKey(key) {
      return this.keyMap ? this.mapKey.get(key) || key : key;
    }
    encodeKey(key) {
      return this.keyMap && this.keyMap.hasOwnProperty(key) ? this.keyMap[key] : key;
    }
    encodeKeys(rec) {
      if (!this._keyMap) return rec;
      let map = /* @__PURE__ */ new Map();
      for (let [k2, v2] of Object.entries(rec)) map.set(this._keyMap.hasOwnProperty(k2) ? this._keyMap[k2] : k2, v2);
      return map;
    }
    decodeKeys(map) {
      if (!this._keyMap || map.constructor.name != "Map") return map;
      if (!this._mapKey) {
        this._mapKey = /* @__PURE__ */ new Map();
        for (let [k2, v2] of Object.entries(this._keyMap)) this._mapKey.set(v2, k2);
      }
      let res = {};
      map.forEach((v2, k2) => res[safeKey(this._mapKey.has(k2) ? this._mapKey.get(k2) : k2)] = v2);
      return res;
    }
    mapDecode(source, end) {
      let res = this.decode(source);
      if (this._keyMap) {
        switch (res.constructor.name) {
          case "Array":
            return res.map((r) => this.decodeKeys(r));
        }
      }
      return res;
    }
    decode(source, end) {
      if (src) {
        return saveState(() => {
          clearSource();
          return this ? this.decode(source, end) : _Decoder.prototype.decode.call(defaultOptions, source, end);
        });
      }
      srcEnd = end > -1 ? end : source.length;
      position = 0;
      stringPosition = 0;
      srcStringEnd = 0;
      srcString = null;
      strings = EMPTY_ARRAY;
      bundledStrings = null;
      src = source;
      try {
        dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
      } catch (error) {
        src = null;
        if (source instanceof Uint8Array)
          throw error;
        throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
      }
      if (this instanceof _Decoder) {
        currentDecoder = this;
        packedValues = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues);
        if (this.structures) {
          currentStructures = this.structures;
          return checkedRead();
        } else if (!currentStructures || currentStructures.length > 0) {
          currentStructures = [];
        }
      } else {
        currentDecoder = defaultOptions;
        if (!currentStructures || currentStructures.length > 0)
          currentStructures = [];
        packedValues = null;
      }
      return checkedRead();
    }
    decodeMultiple(source, forEach) {
      let values, lastPosition = 0;
      try {
        let size = source.length;
        sequentialMode = true;
        let value = this ? this.decode(source, size) : defaultDecoder.decode(source, size);
        if (forEach) {
          if (forEach(value) === false) {
            return;
          }
          while (position < size) {
            lastPosition = position;
            if (forEach(checkedRead()) === false) {
              return;
            }
          }
        } else {
          values = [value];
          while (position < size) {
            lastPosition = position;
            values.push(checkedRead());
          }
          return values;
        }
      } catch (error) {
        error.lastPosition = lastPosition;
        error.values = values;
        throw error;
      } finally {
        sequentialMode = false;
        clearSource();
      }
    }
  };
  function checkedRead() {
    try {
      let result = read();
      if (bundledStrings) {
        if (position >= bundledStrings.postBundlePosition) {
          let error = new Error("Unexpected bundle position");
          error.incomplete = true;
          throw error;
        }
        position = bundledStrings.postBundlePosition;
        bundledStrings = null;
      }
      if (position == srcEnd) {
        currentStructures = null;
        src = null;
        if (referenceMap)
          referenceMap = null;
      } else if (position > srcEnd) {
        let error = new Error("Unexpected end of CBOR data");
        error.incomplete = true;
        throw error;
      } else if (!sequentialMode) {
        throw new Error("Data read, but end of buffer not reached");
      }
      return result;
    } catch (error) {
      clearSource();
      if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer")) {
        error.incomplete = true;
      }
      throw error;
    }
  }
  function read() {
    let token = src[position++];
    let majorType = token >> 5;
    token = token & 31;
    if (token > 23) {
      switch (token) {
        case 24:
          token = src[position++];
          break;
        case 25:
          if (majorType == 7) {
            return getFloat16();
          }
          token = dataView.getUint16(position);
          position += 2;
          break;
        case 26:
          if (majorType == 7) {
            let value = dataView.getFloat32(position);
            if (currentDecoder.useFloat32 > 2) {
              let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
              position += 4;
              return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
            }
            position += 4;
            return value;
          }
          token = dataView.getUint32(position);
          position += 4;
          if (majorType === 1) return -1 - token;
          break;
        case 27:
          if (majorType == 7) {
            let value = dataView.getFloat64(position);
            position += 8;
            return value;
          }
          if (majorType > 1) {
            if (dataView.getUint32(position) > 0)
              throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
            token = dataView.getUint32(position + 4);
          } else if (currentDecoder.int64AsNumber) {
            token = dataView.getUint32(position) * 4294967296;
            token += dataView.getUint32(position + 4);
          } else token = dataView.getBigUint64(position);
          position += 8;
          break;
        case 31:
          switch (majorType) {
            case 2:
            // byte string
            case 3:
              throw new Error("Indefinite length not supported for byte or text strings");
            case 4:
              let array = [];
              let value, i = 0;
              while ((value = read()) != STOP_CODE) {
                if (i >= maxArraySize) throw new Error(`Array length exceeds ${maxArraySize}`);
                array[i++] = value;
              }
              return majorType == 4 ? array : majorType == 3 ? array.join("") : Buffer.concat(array);
            case 5:
              let key;
              if (currentDecoder.mapsAsObjects) {
                let object = {};
                let i2 = 0;
                if (currentDecoder.keyMap) {
                  while ((key = read()) != STOP_CODE) {
                    if (i2++ >= maxMapSize) throw new Error(`Property count exceeds ${maxMapSize}`);
                    object[safeKey(currentDecoder.decodeKey(key))] = read();
                  }
                } else {
                  while ((key = read()) != STOP_CODE) {
                    if (i2++ >= maxMapSize) throw new Error(`Property count exceeds ${maxMapSize}`);
                    object[safeKey(key)] = read();
                  }
                }
                return object;
              } else {
                if (restoreMapsAsObject) {
                  currentDecoder.mapsAsObjects = true;
                  restoreMapsAsObject = false;
                }
                let map = /* @__PURE__ */ new Map();
                if (currentDecoder.keyMap) {
                  let i2 = 0;
                  while ((key = read()) != STOP_CODE) {
                    if (i2++ >= maxMapSize) {
                      throw new Error(`Map size exceeds ${maxMapSize}`);
                    }
                    map.set(currentDecoder.decodeKey(key), read());
                  }
                } else {
                  let i2 = 0;
                  while ((key = read()) != STOP_CODE) {
                    if (i2++ >= maxMapSize) {
                      throw new Error(`Map size exceeds ${maxMapSize}`);
                    }
                    map.set(key, read());
                  }
                }
                return map;
              }
            case 7:
              return STOP_CODE;
            default:
              throw new Error("Invalid major type for indefinite length " + majorType);
          }
        default:
          throw new Error("Unknown token " + token);
      }
    }
    switch (majorType) {
      case 0:
        return token;
      case 1:
        return ~token;
      case 2:
        return readBin(token);
      case 3:
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += token) - srcStringStart);
        }
        if (srcStringEnd == 0 && srcEnd < 140 && token < 32) {
          let string = token < 16 ? shortStringInJS(token) : longStringInJS(token);
          if (string != null)
            return string;
        }
        return readFixedString(token);
      case 4:
        if (token >= maxArraySize) throw new Error(`Array length exceeds ${maxArraySize}`);
        let array = new Array(token);
        for (let i = 0; i < token; i++) array[i] = read();
        return array;
      case 5:
        if (token >= maxMapSize) throw new Error(`Map size exceeds ${maxArraySize}`);
        if (currentDecoder.mapsAsObjects) {
          let object = {};
          if (currentDecoder.keyMap) for (let i = 0; i < token; i++) object[safeKey(currentDecoder.decodeKey(read()))] = read();
          else for (let i = 0; i < token; i++) object[safeKey(read())] = read();
          return object;
        } else {
          if (restoreMapsAsObject) {
            currentDecoder.mapsAsObjects = true;
            restoreMapsAsObject = false;
          }
          let map = /* @__PURE__ */ new Map();
          if (currentDecoder.keyMap) for (let i = 0; i < token; i++) map.set(currentDecoder.decodeKey(read()), read());
          else for (let i = 0; i < token; i++) map.set(read(), read());
          return map;
        }
      case 6:
        if (token >= BUNDLED_STRINGS_ID) {
          let structure = currentStructures[token & 8191];
          if (structure) {
            if (!structure.read) structure.read = createStructureReader(structure);
            return structure.read();
          }
          if (token < 65536) {
            if (token == RECORD_INLINE_ID) {
              let length = readJustLength();
              let id = read();
              let structure2 = read();
              recordDefinition(id, structure2);
              let object = {};
              if (currentDecoder.keyMap) for (let i = 2; i < length; i++) {
                let key = currentDecoder.decodeKey(structure2[i - 2]);
                object[safeKey(key)] = read();
              }
              else for (let i = 2; i < length; i++) {
                let key = structure2[i - 2];
                object[safeKey(key)] = read();
              }
              return object;
            } else if (token == RECORD_DEFINITIONS_ID) {
              let length = readJustLength();
              let id = read();
              for (let i = 2; i < length; i++) {
                recordDefinition(id++, read());
              }
              return read();
            } else if (token == BUNDLED_STRINGS_ID) {
              return readBundleExt();
            }
            if (currentDecoder.getShared) {
              loadShared();
              structure = currentStructures[token & 8191];
              if (structure) {
                if (!structure.read)
                  structure.read = createStructureReader(structure);
                return structure.read();
              }
            }
          }
        }
        let extension = currentExtensions[token];
        if (extension) {
          if (extension.handlesRead)
            return extension(read);
          else
            return extension(read());
        } else {
          let input = read();
          for (let i = 0; i < currentExtensionRanges.length; i++) {
            let value = currentExtensionRanges[i](token, input);
            if (value !== void 0)
              return value;
          }
          return new Tag(input, token);
        }
      case 7:
        switch (token) {
          case 20:
            return false;
          case 21:
            return true;
          case 22:
            return null;
          case 23:
            return;
          // undefined
          case 31:
          default:
            let packedValue = (packedValues || getPackedValues())[token];
            if (packedValue !== void 0)
              return packedValue;
            throw new Error("Unknown token " + token);
        }
      default:
        if (isNaN(token)) {
          let error = new Error("Unexpected end of CBOR data");
          error.incomplete = true;
          throw error;
        }
        throw new Error("Unknown CBOR token " + token);
    }
  }
  var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
  function createStructureReader(structure) {
    if (!structure) throw new Error("Structure is required in record definition");
    function readObject() {
      let length = src[position++];
      length = length & 31;
      if (length > 23) {
        switch (length) {
          case 24:
            length = src[position++];
            break;
          case 25:
            length = dataView.getUint16(position);
            position += 2;
            break;
          case 26:
            length = dataView.getUint32(position);
            position += 4;
            break;
          default:
            throw new Error("Expected array header, but got " + src[position - 1]);
        }
      }
      let compiledReader = this.compiledReader;
      while (compiledReader) {
        if (compiledReader.propertyCount === length)
          return compiledReader(read);
        compiledReader = compiledReader.next;
      }
      if (this.slowReads++ >= inlineObjectReadThreshold) {
        let array = this.length == length ? this : this.slice(0, length);
        compiledReader = currentDecoder.keyMap ? new Function("r", "return {" + array.map((k2) => currentDecoder.decodeKey(k2)).map((k2) => validName.test(k2) ? safeKey(k2) + ":r()" : "[" + JSON.stringify(k2) + "]:r()").join(",") + "}") : new Function("r", "return {" + array.map((key) => validName.test(key) ? safeKey(key) + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "}");
        if (this.compiledReader)
          compiledReader.next = this.compiledReader;
        compiledReader.propertyCount = length;
        this.compiledReader = compiledReader;
        return compiledReader(read);
      }
      let object = {};
      if (currentDecoder.keyMap) for (let i = 0; i < length; i++) object[safeKey(currentDecoder.decodeKey(this[i]))] = read();
      else for (let i = 0; i < length; i++) {
        object[safeKey(this[i])] = read();
      }
      return object;
    }
    structure.slowReads = 0;
    return readObject;
  }
  function safeKey(key) {
    if (typeof key === "string") return key === "__proto__" ? "__proto_" : key;
    if (typeof key === "number" || typeof key === "boolean" || typeof key === "bigint") return key.toString();
    if (key == null) return key + "";
    throw new Error("Invalid property name type " + typeof key);
  }
  var readFixedString = readStringJS;
  function readStringJS(length) {
    let result;
    if (length < 16) {
      if (result = shortStringInJS(length))
        return result;
    }
    if (length > 64 && decoder)
      return decoder.decode(src.subarray(position, position += length));
    const end = position + length;
    const units = [];
    result = "";
    while (position < end) {
      const byte1 = src[position++];
      if ((byte1 & 128) === 0) {
        units.push(byte1);
      } else if ((byte1 & 224) === 192) {
        const byte2 = src[position++] & 63;
        const codePoint = (byte1 & 31) << 6 | byte2;
        if (codePoint < 128) {
          units.push(65533);
        } else {
          units.push(codePoint);
        }
      } else if ((byte1 & 240) === 224) {
        const byte2 = src[position++] & 63;
        const byte3 = src[position++] & 63;
        const codePoint = (byte1 & 31) << 12 | byte2 << 6 | byte3;
        if (codePoint < 2048 || codePoint >= 55296 && codePoint <= 57343) {
          units.push(65533);
        } else {
          units.push(codePoint);
        }
      } else if ((byte1 & 248) === 240) {
        const byte2 = src[position++] & 63;
        const byte3 = src[position++] & 63;
        const byte4 = src[position++] & 63;
        let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
        if (unit < 65536 || unit > 1114111) {
          units.push(65533);
        } else if (unit > 65535) {
          unit -= 65536;
          units.push(unit >>> 10 & 1023 | 55296);
          unit = 56320 | unit & 1023;
          units.push(unit);
        } else {
          units.push(unit);
        }
      } else {
        units.push(65533);
      }
      if (units.length >= 4096) {
        result += fromCharCode.apply(String, units);
        units.length = 0;
      }
    }
    if (units.length > 0) {
      result += fromCharCode.apply(String, units);
    }
    return result;
  }
  var fromCharCode = String.fromCharCode;
  function longStringInJS(length) {
    let start = position;
    let bytes = new Array(length);
    for (let i = 0; i < length; i++) {
      const byte = src[position++];
      if ((byte & 128) > 0) {
        position = start;
        return;
      }
      bytes[i] = byte;
    }
    return fromCharCode.apply(String, bytes);
  }
  function shortStringInJS(length) {
    if (length < 4) {
      if (length < 2) {
        if (length === 0)
          return "";
        else {
          let a = src[position++];
          if ((a & 128) > 1) {
            position -= 1;
            return;
          }
          return fromCharCode(a);
        }
      } else {
        let a = src[position++];
        let b2 = src[position++];
        if ((a & 128) > 0 || (b2 & 128) > 0) {
          position -= 2;
          return;
        }
        if (length < 3)
          return fromCharCode(a, b2);
        let c = src[position++];
        if ((c & 128) > 0) {
          position -= 3;
          return;
        }
        return fromCharCode(a, b2, c);
      }
    } else {
      let a = src[position++];
      let b2 = src[position++];
      let c = src[position++];
      let d = src[position++];
      if ((a & 128) > 0 || (b2 & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
        position -= 4;
        return;
      }
      if (length < 6) {
        if (length === 4)
          return fromCharCode(a, b2, c, d);
        else {
          let e = src[position++];
          if ((e & 128) > 0) {
            position -= 5;
            return;
          }
          return fromCharCode(a, b2, c, d, e);
        }
      } else if (length < 8) {
        let e = src[position++];
        let f2 = src[position++];
        if ((e & 128) > 0 || (f2 & 128) > 0) {
          position -= 6;
          return;
        }
        if (length < 7)
          return fromCharCode(a, b2, c, d, e, f2);
        let g2 = src[position++];
        if ((g2 & 128) > 0) {
          position -= 7;
          return;
        }
        return fromCharCode(a, b2, c, d, e, f2, g2);
      } else {
        let e = src[position++];
        let f2 = src[position++];
        let g2 = src[position++];
        let h2 = src[position++];
        if ((e & 128) > 0 || (f2 & 128) > 0 || (g2 & 128) > 0 || (h2 & 128) > 0) {
          position -= 8;
          return;
        }
        if (length < 10) {
          if (length === 8)
            return fromCharCode(a, b2, c, d, e, f2, g2, h2);
          else {
            let i = src[position++];
            if ((i & 128) > 0) {
              position -= 9;
              return;
            }
            return fromCharCode(a, b2, c, d, e, f2, g2, h2, i);
          }
        } else if (length < 12) {
          let i = src[position++];
          let j2 = src[position++];
          if ((i & 128) > 0 || (j2 & 128) > 0) {
            position -= 10;
            return;
          }
          if (length < 11)
            return fromCharCode(a, b2, c, d, e, f2, g2, h2, i, j2);
          let k2 = src[position++];
          if ((k2 & 128) > 0) {
            position -= 11;
            return;
          }
          return fromCharCode(a, b2, c, d, e, f2, g2, h2, i, j2, k2);
        } else {
          let i = src[position++];
          let j2 = src[position++];
          let k2 = src[position++];
          let l = src[position++];
          if ((i & 128) > 0 || (j2 & 128) > 0 || (k2 & 128) > 0 || (l & 128) > 0) {
            position -= 12;
            return;
          }
          if (length < 14) {
            if (length === 12)
              return fromCharCode(a, b2, c, d, e, f2, g2, h2, i, j2, k2, l);
            else {
              let m2 = src[position++];
              if ((m2 & 128) > 0) {
                position -= 13;
                return;
              }
              return fromCharCode(a, b2, c, d, e, f2, g2, h2, i, j2, k2, l, m2);
            }
          } else {
            let m2 = src[position++];
            let n = src[position++];
            if ((m2 & 128) > 0 || (n & 128) > 0) {
              position -= 14;
              return;
            }
            if (length < 15)
              return fromCharCode(a, b2, c, d, e, f2, g2, h2, i, j2, k2, l, m2, n);
            let o = src[position++];
            if ((o & 128) > 0) {
              position -= 15;
              return;
            }
            return fromCharCode(a, b2, c, d, e, f2, g2, h2, i, j2, k2, l, m2, n, o);
          }
        }
      }
    }
  }
  function readBin(length) {
    return currentDecoder.copyBuffers ? (
      // specifically use the copying slice (not the node one)
      Uint8Array.prototype.slice.call(src, position, position += length)
    ) : src.subarray(position, position += length);
  }
  var f32Array = new Float32Array(1);
  var u8Array = new Uint8Array(f32Array.buffer, 0, 4);
  function getFloat16() {
    let byte0 = src[position++];
    let byte1 = src[position++];
    let exponent = (byte0 & 127) >> 2;
    if (exponent === 31) {
      if (byte1 || byte0 & 3)
        return NaN;
      return byte0 & 128 ? -Infinity : Infinity;
    }
    if (exponent === 0) {
      let abs = ((byte0 & 3) << 8 | byte1) / (1 << 24);
      return byte0 & 128 ? -abs : abs;
    }
    u8Array[3] = byte0 & 128 | // sign bit
    (exponent >> 1) + 56;
    u8Array[2] = (byte0 & 7) << 5 | // last exponent bit and first two mantissa bits
    byte1 >> 3;
    u8Array[1] = byte1 << 5;
    u8Array[0] = 0;
    return f32Array[0];
  }
  var keyCache = new Array(4096);
  var Tag = class {
    constructor(value, tag) {
      this.value = value;
      this.tag = tag;
    }
  };
  currentExtensions[0] = (dateString) => {
    return new Date(dateString);
  };
  currentExtensions[1] = (epochSec) => {
    return new Date(Math.round(epochSec * 1e3));
  };
  currentExtensions[2] = (buffer) => {
    let value = BigInt(0);
    for (let i = 0, l = buffer.byteLength; i < l; i++) {
      value = BigInt(buffer[i]) + (value << BigInt(8));
    }
    return value;
  };
  currentExtensions[3] = (buffer) => {
    return BigInt(-1) - currentExtensions[2](buffer);
  };
  currentExtensions[4] = (fraction) => {
    return +(fraction[1] + "e" + fraction[0]);
  };
  currentExtensions[5] = (fraction) => {
    return fraction[1] * Math.exp(fraction[0] * Math.log(2));
  };
  var recordDefinition = (id, structure) => {
    id = id - 57344;
    let existingStructure = currentStructures[id];
    if (existingStructure && existingStructure.isShared) {
      (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
    }
    currentStructures[id] = structure;
    structure.read = createStructureReader(structure);
  };
  currentExtensions[LEGACY_RECORD_INLINE_ID] = (data) => {
    let length = data.length;
    let structure = data[1];
    recordDefinition(data[0], structure);
    let object = {};
    for (let i = 2; i < length; i++) {
      let key = structure[i - 2];
      object[safeKey(key)] = data[i];
    }
    return object;
  };
  currentExtensions[14] = (value) => {
    if (bundledStrings)
      return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 += value);
    return new Tag(value, 14);
  };
  currentExtensions[15] = (value) => {
    if (bundledStrings)
      return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
    return new Tag(value, 15);
  };
  var glbl = { Error, RegExp };
  currentExtensions[27] = (data) => {
    return (glbl[data[0]] || Error)(data[1], data[2]);
  };
  var packedTable = (read2) => {
    if (src[position++] != 132) {
      let error = new Error("Packed values structure must be followed by a 4 element array");
      if (src.length < position)
        error.incomplete = true;
      throw error;
    }
    let newPackedValues = read2();
    if (!newPackedValues || !newPackedValues.length) {
      let error = new Error("Packed values structure must be followed by a 4 element array");
      error.incomplete = true;
      throw error;
    }
    packedValues = packedValues ? newPackedValues.concat(packedValues.slice(newPackedValues.length)) : newPackedValues;
    packedValues.prefixes = read2();
    packedValues.suffixes = read2();
    return read2();
  };
  packedTable.handlesRead = true;
  currentExtensions[51] = packedTable;
  currentExtensions[PACKED_REFERENCE_TAG_ID] = (data) => {
    if (!packedValues) {
      if (currentDecoder.getShared)
        loadShared();
      else
        return new Tag(data, PACKED_REFERENCE_TAG_ID);
    }
    if (typeof data == "number")
      return packedValues[16 + (data >= 0 ? 2 * data : -2 * data - 1)];
    let error = new Error("No support for non-integer packed references yet");
    if (data === void 0)
      error.incomplete = true;
    throw error;
  };
  currentExtensions[28] = (read2) => {
    if (!referenceMap) {
      referenceMap = /* @__PURE__ */ new Map();
      referenceMap.id = 0;
    }
    let id = referenceMap.id++;
    let startingPosition = position;
    let token = src[position];
    let target2;
    if (token >> 5 == 4)
      target2 = [];
    else
      target2 = {};
    let refEntry = { target: target2 };
    referenceMap.set(id, refEntry);
    let targetProperties = read2();
    if (refEntry.used) {
      if (Object.getPrototypeOf(target2) !== Object.getPrototypeOf(targetProperties)) {
        position = startingPosition;
        target2 = targetProperties;
        referenceMap.set(id, { target: target2 });
        targetProperties = read2();
      }
      return Object.assign(target2, targetProperties);
    }
    refEntry.target = targetProperties;
    return targetProperties;
  };
  currentExtensions[28].handlesRead = true;
  currentExtensions[29] = (id) => {
    let refEntry = referenceMap.get(id);
    refEntry.used = true;
    return refEntry.target;
  };
  currentExtensions[258] = (array) => new Set(array);
  (currentExtensions[259] = (read2) => {
    if (currentDecoder.mapsAsObjects) {
      currentDecoder.mapsAsObjects = false;
      restoreMapsAsObject = true;
    }
    return read2();
  }).handlesRead = true;
  function combine(a, b2) {
    if (typeof a === "string")
      return a + b2;
    if (a instanceof Array)
      return a.concat(b2);
    return Object.assign({}, a, b2);
  }
  function getPackedValues() {
    if (!packedValues) {
      if (currentDecoder.getShared)
        loadShared();
      else
        throw new Error("No packed values available");
    }
    return packedValues;
  }
  var SHARED_DATA_TAG_ID = 1399353956;
  currentExtensionRanges.push((tag, input) => {
    if (tag >= 225 && tag <= 255)
      return combine(getPackedValues().prefixes[tag - 224], input);
    if (tag >= 28704 && tag <= 32767)
      return combine(getPackedValues().prefixes[tag - 28672], input);
    if (tag >= 1879052288 && tag <= 2147483647)
      return combine(getPackedValues().prefixes[tag - 1879048192], input);
    if (tag >= 216 && tag <= 223)
      return combine(input, getPackedValues().suffixes[tag - 216]);
    if (tag >= 27647 && tag <= 28671)
      return combine(input, getPackedValues().suffixes[tag - 27639]);
    if (tag >= 1811940352 && tag <= 1879048191)
      return combine(input, getPackedValues().suffixes[tag - 1811939328]);
    if (tag == SHARED_DATA_TAG_ID) {
      return {
        packedValues,
        structures: currentStructures.slice(0),
        version: input
      };
    }
    if (tag == 55799)
      return input;
  });
  var isLittleEndianMachine = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
  var typedArrays = [
    Uint8Array,
    Uint8ClampedArray,
    Uint16Array,
    Uint32Array,
    typeof BigUint64Array == "undefined" ? { name: "BigUint64Array" } : BigUint64Array,
    Int8Array,
    Int16Array,
    Int32Array,
    typeof BigInt64Array == "undefined" ? { name: "BigInt64Array" } : BigInt64Array,
    Float32Array,
    Float64Array
  ];
  var typedArrayTags = [64, 68, 69, 70, 71, 72, 77, 78, 79, 85, 86];
  for (let i = 0; i < typedArrays.length; i++) {
    registerTypedArray(typedArrays[i], typedArrayTags[i]);
  }
  function registerTypedArray(TypedArray, tag) {
    let dvMethod = "get" + TypedArray.name.slice(0, -5);
    let bytesPerElement;
    if (typeof TypedArray === "function")
      bytesPerElement = TypedArray.BYTES_PER_ELEMENT;
    else
      TypedArray = null;
    for (let littleEndian = 0; littleEndian < 2; littleEndian++) {
      if (!littleEndian && bytesPerElement == 1)
        continue;
      let sizeShift = bytesPerElement == 2 ? 1 : bytesPerElement == 4 ? 2 : bytesPerElement == 8 ? 3 : 0;
      currentExtensions[littleEndian ? tag : tag - 4] = bytesPerElement == 1 || littleEndian == isLittleEndianMachine ? (buffer) => {
        if (!TypedArray)
          throw new Error("Could not find typed array for code " + tag);
        if (!currentDecoder.copyBuffers) {
          if (bytesPerElement === 1 || bytesPerElement === 2 && !(buffer.byteOffset & 1) || bytesPerElement === 4 && !(buffer.byteOffset & 3) || bytesPerElement === 8 && !(buffer.byteOffset & 7))
            return new TypedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength >> sizeShift);
        }
        return new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer);
      } : (buffer) => {
        if (!TypedArray)
          throw new Error("Could not find typed array for code " + tag);
        let dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        let elements = buffer.length >> sizeShift;
        let ta = new TypedArray(elements);
        let method = dv[dvMethod];
        for (let i = 0; i < elements; i++) {
          ta[i] = method.call(dv, i << sizeShift, littleEndian);
        }
        return ta;
      };
    }
  }
  function readBundleExt() {
    let length = readJustLength();
    let bundlePosition = position + read();
    for (let i = 2; i < length; i++) {
      let bundleLength = readJustLength();
      position += bundleLength;
    }
    let dataPosition = position;
    position = bundlePosition;
    bundledStrings = [readStringJS(readJustLength()), readStringJS(readJustLength())];
    bundledStrings.position0 = 0;
    bundledStrings.position1 = 0;
    bundledStrings.postBundlePosition = position;
    position = dataPosition;
    return read();
  }
  function readJustLength() {
    let token = src[position++] & 31;
    if (token > 23) {
      switch (token) {
        case 24:
          token = src[position++];
          break;
        case 25:
          token = dataView.getUint16(position);
          position += 2;
          break;
        case 26:
          token = dataView.getUint32(position);
          position += 4;
          break;
      }
    }
    return token;
  }
  function loadShared() {
    if (currentDecoder.getShared) {
      let sharedData = saveState(() => {
        src = null;
        return currentDecoder.getShared();
      }) || {};
      let updatedStructures = sharedData.structures || [];
      currentDecoder.sharedVersion = sharedData.version;
      packedValues = currentDecoder.sharedValues = sharedData.packedValues;
      if (currentStructures === true)
        currentDecoder.structures = currentStructures = updatedStructures;
      else
        currentStructures.splice.apply(currentStructures, [0, updatedStructures.length].concat(updatedStructures));
    }
  }
  function saveState(callback) {
    let savedSrcEnd = srcEnd;
    let savedPosition = position;
    let savedStringPosition = stringPosition;
    let savedSrcStringStart = srcStringStart;
    let savedSrcStringEnd = srcStringEnd;
    let savedSrcString = srcString;
    let savedStrings = strings;
    let savedReferenceMap = referenceMap;
    let savedBundledStrings = bundledStrings;
    let savedSrc = new Uint8Array(src.slice(0, srcEnd));
    let savedStructures = currentStructures;
    let savedDecoder = currentDecoder;
    let savedSequentialMode = sequentialMode;
    let value = callback();
    srcEnd = savedSrcEnd;
    position = savedPosition;
    stringPosition = savedStringPosition;
    srcStringStart = savedSrcStringStart;
    srcStringEnd = savedSrcStringEnd;
    srcString = savedSrcString;
    strings = savedStrings;
    referenceMap = savedReferenceMap;
    bundledStrings = savedBundledStrings;
    src = savedSrc;
    sequentialMode = savedSequentialMode;
    currentStructures = savedStructures;
    currentDecoder = savedDecoder;
    dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
    return value;
  }
  function clearSource() {
    src = null;
    referenceMap = null;
    currentStructures = null;
  }
  var mult10 = new Array(147);
  for (let i = 0; i < 256; i++) {
    mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
  }
  var defaultDecoder = new Decoder({ useRecords: false });
  var decode = defaultDecoder.decode;
  var decodeMultiple = defaultDecoder.decodeMultiple;
  var FLOAT32_OPTIONS = {
    NEVER: 0,
    ALWAYS: 1,
    DECIMAL_ROUND: 3,
    DECIMAL_FIT: 4
  };

  // node_modules/cbor-x/encode.js
  var textEncoder;
  try {
    textEncoder = new TextEncoder();
  } catch (error) {
  }
  var extensions;
  var extensionClasses;
  var Buffer2 = typeof globalThis === "object" && globalThis.Buffer;
  var hasNodeBuffer = typeof Buffer2 !== "undefined";
  var ByteArrayAllocate = hasNodeBuffer ? Buffer2.allocUnsafeSlow : Uint8Array;
  var ByteArray = hasNodeBuffer ? Buffer2 : Uint8Array;
  var MAX_STRUCTURES = 256;
  var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
  var throwOnIterable;
  var target;
  var targetView;
  var position2 = 0;
  var safeEnd;
  var bundledStrings2 = null;
  var MAX_BUNDLE_SIZE = 61440;
  var hasNonLatin = /[\u0080-\uFFFF]/;
  var RECORD_SYMBOL = Symbol("record-id");
  var Encoder = class extends Decoder {
    constructor(options) {
      super(options);
      this.offset = 0;
      let typeBuffer;
      let start;
      let sharedStructures;
      let hasSharedUpdate;
      let structures;
      let referenceMap2;
      options = options || {};
      let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3) {
        return target.utf8Write(string, position3, target.byteLength - position3);
      } : textEncoder && textEncoder.encodeInto ? function(string, position3) {
        return textEncoder.encodeInto(string, target.subarray(position3)).written;
      } : false;
      let encoder = this;
      let hasSharedStructures = options.structures || options.saveStructures;
      let maxSharedStructures = options.maxSharedStructures;
      if (maxSharedStructures == null)
        maxSharedStructures = hasSharedStructures ? 128 : 0;
      if (maxSharedStructures > 8190)
        throw new Error("Maximum maxSharedStructure is 8190");
      let isSequential = options.sequential;
      if (isSequential) {
        maxSharedStructures = 0;
      }
      if (!this.structures)
        this.structures = [];
      if (this.saveStructures)
        this.saveShared = this.saveStructures;
      let samplingPackedValues, packedObjectMap2, sharedValues = options.sharedValues;
      let sharedPackedObjectMap2;
      if (sharedValues) {
        sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
        for (let i = 0, l = sharedValues.length; i < l; i++) {
          sharedPackedObjectMap2[sharedValues[i]] = i;
        }
      }
      let recordIdsToRemove = [];
      let transitionsCount = 0;
      let serializationsSinceTransitionRebuild = 0;
      this.mapEncode = function(value, encodeOptions) {
        if (this._keyMap && !this._mapped) {
          switch (value.constructor.name) {
            case "Array":
              value = value.map((r) => this.encodeKeys(r));
              break;
          }
        }
        return this.encode(value, encodeOptions);
      };
      this.encode = function(value, encodeOptions) {
        if (!target) {
          target = new ByteArrayAllocate(8192);
          targetView = new DataView(target.buffer, 0, 8192);
          position2 = 0;
        }
        safeEnd = target.length - 10;
        if (safeEnd - position2 < 2048) {
          target = new ByteArrayAllocate(target.length);
          targetView = new DataView(target.buffer, 0, target.length);
          safeEnd = target.length - 10;
          position2 = 0;
        } else if (encodeOptions === REUSE_BUFFER_MODE)
          position2 = position2 + 7 & 2147483640;
        start = position2;
        if (encoder.useSelfDescribedHeader) {
          targetView.setUint32(position2, 3654940416);
          position2 += 3;
        }
        referenceMap2 = encoder.structuredClone ? /* @__PURE__ */ new Map() : null;
        if (encoder.bundleStrings && typeof value !== "string") {
          bundledStrings2 = [];
          bundledStrings2.size = Infinity;
        } else
          bundledStrings2 = null;
        sharedStructures = encoder.structures;
        if (sharedStructures) {
          if (sharedStructures.uninitialized) {
            let sharedData = encoder.getShared() || {};
            encoder.structures = sharedStructures = sharedData.structures || [];
            encoder.sharedVersion = sharedData.version;
            let sharedValues2 = encoder.sharedValues = sharedData.packedValues;
            if (sharedValues2) {
              sharedPackedObjectMap2 = {};
              for (let i = 0, l = sharedValues2.length; i < l; i++)
                sharedPackedObjectMap2[sharedValues2[i]] = i;
            }
          }
          let sharedStructuresLength = sharedStructures.length;
          if (sharedStructuresLength > maxSharedStructures && !isSequential)
            sharedStructuresLength = maxSharedStructures;
          if (!sharedStructures.transitions) {
            sharedStructures.transitions = /* @__PURE__ */ Object.create(null);
            for (let i = 0; i < sharedStructuresLength; i++) {
              let keys = sharedStructures[i];
              if (!keys)
                continue;
              let nextTransition, transition = sharedStructures.transitions;
              for (let j2 = 0, l = keys.length; j2 < l; j2++) {
                if (transition[RECORD_SYMBOL] === void 0)
                  transition[RECORD_SYMBOL] = i;
                let key = keys[j2];
                nextTransition = transition[key];
                if (!nextTransition) {
                  nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
                }
                transition = nextTransition;
              }
              transition[RECORD_SYMBOL] = i | 1048576;
            }
          }
          if (!isSequential)
            sharedStructures.nextId = sharedStructuresLength;
        }
        if (hasSharedUpdate)
          hasSharedUpdate = false;
        structures = sharedStructures || [];
        packedObjectMap2 = sharedPackedObjectMap2;
        if (options.pack) {
          let packedValues2 = /* @__PURE__ */ new Map();
          packedValues2.values = [];
          packedValues2.encoder = encoder;
          packedValues2.maxValues = options.maxPrivatePackedValues || (sharedPackedObjectMap2 ? 16 : Infinity);
          packedValues2.objectMap = sharedPackedObjectMap2 || false;
          packedValues2.samplingPackedValues = samplingPackedValues;
          findRepetitiveStrings(value, packedValues2);
          if (packedValues2.values.length > 0) {
            target[position2++] = 216;
            target[position2++] = 51;
            writeArrayHeader(4);
            let valuesArray = packedValues2.values;
            encode2(valuesArray);
            writeArrayHeader(0);
            writeArrayHeader(0);
            packedObjectMap2 = Object.create(sharedPackedObjectMap2 || null);
            for (let i = 0, l = valuesArray.length; i < l; i++) {
              packedObjectMap2[valuesArray[i]] = i;
            }
          }
        }
        throwOnIterable = encodeOptions & THROW_ON_ITERABLE;
        try {
          if (throwOnIterable)
            return;
          encode2(value);
          if (bundledStrings2) {
            writeBundles(start, encode2);
          }
          encoder.offset = position2;
          if (referenceMap2 && referenceMap2.idsToInsert) {
            position2 += referenceMap2.idsToInsert.length * 2;
            if (position2 > safeEnd)
              makeRoom(position2);
            encoder.offset = position2;
            let serialized = insertIds(target.subarray(start, position2), referenceMap2.idsToInsert);
            referenceMap2 = null;
            return serialized;
          }
          if (encodeOptions & REUSE_BUFFER_MODE) {
            target.start = start;
            target.end = position2;
            return target;
          }
          return target.subarray(start, position2);
        } finally {
          if (sharedStructures) {
            if (serializationsSinceTransitionRebuild < 10)
              serializationsSinceTransitionRebuild++;
            if (sharedStructures.length > maxSharedStructures)
              sharedStructures.length = maxSharedStructures;
            if (transitionsCount > 1e4) {
              sharedStructures.transitions = null;
              serializationsSinceTransitionRebuild = 0;
              transitionsCount = 0;
              if (recordIdsToRemove.length > 0)
                recordIdsToRemove = [];
            } else if (recordIdsToRemove.length > 0 && !isSequential) {
              for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
                recordIdsToRemove[i][RECORD_SYMBOL] = void 0;
              }
              recordIdsToRemove = [];
            }
          }
          if (hasSharedUpdate && encoder.saveShared) {
            if (encoder.structures.length > maxSharedStructures) {
              encoder.structures = encoder.structures.slice(0, maxSharedStructures);
            }
            let returnBuffer = target.subarray(start, position2);
            if (encoder.updateSharedData() === false)
              return encoder.encode(value);
            return returnBuffer;
          }
          if (encodeOptions & RESET_BUFFER_MODE)
            position2 = start;
        }
      };
      this.findCommonStringsToPack = () => {
        samplingPackedValues = /* @__PURE__ */ new Map();
        if (!sharedPackedObjectMap2)
          sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
        return (options2) => {
          let threshold = options2 && options2.threshold || 4;
          let position3 = this.pack ? options2.maxPrivatePackedValues || 16 : 0;
          if (!sharedValues)
            sharedValues = this.sharedValues = [];
          for (let [key, status] of samplingPackedValues) {
            if (status.count > threshold) {
              sharedPackedObjectMap2[key] = position3++;
              sharedValues.push(key);
              hasSharedUpdate = true;
            }
          }
          while (this.saveShared && this.updateSharedData() === false) {
          }
          samplingPackedValues = null;
        };
      };
      const encode2 = (value) => {
        if (position2 > safeEnd)
          target = makeRoom(position2);
        var type = typeof value;
        var length;
        if (type === "string") {
          if (packedObjectMap2) {
            let packedPosition = packedObjectMap2[value];
            if (packedPosition >= 0) {
              if (packedPosition < 16)
                target[position2++] = packedPosition + 224;
              else {
                target[position2++] = 198;
                if (packedPosition & 1)
                  encode2(15 - packedPosition >> 1);
                else
                  encode2(packedPosition - 16 >> 1);
              }
              return;
            } else if (samplingPackedValues && !options.pack) {
              let status = samplingPackedValues.get(value);
              if (status)
                status.count++;
              else
                samplingPackedValues.set(value, {
                  count: 1
                });
            }
          }
          let strLength = value.length;
          if (bundledStrings2 && strLength >= 4 && strLength < 1024) {
            if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
              let extStart;
              let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
              if (position2 + maxBytes2 > safeEnd)
                target = makeRoom(position2 + maxBytes2);
              target[position2++] = 217;
              target[position2++] = 223;
              target[position2++] = 249;
              target[position2++] = bundledStrings2.position ? 132 : 130;
              target[position2++] = 26;
              extStart = position2 - start;
              position2 += 4;
              if (bundledStrings2.position) {
                writeBundles(start, encode2);
              }
              bundledStrings2 = ["", ""];
              bundledStrings2.size = 0;
              bundledStrings2.position = extStart;
            }
            let twoByte = hasNonLatin.test(value);
            bundledStrings2[twoByte ? 0 : 1] += value;
            target[position2++] = twoByte ? 206 : 207;
            encode2(strLength);
            return;
          }
          let headerSize;
          if (strLength < 32) {
            headerSize = 1;
          } else if (strLength < 256) {
            headerSize = 2;
          } else if (strLength < 65536) {
            headerSize = 3;
          } else {
            headerSize = 5;
          }
          let maxBytes = strLength * 3;
          if (position2 + maxBytes > safeEnd)
            target = makeRoom(position2 + maxBytes);
          if (strLength < 64 || !encodeUtf8) {
            let i, c1, c2, strPosition = position2 + headerSize;
            for (i = 0; i < strLength; i++) {
              c1 = value.charCodeAt(i);
              if (c1 < 128) {
                target[strPosition++] = c1;
              } else if (c1 < 2048) {
                target[strPosition++] = c1 >> 6 | 192;
                target[strPosition++] = c1 & 63 | 128;
              } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
                c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
                i++;
                target[strPosition++] = c1 >> 18 | 240;
                target[strPosition++] = c1 >> 12 & 63 | 128;
                target[strPosition++] = c1 >> 6 & 63 | 128;
                target[strPosition++] = c1 & 63 | 128;
              } else {
                target[strPosition++] = c1 >> 12 | 224;
                target[strPosition++] = c1 >> 6 & 63 | 128;
                target[strPosition++] = c1 & 63 | 128;
              }
            }
            length = strPosition - position2 - headerSize;
          } else {
            length = encodeUtf8(value, position2 + headerSize, maxBytes);
          }
          if (length < 24) {
            target[position2++] = 96 | length;
          } else if (length < 256) {
            if (headerSize < 2) {
              target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
            }
            target[position2++] = 120;
            target[position2++] = length;
          } else if (length < 65536) {
            if (headerSize < 3) {
              target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
            }
            target[position2++] = 121;
            target[position2++] = length >> 8;
            target[position2++] = length & 255;
          } else {
            if (headerSize < 5) {
              target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
            }
            target[position2++] = 122;
            targetView.setUint32(position2, length);
            position2 += 4;
          }
          position2 += length;
        } else if (type === "number") {
          if (!this.alwaysUseFloat && value >>> 0 === value) {
            if (value < 24) {
              target[position2++] = value;
            } else if (value < 256) {
              target[position2++] = 24;
              target[position2++] = value;
            } else if (value < 65536) {
              target[position2++] = 25;
              target[position2++] = value >> 8;
              target[position2++] = value & 255;
            } else {
              target[position2++] = 26;
              targetView.setUint32(position2, value);
              position2 += 4;
            }
          } else if (!this.alwaysUseFloat && value >> 0 === value) {
            if (value >= -24) {
              target[position2++] = 31 - value;
            } else if (value >= -256) {
              target[position2++] = 56;
              target[position2++] = ~value;
            } else if (value >= -65536) {
              target[position2++] = 57;
              targetView.setUint16(position2, ~value);
              position2 += 2;
            } else {
              target[position2++] = 58;
              targetView.setUint32(position2, ~value);
              position2 += 4;
            }
          } else if (!this.alwaysUseFloat && value < 0 && value >= -4294967296 && Math.floor(value) === value) {
            target[position2++] = 58;
            targetView.setUint32(position2, -1 - value);
            position2 += 4;
          } else {
            let useFloat32;
            if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
              target[position2++] = 250;
              targetView.setFloat32(position2, value);
              let xShifted;
              if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
              (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
                position2 += 4;
                return;
              } else
                position2--;
            }
            target[position2++] = 251;
            targetView.setFloat64(position2, value);
            position2 += 8;
          }
        } else if (type === "object") {
          if (!value)
            target[position2++] = 246;
          else {
            if (referenceMap2) {
              let referee = referenceMap2.get(value);
              if (referee) {
                target[position2++] = 216;
                target[position2++] = 29;
                target[position2++] = 25;
                if (!referee.references) {
                  let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                  referee.references = [];
                  idsToInsert.push(referee);
                }
                referee.references.push(position2 - start);
                position2 += 2;
                return;
              } else
                referenceMap2.set(value, { offset: position2 - start });
            }
            let constructor = value.constructor;
            if (constructor === Object) {
              if (this.skipFunction === true) {
                value = Object.fromEntries([...Object.keys(value).filter((x2) => typeof value[x2] !== "function").map((x2) => [x2, value[x2]])]);
              }
              writeObject(value);
            } else if (constructor === Array) {
              length = value.length;
              if (length < 24) {
                target[position2++] = 128 | length;
              } else {
                writeArrayHeader(length);
              }
              for (let i = 0; i < length; i++) {
                encode2(value[i]);
              }
            } else if (constructor === Map) {
              if (this.mapsAsObjects ? this.useTag259ForMaps !== false : this.useTag259ForMaps) {
                target[position2++] = 217;
                target[position2++] = 1;
                target[position2++] = 3;
              }
              length = value.size;
              if (length < 24) {
                target[position2++] = 160 | length;
              } else if (length < 256) {
                target[position2++] = 184;
                target[position2++] = length;
              } else if (length < 65536) {
                target[position2++] = 185;
                target[position2++] = length >> 8;
                target[position2++] = length & 255;
              } else {
                target[position2++] = 186;
                targetView.setUint32(position2, length);
                position2 += 4;
              }
              if (encoder.keyMap) {
                for (let [key, entryValue] of value) {
                  encode2(encoder.encodeKey(key));
                  encode2(entryValue);
                }
              } else {
                for (let [key, entryValue] of value) {
                  encode2(key);
                  encode2(entryValue);
                }
              }
            } else {
              for (let i = 0, l = extensions.length; i < l; i++) {
                let extensionClass = extensionClasses[i];
                if (value instanceof extensionClass) {
                  let extension = extensions[i];
                  let tag = extension.tag;
                  if (tag == void 0)
                    tag = extension.getTag && extension.getTag.call(this, value);
                  if (tag < 24) {
                    target[position2++] = 192 | tag;
                  } else if (tag < 256) {
                    target[position2++] = 216;
                    target[position2++] = tag;
                  } else if (tag < 65536) {
                    target[position2++] = 217;
                    target[position2++] = tag >> 8;
                    target[position2++] = tag & 255;
                  } else if (tag > -1) {
                    target[position2++] = 218;
                    targetView.setUint32(position2, tag);
                    position2 += 4;
                  }
                  extension.encode.call(this, value, encode2, makeRoom);
                  return;
                }
              }
              if (value[Symbol.iterator]) {
                if (throwOnIterable) {
                  let error = new Error("Iterable should be serialized as iterator");
                  error.iteratorNotHandled = true;
                  throw error;
                }
                target[position2++] = 159;
                for (let entry of value) {
                  encode2(entry);
                }
                target[position2++] = 255;
                return;
              }
              if (value[Symbol.asyncIterator] || isBlob(value)) {
                let error = new Error("Iterable/blob should be serialized as iterator");
                error.iteratorNotHandled = true;
                throw error;
              }
              if (this.useToJSON && value.toJSON) {
                const json = value.toJSON();
                if (json !== value)
                  return encode2(json);
              }
              writeObject(value);
            }
          }
        } else if (type === "boolean") {
          target[position2++] = value ? 245 : 244;
        } else if (type === "bigint") {
          if (value < BigInt(1) << BigInt(64) && value >= 0) {
            target[position2++] = 27;
            targetView.setBigUint64(position2, value);
          } else if (value > -(BigInt(1) << BigInt(64)) && value < 0) {
            target[position2++] = 59;
            targetView.setBigUint64(position2, -value - BigInt(1));
          } else {
            if (this.largeBigIntToFloat) {
              target[position2++] = 251;
              targetView.setFloat64(position2, Number(value));
            } else {
              if (value >= BigInt(0))
                target[position2++] = 194;
              else {
                target[position2++] = 195;
                value = BigInt(-1) - value;
              }
              let bytes = [];
              while (value) {
                bytes.push(Number(value & BigInt(255)));
                value >>= BigInt(8);
              }
              writeBuffer(new Uint8Array(bytes.reverse()), makeRoom);
              return;
            }
          }
          position2 += 8;
        } else if (type === "undefined") {
          target[position2++] = 247;
        } else {
          throw new Error("Unknown type: " + type);
        }
      };
      const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
        let keys = Object.keys(object);
        let vals = Object.values(object);
        let length = keys.length;
        if (length < 24) {
          target[position2++] = 160 | length;
        } else if (length < 256) {
          target[position2++] = 184;
          target[position2++] = length;
        } else if (length < 65536) {
          target[position2++] = 185;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          target[position2++] = 186;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        let key;
        if (encoder.keyMap) {
          for (let i = 0; i < length; i++) {
            encode2(encoder.encodeKey(keys[i]));
            encode2(vals[i]);
          }
        } else {
          for (let i = 0; i < length; i++) {
            encode2(keys[i]);
            encode2(vals[i]);
          }
        }
      } : (object) => {
        target[position2++] = 185;
        let objectOffset = position2 - start;
        position2 += 2;
        let size = 0;
        if (encoder.keyMap) {
          for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
            encode2(encoder.encodeKey(key));
            encode2(object[key]);
            size++;
          }
        } else {
          for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
            encode2(key);
            encode2(object[key]);
            size++;
          }
        }
        target[objectOffset++ + start] = size >> 8;
        target[objectOffset + start] = size & 255;
      } : (object, skipValues) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let newTransitions = 0;
        let length = 0;
        let parentRecordId;
        let keys;
        if (this.keyMap) {
          keys = Object.keys(object).map((k2) => this.encodeKey(k2));
          length = keys.length;
          for (let i = 0; i < length; i++) {
            let key = keys[i];
            nextTransition = transition[key];
            if (!nextTransition) {
              nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              newTransitions++;
            }
            transition = nextTransition;
          }
        } else {
          for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (!nextTransition) {
              if (transition[RECORD_SYMBOL] & 1048576) {
                parentRecordId = transition[RECORD_SYMBOL] & 65535;
              }
              nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              newTransitions++;
            }
            transition = nextTransition;
            length++;
          }
        }
        let recordId = transition[RECORD_SYMBOL];
        if (recordId !== void 0) {
          recordId &= 65535;
          target[position2++] = 217;
          target[position2++] = recordId >> 8 | 224;
          target[position2++] = recordId & 255;
        } else {
          if (!keys)
            keys = transition.__keys__ || (transition.__keys__ = Object.keys(object));
          if (parentRecordId === void 0) {
            recordId = structures.nextId++;
            if (!recordId) {
              recordId = 0;
              structures.nextId = 1;
            }
            if (recordId >= MAX_STRUCTURES) {
              structures.nextId = (recordId = maxSharedStructures) + 1;
            }
          } else {
            recordId = parentRecordId;
          }
          structures[recordId] = keys;
          if (recordId < maxSharedStructures) {
            target[position2++] = 217;
            target[position2++] = recordId >> 8 | 224;
            target[position2++] = recordId & 255;
            transition = structures.transitions;
            for (let i = 0; i < length; i++) {
              if (transition[RECORD_SYMBOL] === void 0 || transition[RECORD_SYMBOL] & 1048576)
                transition[RECORD_SYMBOL] = recordId;
              transition = transition[keys[i]];
            }
            transition[RECORD_SYMBOL] = recordId | 1048576;
            hasSharedUpdate = true;
          } else {
            transition[RECORD_SYMBOL] = recordId;
            targetView.setUint32(position2, 3655335680);
            position2 += 3;
            if (newTransitions)
              transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
            if (recordIdsToRemove.length >= MAX_STRUCTURES - maxSharedStructures)
              recordIdsToRemove.shift()[RECORD_SYMBOL] = void 0;
            recordIdsToRemove.push(transition);
            writeArrayHeader(length + 2);
            encode2(57344 + recordId);
            encode2(keys);
            if (skipValues) return;
            for (let key in object)
              if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key))
                encode2(object[key]);
            return;
          }
        }
        if (length < 24) {
          target[position2++] = 128 | length;
        } else {
          writeArrayHeader(length);
        }
        if (skipValues) return;
        for (let key in object)
          if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key))
            encode2(object[key]);
      };
      const makeRoom = (end) => {
        let newSize;
        if (end > 16777216) {
          if (end - start > MAX_BUFFER_SIZE)
            throw new Error("Encoded buffer would be larger than maximum buffer size");
          newSize = Math.min(
            MAX_BUFFER_SIZE,
            Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
          );
        } else
          newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
        let newBuffer = new ByteArrayAllocate(newSize);
        targetView = new DataView(newBuffer.buffer, 0, newSize);
        if (target.copy)
          target.copy(newBuffer, 0, start, end);
        else
          newBuffer.set(target.slice(start, end));
        position2 -= start;
        start = 0;
        safeEnd = newBuffer.length - 10;
        return target = newBuffer;
      };
      let chunkThreshold = 100;
      let continuedChunkThreshold = 1e3;
      this.encodeAsIterable = function(value, options2) {
        return startEncoding(value, options2, encodeObjectAsIterable);
      };
      this.encodeAsAsyncIterable = function(value, options2) {
        return startEncoding(value, options2, encodeObjectAsAsyncIterable);
      };
      function* encodeObjectAsIterable(object, iterateProperties, finalIterable) {
        let constructor = object.constructor;
        if (constructor === Object) {
          let useRecords = encoder.useRecords !== false;
          if (useRecords)
            writeObject(object, true);
          else
            writeEntityLength(Object.keys(object).length, 160);
          for (let key in object) {
            let value = object[key];
            if (!useRecords) encode2(key);
            if (value && typeof value === "object") {
              if (iterateProperties[key])
                yield* encodeObjectAsIterable(value, iterateProperties[key]);
              else
                yield* tryEncode(value, iterateProperties, key);
            } else encode2(value);
          }
        } else if (constructor === Array) {
          let length = object.length;
          writeArrayHeader(length);
          for (let i = 0; i < length; i++) {
            let value = object[i];
            if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
              if (iterateProperties.element)
                yield* encodeObjectAsIterable(value, iterateProperties.element);
              else
                yield* tryEncode(value, iterateProperties, "element");
            } else encode2(value);
          }
        } else if (object[Symbol.iterator] && !object.buffer) {
          target[position2++] = 159;
          for (let value of object) {
            if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
              if (iterateProperties.element)
                yield* encodeObjectAsIterable(value, iterateProperties.element);
              else
                yield* tryEncode(value, iterateProperties, "element");
            } else encode2(value);
          }
          target[position2++] = 255;
        } else if (isBlob(object)) {
          writeEntityLength(object.size, 64);
          yield target.subarray(start, position2);
          yield object;
          restartEncoding();
        } else if (object[Symbol.asyncIterator]) {
          target[position2++] = 159;
          yield target.subarray(start, position2);
          yield object;
          restartEncoding();
          target[position2++] = 255;
        } else {
          encode2(object);
        }
        if (finalIterable && position2 > start) yield target.subarray(start, position2);
        else if (position2 - start > chunkThreshold) {
          yield target.subarray(start, position2);
          restartEncoding();
        }
      }
      function* tryEncode(value, iterateProperties, key) {
        let restart = position2 - start;
        try {
          encode2(value);
          if (position2 - start > chunkThreshold) {
            yield target.subarray(start, position2);
            restartEncoding();
          }
        } catch (error) {
          if (error.iteratorNotHandled) {
            iterateProperties[key] = {};
            position2 = start + restart;
            yield* encodeObjectAsIterable.call(this, value, iterateProperties[key]);
          } else throw error;
        }
      }
      function restartEncoding() {
        chunkThreshold = continuedChunkThreshold;
        encoder.encode(null, THROW_ON_ITERABLE);
      }
      function startEncoding(value, options2, encodeIterable) {
        if (options2 && options2.chunkThreshold)
          chunkThreshold = continuedChunkThreshold = options2.chunkThreshold;
        else
          chunkThreshold = 100;
        if (value && typeof value === "object") {
          encoder.encode(null, THROW_ON_ITERABLE);
          return encodeIterable(value, encoder.iterateProperties || (encoder.iterateProperties = {}), true);
        }
        return [encoder.encode(value)];
      }
      async function* encodeObjectAsAsyncIterable(value, iterateProperties) {
        for (let encodedValue of encodeObjectAsIterable(value, iterateProperties, true)) {
          let constructor = encodedValue.constructor;
          if (constructor === ByteArray || constructor === Uint8Array)
            yield encodedValue;
          else if (isBlob(encodedValue)) {
            let reader = encodedValue.stream().getReader();
            let next;
            while (!(next = await reader.read()).done) {
              yield next.value;
            }
          } else if (encodedValue[Symbol.asyncIterator]) {
            for await (let asyncValue of encodedValue) {
              restartEncoding();
              if (asyncValue)
                yield* encodeObjectAsAsyncIterable(asyncValue, iterateProperties.async || (iterateProperties.async = {}));
              else yield encoder.encode(asyncValue);
            }
          } else {
            yield encodedValue;
          }
        }
      }
    }
    useBuffer(buffer) {
      target = buffer;
      targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
      position2 = 0;
    }
    clearSharedData() {
      if (this.structures)
        this.structures = [];
      if (this.sharedValues)
        this.sharedValues = void 0;
    }
    updateSharedData() {
      let lastVersion = this.sharedVersion || 0;
      this.sharedVersion = lastVersion + 1;
      let structuresCopy = this.structures.slice(0);
      let sharedData = new SharedData(structuresCopy, this.sharedValues, this.sharedVersion);
      let saveResults = this.saveShared(
        sharedData,
        (existingShared) => (existingShared && existingShared.version || 0) == lastVersion
      );
      if (saveResults === false) {
        sharedData = this.getShared() || {};
        this.structures = sharedData.structures || [];
        this.sharedValues = sharedData.packedValues;
        this.sharedVersion = sharedData.version;
        this.structures.nextId = this.structures.length;
      } else {
        structuresCopy.forEach((structure, i) => this.structures[i] = structure);
      }
      return saveResults;
    }
  };
  function writeEntityLength(length, majorValue) {
    if (length < 24)
      target[position2++] = majorValue | length;
    else if (length < 256) {
      target[position2++] = majorValue | 24;
      target[position2++] = length;
    } else if (length < 65536) {
      target[position2++] = majorValue | 25;
      target[position2++] = length >> 8;
      target[position2++] = length & 255;
    } else {
      target[position2++] = majorValue | 26;
      targetView.setUint32(position2, length);
      position2 += 4;
    }
  }
  var SharedData = class {
    constructor(structures, values, version) {
      this.structures = structures;
      this.packedValues = values;
      this.version = version;
    }
  };
  function writeArrayHeader(length) {
    if (length < 24)
      target[position2++] = 128 | length;
    else if (length < 256) {
      target[position2++] = 152;
      target[position2++] = length;
    } else if (length < 65536) {
      target[position2++] = 153;
      target[position2++] = length >> 8;
      target[position2++] = length & 255;
    } else {
      target[position2++] = 154;
      targetView.setUint32(position2, length);
      position2 += 4;
    }
  }
  var BlobConstructor = typeof Blob === "undefined" ? function() {
  } : Blob;
  function isBlob(object) {
    if (object instanceof BlobConstructor)
      return true;
    let tag = object[Symbol.toStringTag];
    return tag === "Blob" || tag === "File";
  }
  function findRepetitiveStrings(value, packedValues2) {
    switch (typeof value) {
      case "string":
        if (value.length > 3) {
          if (packedValues2.objectMap[value] > -1 || packedValues2.values.length >= packedValues2.maxValues)
            return;
          let packedStatus = packedValues2.get(value);
          if (packedStatus) {
            if (++packedStatus.count == 2) {
              packedValues2.values.push(value);
            }
          } else {
            packedValues2.set(value, {
              count: 1
            });
            if (packedValues2.samplingPackedValues) {
              let status = packedValues2.samplingPackedValues.get(value);
              if (status)
                status.count++;
              else
                packedValues2.samplingPackedValues.set(value, {
                  count: 1
                });
            }
          }
        }
        break;
      case "object":
        if (value) {
          if (value instanceof Array) {
            for (let i = 0, l = value.length; i < l; i++) {
              findRepetitiveStrings(value[i], packedValues2);
            }
          } else {
            let includeKeys = !packedValues2.encoder.useRecords;
            for (var key in value) {
              if (value.hasOwnProperty(key)) {
                if (includeKeys)
                  findRepetitiveStrings(key, packedValues2);
                findRepetitiveStrings(value[key], packedValues2);
              }
            }
          }
        }
        break;
      case "function":
        console.log(value);
    }
  }
  var isLittleEndianMachine2 = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
  extensionClasses = [
    Date,
    Set,
    Error,
    RegExp,
    Tag,
    ArrayBuffer,
    Uint8Array,
    Uint8ClampedArray,
    Uint16Array,
    Uint32Array,
    typeof BigUint64Array == "undefined" ? function() {
    } : BigUint64Array,
    Int8Array,
    Int16Array,
    Int32Array,
    typeof BigInt64Array == "undefined" ? function() {
    } : BigInt64Array,
    Float32Array,
    Float64Array,
    SharedData
  ];
  extensions = [
    {
      // Date
      tag: 1,
      encode(date, encode2) {
        let seconds = date.getTime() / 1e3;
        if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
          target[position2++] = 26;
          targetView.setUint32(position2, seconds);
          position2 += 4;
        } else {
          target[position2++] = 251;
          targetView.setFloat64(position2, seconds);
          position2 += 8;
        }
      }
    },
    {
      // Set
      tag: 258,
      // https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
      encode(set, encode2) {
        let array = Array.from(set);
        encode2(array);
      }
    },
    {
      // Error
      tag: 27,
      // http://cbor.schmorp.de/generic-object
      encode(error, encode2) {
        encode2([error.name, error.message]);
      }
    },
    {
      // RegExp
      tag: 27,
      // http://cbor.schmorp.de/generic-object
      encode(regex, encode2) {
        encode2(["RegExp", regex.source, regex.flags]);
      }
    },
    {
      // Tag
      getTag(tag) {
        return tag.tag;
      },
      encode(tag, encode2) {
        encode2(tag.value);
      }
    },
    {
      // ArrayBuffer
      encode(arrayBuffer, encode2, makeRoom) {
        writeBuffer(arrayBuffer, makeRoom);
      }
    },
    {
      // Uint8Array
      getTag(typedArray) {
        if (typedArray.constructor === Uint8Array) {
          if (this.tagUint8Array || hasNodeBuffer && this.tagUint8Array !== false)
            return 64;
        }
      },
      encode(typedArray, encode2, makeRoom) {
        writeBuffer(typedArray, makeRoom);
      }
    },
    typedArrayEncoder(68, 1),
    typedArrayEncoder(69, 2),
    typedArrayEncoder(70, 4),
    typedArrayEncoder(71, 8),
    typedArrayEncoder(72, 1),
    typedArrayEncoder(77, 2),
    typedArrayEncoder(78, 4),
    typedArrayEncoder(79, 8),
    typedArrayEncoder(85, 4),
    typedArrayEncoder(86, 8),
    {
      encode(sharedData, encode2) {
        let packedValues2 = sharedData.packedValues || [];
        let sharedStructures = sharedData.structures || [];
        if (packedValues2.values.length > 0) {
          target[position2++] = 216;
          target[position2++] = 51;
          writeArrayHeader(4);
          let valuesArray = packedValues2.values;
          encode2(valuesArray);
          writeArrayHeader(0);
          writeArrayHeader(0);
          packedObjectMap = Object.create(sharedPackedObjectMap || null);
          for (let i = 0, l = valuesArray.length; i < l; i++) {
            packedObjectMap[valuesArray[i]] = i;
          }
        }
        if (sharedStructures) {
          targetView.setUint32(position2, 3655335424);
          position2 += 3;
          let definitions = sharedStructures.slice(0);
          definitions.unshift(57344);
          definitions.push(new Tag(sharedData.version, 1399353956));
          encode2(definitions);
        } else
          encode2(new Tag(sharedData.version, 1399353956));
      }
    }
  ];
  function typedArrayEncoder(tag, size) {
    if (!isLittleEndianMachine2 && size > 1)
      tag -= 4;
    return {
      tag,
      encode: function writeExtBuffer(typedArray, encode2) {
        let length = typedArray.byteLength;
        let offset = typedArray.byteOffset || 0;
        let buffer = typedArray.buffer || typedArray;
        encode2(hasNodeBuffer ? Buffer2.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
      }
    };
  }
  function writeBuffer(buffer, makeRoom) {
    let length = buffer.byteLength;
    if (length < 24) {
      target[position2++] = 64 + length;
    } else if (length < 256) {
      target[position2++] = 88;
      target[position2++] = length;
    } else if (length < 65536) {
      target[position2++] = 89;
      target[position2++] = length >> 8;
      target[position2++] = length & 255;
    } else {
      target[position2++] = 90;
      targetView.setUint32(position2, length);
      position2 += 4;
    }
    if (position2 + length >= target.length) {
      makeRoom(position2 + length);
    }
    target.set(buffer.buffer ? buffer : new Uint8Array(buffer), position2);
    position2 += length;
  }
  function insertIds(serialized, idsToInsert) {
    let nextId;
    let distanceToMove = idsToInsert.length * 2;
    let lastEnd = serialized.length - distanceToMove;
    idsToInsert.sort((a, b2) => a.offset > b2.offset ? 1 : -1);
    for (let id = 0; id < idsToInsert.length; id++) {
      let referee = idsToInsert[id];
      referee.id = id;
      for (let position3 of referee.references) {
        serialized[position3++] = id >> 8;
        serialized[position3] = id & 255;
      }
    }
    while (nextId = idsToInsert.pop()) {
      let offset = nextId.offset;
      serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
      distanceToMove -= 2;
      let position3 = offset + distanceToMove;
      serialized[position3++] = 216;
      serialized[position3++] = 28;
      lastEnd = offset;
    }
    return serialized;
  }
  function writeBundles(start, encode2) {
    targetView.setUint32(bundledStrings2.position + start, position2 - bundledStrings2.position - start + 1);
    let writeStrings = bundledStrings2;
    bundledStrings2 = null;
    encode2(writeStrings[0]);
    encode2(writeStrings[1]);
  }
  var defaultEncoder = new Encoder({ useRecords: false });
  var encode = defaultEncoder.encode;
  var encodeAsIterable = defaultEncoder.encodeAsIterable;
  var encodeAsAsyncIterable = defaultEncoder.encodeAsAsyncIterable;
  var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
  var REUSE_BUFFER_MODE = 512;
  var RESET_BUFFER_MODE = 1024;
  var THROW_ON_ITERABLE = 2048;

  // dist/index.mjs
  var w = class {
    tokenId;
    token;
    baseUrl;
    constructor(e, r) {
      if (!e || e.trim() === "") throw new Error("Token ID is required");
      if (!r || r.trim() === "") throw new Error("Token is required");
      this.tokenId = e, this.token = r, this.baseUrl = "https://api.anedya.io/v1";
    }
  };
  var v = class {
    tokenId;
    tokenBytes;
    signatureVersionBytes;
    signatureVersion = "v1";
    authorizationMode = "ANEDYASIGV1";
    baseUrl;
    constructor(e) {
      let { token: r, tokenId: t } = e;
      this.tokenId = t, this.signatureVersionBytes = new TextEncoder().encode(this.signatureVersion), this.tokenBytes = new TextEncoder().encode(r), this.baseUrl = e.baseUrl;
    }
  };
  var C = class {
    constructor(e, r, t, o = 1e4, n = "desc") {
      this.variable = e;
      this.from = r;
      this.to = t;
      this.limit = o;
      this.order = n;
      if (n !== "asc" && n !== "desc") throw new Error("Invalid order value. It should be either 'asc' or 'desc'.");
      if (o < 1) throw new Error("Invalid limit value. It should be at least 1.");
      if (r > t) throw new Error("Invalid time range. 'from' should be less than or equal to 'to'.");
    }
  };
  var m = class {
    isSuccess;
    error;
    isDataAvailable;
    data;
    count;
    startTime;
    endTime;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" }, this.isDataAvailable = false, this.data = null, this.count = 0, this.startTime = 0, this.endTime = 0;
    }
  };
  var h = class {
    isSuccess;
    error;
    isDataAvailable;
    data;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" }, this.isDataAvailable = false, this.data = null;
    }
  };
  var N = class {
    constructor(e, r, t, o) {
      this.namespace = e;
      this.key = r;
      this.value = t;
      this.type = o;
      if (this.namespace.scope !== "global" && this.namespace.scope !== "node") throw new Error("Invalid namespace scope. It should be either 'global' or 'node'.");
      if (this.type !== "string" && this.type !== "binary" && this.type !== "float" && this.type !== "boolean") throw new Error("Invalid type value. It should be either 'string', 'binary', 'float', or 'boolean'.");
    }
  };
  var g = class {
    isSuccess;
    error;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" };
    }
  };
  var T = class {
    constructor(e, r) {
      this.namespace = e;
      this.key = r;
      if (this.namespace.scope !== "global" && this.namespace.scope !== "node") throw new Error("Invalid namespace scope. It should be either 'global' or 'node'.");
    }
  };
  var b = class {
    isSuccess;
    error;
    namespace;
    key;
    value;
    type;
    size;
    modified;
    created;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" }, this.namespace = { scope: "", id: "" }, this.key = "", this.value = void 0, this.type = "", this.size = 0, this.modified = 0, this.created = 0;
    }
  };
  var x = class {
    constructor(e, r) {
      this.namespace = e;
      this.key = r;
      if (this.namespace.scope !== "global" && this.namespace.scope !== "node") throw new Error("Invalid namespace scope. It should be either 'global' or 'node'.");
    }
  };
  var S = class {
    isSuccess;
    error;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" };
    }
  };
  var k = class {
    constructor(e, r, t, o, n) {
      this.filter = e;
      this.orderby = r;
      this.order = t;
      this.limit = o;
      this.offset = n;
      if (this.filter.namespace.scope !== "global" && this.filter.namespace.scope !== "node") throw new Error("Invalid namespace scope. It should be either 'global' or 'node'.");
    }
  };
  var f = class {
    isSuccess;
    error;
    count;
    totalCount;
    data;
    next;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" }, this.count = 0, this.totalCount = 0, this.data = void 0, this.next = 0;
    }
  };
  var A = class {
    isSuccess;
    error;
    data;
    constructor() {
      this.isSuccess = false, this.error = { errorMessage: "", reasonCode: "" }, this.data = void 0;
    }
  };
  var E = class {
    constructor(e, r) {
      this.time = e;
      this.variable = r;
      if (!Number.isFinite(e) || e <= 0) throw new Error("Invalid time: must be a positive number (UNIX timestamp).");
      let t = Math.floor(Date.now() / 1e3);
      if (e > t) throw new Error("Invalid time: timestamp cannot be in the future.");
      if (!r || typeof r != "string") throw new Error("Invalid variable: must be a non-empty string.");
    }
  };
  var I = class {
    isSuccess;
    error;
    count;
    data;
    constructor() {
      this.error = { errorMessage: "", reasonCode: "" }, this.isSuccess = false, this.count = 0, this.data = [];
    }
  };
  var p = async (c, e, r) => {
    try {
      let t;
      c == null ? t = new Uint8Array() : t = new TextEncoder().encode(JSON.stringify(c));
      let o = await crypto.subtle.digest("SHA-256", t), n = new Uint8Array(o), l = new Uint8Array(8);
      new DataView(l.buffer).setBigUint64(0, BigInt(r), false);
      let y = new Uint8Array(n.length + l.length + e.signatureVersionBytes.length + e.tokenBytes.length);
      y.set(n, 0), y.set(l, n.length), y.set(e.signatureVersionBytes, n.length + l.length), y.set(e.tokenBytes, n.length + l.length + e.signatureVersionBytes.length);
      let u = await crypto.subtle.digest("SHA-256", y);
      return Array.from(new Uint8Array(u)).map((d) => d.toString(16).padStart(2, "0")).join("");
    } catch (t) {
      console.log(t);
    }
  };
  var _ = async (c, e, r, t) => {
    let o = `${c}/data/getData`, n = { nodes: r, variable: t.variable, from: Math.floor(t.from / 1e3), to: Math.floor(t.to / 1e3), limit: t.limit, order: t.order }, l = Math.floor(Date.now() / 1e3), y = await p(n, e, l);
    try {
      let u = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": l.toString(), "X-Anedya-Signature": y, "Content-Type": "application/json" }, d = await fetch(o, { method: "POST", credentials: "same-origin", headers: u, body: JSON.stringify(n) }), s = new m();
      try {
        let a = await d.json();
        if (s.isSuccess = a.success, s.error.errorMessage = a.error, s.error.reasonCode = a.reasonCode, s.isDataAvailable = false, s.data = null, a.success) {
          let i = a.data;
          i == null || i == null || Object.keys(i).length === 0 ? s.isDataAvailable = false : r.length === 1 ? (i = i[r.toString()], s.data = i, s.isDataAvailable = true) : (s.data = i, s.isDataAvailable = true);
        }
        return s.count = a.count, s.startTime = a.startTime, s.endTime = a.endTime, s;
      } catch {
        return s.isSuccess = false, s.error.reasonCode = d.status.toString(), s.error.errorMessage = d.statusText, s;
      }
    } catch (u) {
      throw console.error("Error during Get data request:", u), u;
    }
  };
  var G = async (c, e, r, t) => {
    let o = `${c}/data/latest`, n = { nodes: r, variable: t.variable }, l = Math.floor(Date.now() / 1e3), y = await p(n, e, l);
    try {
      let u = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": l.toString(), "X-Anedya-Signature": y, "Content-Type": "application/json" }, d = await fetch(o, { method: "POST", credentials: "same-origin", headers: u, body: JSON.stringify(n) }), s = new h();
      try {
        let a = await d.json();
        if (s.isSuccess = a.success, s.error.errorMessage = a.error, s.error.reasonCode = a.reasonCode, s.isDataAvailable = false, s.data = null, a.success) {
          let i = a.data;
          i == null || i == null || Object.keys(i).length === 0 ? s.isDataAvailable = false : r.length === 1 ? (i = i[r.toString()], s.data = i, s.isDataAvailable = true) : (s.data = i, s.isDataAvailable = true);
        }
        return s;
      } catch {
        return s.isSuccess = false, s.error.reasonCode = d.status.toString(), s.error.errorMessage = d.statusText, s;
      }
    } catch (u) {
      throw console.error("Error during get latest data request:", u), u;
    }
  };
  var M = async (c, e, r, t) => {
    let o = `${c}/valuestore/setValue`, n;
    t.namespace.scope === "node" ? n = r[0] : n = t.namespace.id;
    let l = { namespace: { scope: t.namespace.scope, id: n }, key: t.key, value: t.value, type: t.type }, y = Math.floor(Date.now() / 1e3), u = await p(l, e, y);
    try {
      let d = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": y.toString(), "X-Anedya-Signature": u, "Content-Type": "application/json" }, s = await fetch(o, { method: "POST", credentials: "same-origin", headers: d, body: JSON.stringify(l) }), a = new g();
      try {
        let i = await s.json();
        return a.isSuccess = i.success, a.error.errorMessage = i.error, a.error.reasonCode = i.reasonCode, a;
      } catch {
        return a.isSuccess = false, a.error.errorMessage = s.statusText, a.error.reasonCode = s.status.toString(), a;
      }
    } catch (d) {
      throw console.error("Error during set key: ", d), d;
    }
  };
  var U = async (c, e, r, t) => {
    let o = `${c}/valuestore/getValue`, n;
    t.namespace.scope === "node" ? n = r[0] : n = t.namespace.id;
    let l = { namespace: { scope: t.namespace.scope, id: n }, key: t.key }, y = Math.floor(Date.now() / 1e3), u = await p(l, e, y);
    try {
      let d = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": y.toString(), "X-Anedya-Signature": u, "Content-Type": "application/json" }, s = await fetch(o, { method: "POST", credentials: "same-origin", headers: d, body: JSON.stringify(l) }), a = new b();
      try {
        let i = await s.json();
        return a.isSuccess = i.success, a.error.errorMessage = i.error, a.error.reasonCode = i.reasonCode, a.namespace = i.namespace, a.key = i.key, a.value = i.value, a.type = i.type, a.size = i.size, a.modified = i.modified, a.created = i.created, a;
      } catch {
        return a.isSuccess = false, a.error.errorMessage = s.statusText, a.error.reasonCode = s.status.toString(), a;
      }
    } catch (d) {
      throw console.error("Error during get key request: ", d), d;
    }
  };
  var O = async (c, e, r, t) => {
    let o = `${c}/valuestore/delete`, n;
    t.namespace.scope === "node" ? n = r[0] : n = t.namespace.id;
    let l = { namespace: { scope: t.namespace.scope, id: n }, key: t.key }, y = Math.floor(Date.now() / 1e3), u = await p(l, e, y);
    try {
      let d = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": y.toString(), "X-Anedya-Signature": u, "Content-Type": "application/json" }, s = await fetch(o, { method: "POST", credentials: "same-origin", headers: d, body: JSON.stringify(l) }), a = new S();
      try {
        let i = await s.json();
        return a.isSuccess = i.success, a.error.errorMessage = i.error, a.error.reasonCode = i.reasonCode, a;
      } catch {
        return a.isSuccess = false, a.error.errorMessage = s.statusText, a.error.reasonCode = s.status.toString(), a;
      }
    } catch (d) {
      throw console.error("Error during fetch operation:", d), d;
    }
  };
  var q = async (c, e, r, t) => {
    let o = `${c}/valuestore/scan`, n;
    t.filter.namespace.scope === "node" ? n = r[0] : n = t.filter.namespace.id;
    let l = { filter: { namespace: { scope: t.filter.namespace.scope, id: n } }, orderby: t.orderby, order: t.order, limit: t.limit, offset: t.offset }, y = Math.floor(Date.now() / 1e3), u = await p(l, e, y);
    try {
      let d = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": y.toString(), "X-Anedya-Signature": u, "Content-Type": "application/json" }, s = await fetch(o, { method: "POST", credentials: "same-origin", headers: d, body: JSON.stringify(l) }), a = new f();
      try {
        let i = await s.json();
        return a.isSuccess = i.success, a.error.errorMessage = i.error, a.error.reasonCode = i.reasonCode, a.count = i.count, a.totalCount = i.totalCount, a.data = i.data, a.next = i.next, a;
      } catch {
        return a.isSuccess = false, a.error.errorMessage = s.statusText, a.error.reasonCode = s.status.toString(), a;
      }
    } catch (d) {
      throw console.error("Error during scan vs operation: ", d), d;
    }
  };
  var P = async (c, e, r, t) => {
    let o = `${c}/health/status`, n = { nodes: r, lastContactThreshold: t }, l = Math.floor(Date.now() / 1e3), y = await p(n, e, l);
    try {
      let u = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": l.toString(), "X-Anedya-Signature": y, "Content-Type": "application/json" }, d = await fetch(o, { method: "POST", credentials: "same-origin", headers: u, body: JSON.stringify(n) }), s = new A();
      try {
        let a = await d.json();
        return s.isSuccess = a.success, s.error.errorMessage = a.error, s.error.reasonCode = a.reasonCode, s.isSuccess && (r.length === 1 ? s.data = a.data[r[0]] : s.data = a.data), s;
      } catch {
        return s.isSuccess = false, s.error.errorMessage = d.statusText, s.error.reasonCode = d.status.toString(), s;
      }
    } catch (u) {
      throw console.error("Error during fetch operation:", u), u;
    }
  };
  var B = async (c, e, r, t) => {
    let o = `${c}/data/snapshot`, n = { nodes: r, time: t?.time, variable: t?.variable }, l = Math.floor(Date.now() / 1e3), y = await p(n, e, l);
    try {
      let u = { Authorization: e.authorizationMode, "x-Anedya-SignatureVersion": e.signatureVersion, "X-Anedya-Tokenid": e.tokenId, "X-Anedya-Timestamp": l.toString(), "X-Anedya-Signature": y, "Content-Type": "application/json" }, d = await fetch(o, { method: "POST", credentials: "same-origin", headers: u, body: JSON.stringify(n) }), s = new I();
      try {
        let a = await d.json();
        return s.isSuccess = a.success, s.error.errorMessage = a.error, s.error.reasonCode = a.reasonCode, s.isSuccess && (r.length === 1 ? s.data = a.data.filter((i) => i.node === r[0]) : s.data = a.data, s.count = a.count), s;
      } catch {
        return s.isSuccess = false, s.error.errorMessage = d.statusText, s.error.reasonCode = d.status.toString(), s;
      }
    } catch (u) {
      throw console.error("Error during fetch operation:", u), u;
    }
  };
  var R = class {
    #e;
    #t;
    #r;
    constructor(e, r) {
      let { baseUrl: t, tokenId: o, tokenBytes: n, signatureVersionBytes: l, signatureVersion: y, authorizationMode: u } = e;
      this.#e = r, this.#t = t, this.#r = { tokenId: o, tokenBytes: n, signatureVersion: y, signatureVersionBytes: l, authorizationMode: u };
    }
    getNodeId() {
      return this.#e;
    }
    async getData(e) {
      return await _(this.#t, this.#r, [this.#e], e);
    }
    async getLatestData(e) {
      let r = { variable: e };
      return await G(this.#t, this.#r, [this.#e], r);
    }
    async setKey(e) {
      return await M(this.#t, this.#r, [this.#e], e);
    }
    async getKey(e) {
      return await U(this.#t, this.#r, [this.#e], e);
    }
    async deleteKey(e) {
      return await O(this.#t, this.#r, [this.#e], e);
    }
    async scanKeys(e) {
      return await q(this.#t, this.#r, [this.#e], e);
    }
    async getDeviceStatus(e) {
      return await P(this.#t, this.#r, [this.#e], e);
    }
    async getSnapshot(e) {
      return await B(this.#t, this.#r, [this.#e], e);
    }
  };
  var D = class {
    node;
    streamUrl;
    configHeaders;
    streamId;
    ws = null;
    isConnected = false;
    globalPaused = false;
    destroyed = false;
    reconnectAttempts = 0;
    subCounter = 0;
    variableSubs = [];
    valueStoreSubs = [];
    eventSubs = [];
    errorListeners = [];
    statusListeners = [];
    constructor(e, r, t, o) {
      let { tokenId: n, tokenBytes: l, signatureVersion: y, signatureVersionBytes: u, authorizationMode: d } = e;
      this.node = r, this.streamId = t, this.streamUrl = o, this.configHeaders = { tokenId: n, tokenBytes: l, signatureVersion: y, signatureVersionBytes: u, authorizationMode: d };
    }
    async connect() {
      if (this.isConnected || this.destroyed) return;
      let e = Math.floor(Date.now() / 1e3), r = await p(null, this.configHeaders, e), t = new URL(this.streamUrl);
      t.searchParams.set("Authorization", this.configHeaders.authorizationMode), t.searchParams.set("x-anedya-streamid", this.streamId), t.searchParams.set("x-anedya-tokenid", this.configHeaders.tokenId), t.searchParams.set("x-anedya-signature", r), t.searchParams.set("x-anedya-timestamp", e.toString()), t.searchParams.set("x-anedya-signatureversion", this.configHeaders.signatureVersion), this.ws = new WebSocket(t.toString()), this.ws.binaryType = "arraybuffer", this.ws.onopen = () => {
        this.isConnected = true, this.reconnectAttempts = 0, console.log("\u2705 Stream connected"), this.emitStatus("connected");
      }, this.ws.onmessage = (o) => {
        this.handleRawMessage(new Uint8Array(o.data));
      }, this.ws.onerror = (o) => {
        this.errorListeners.forEach((n) => n(o));
      }, this.ws.onclose = (o) => {
        console.log("WS CLOSED", { code: o.code, reason: o.reason, wasClean: o.wasClean }), this.isConnected = false, this.emitStatus("disconnected"), this.destroyed || this.scheduleReconnect();
      };
    }
    pause() {
      this.globalPaused = true;
    }
    resume() {
      this.globalPaused = false;
    }
    disconnect() {
      this.destroyed = true, this.ws?.close(), this.ws = null, this.isConnected = false;
    }
    onVariable(e, r) {
      let t = { id: this.nextId(), variableId: e, callback: r, paused: false, active: true };
      return this.variableSubs.push(t), this.makeHandle(t);
    }
    onValueStore(e, r) {
      let t = { id: this.nextId(), key: e, callback: r, paused: false, active: true };
      return this.valueStoreSubs.push(t), this.makeHandle(t);
    }
    onEvent(e) {
      let r = { id: this.nextId(), callback: e, paused: false, active: true };
      return this.eventSubs.push(r), this.makeHandle(r);
    }
    onError(e) {
      this.errorListeners.push(e);
    }
    onStatus(e) {
      this.statusListeners.push(e);
    }
    handleRawMessage(e) {
      if (e.length < 4) {
        console.warn("Invalid message: too short");
        return;
      }
      let r = e[0], t = e[1], o = e[2];
      console.log("\u{1F4E5} Raw frame:", Array.from(e).map((n) => n.toString(16).padStart(2, "0")).join(" ")), console.log("Header:", `[0x${r.toString(16)}, 0x${t.toString(16)}]`, "dataType:", o), r === 0 && t === 2 ? (console.log("\u2192 Identified as VALUE STORE, decoding slice(2):", Array.from(e.slice(2)).map((n) => n.toString(16).padStart(2, "0")).join(" ")), this.routeValueStore(e.slice(2))) : r === 0 && t === 1 ? (console.log("\u2192 Identified as VARIABLE, decoding slice(3):", Array.from(e.slice(3)).map((n) => n.toString(16).padStart(2, "0")).join(" ")), this.routeVariableOrEvent(e.slice(3), o)) : console.warn("Unknown message type:", r, t);
    }
    routeValueStore(e) {
      try {
        let r = decode(e), t = { nodeId: r?.ns?.id ? Array.from(r.ns.id).map((o) => o.toString(16).padStart(2, "0")).join("") : void 0, scope: r?.ns?.scope, key: r?.key, value: r?.val, timestamp: r?.ts, type: r?.t };
        if (this.globalPaused) return;
        this.valueStoreSubs.filter((o) => o.active && !o.paused && o.key === t.key).forEach((o) => o.callback(t));
      } catch (r) {
        console.error("\u274C ValueStore decode error:", r);
      }
    }
    routeVariableOrEvent(e, r) {
      try {
        let t = decode(e), o = { nodeId: t?.n ? Array.from(t.n).map((n) => n.toString(16).padStart(2, "0")).join("") : void 0, variable: t?.v, value: t?.d, timestamp: t?.ts, dataType: r };
        if (this.globalPaused) return;
        this.variableSubs.filter((n) => n.active && !n.paused && n.variableId === o.variable).forEach((n) => n.callback(o)), this.eventSubs.filter((n) => n.active && !n.paused).forEach((n) => n.callback(o));
      } catch (t) {
        console.error("Variable decode error:", t);
      }
    }
    scheduleReconnect() {
      if (this.reconnectAttempts >= 5) {
        console.error("\u274C Max reconnect attempts reached");
        return;
      }
      this.reconnectAttempts++, this.emitStatus("reconnecting"), setTimeout(() => this.connect(), 3e3);
    }
    nextId() {
      return `sub_${++this.subCounter}`;
    }
    emitStatus(e) {
      this.statusListeners.forEach((r) => r(e));
    }
    makeHandle(e) {
      return { pause: () => {
        e.paused = true;
      }, resume: () => {
        e.paused = false;
      }, cancel: () => {
        e.active = false;
      } };
    }
  };
  var V = class {
    NewConfig(e, r) {
      return new w(e, r);
    }
    NewClient(e) {
      return new v(e);
    }
    NewNode(e, r) {
      return new R(e, r);
    }
    NewStream(e, r, t, o) {
      return new D(e, r, t, o);
    }
  };
  var z = ((r) => (r.GLOBAL = "global", r.NODE = "node", r))(z || {});
  var X = ((o) => (o.STRING = "string", o.BINARY = "binary", o.FLOAT = "float", o.BOOLEAN = "boolean", o))(X || {});
  var K = { Success: -1, Unknown: 0, Failure: 1, HttpRequestError: 3, HttpRequestTimeout: 4, keyNotFound: 5 };
  function j(c) {
    return Object.fromEntries(Object.entries(K).map(([r, t]) => [t, r]))[c] || "UnknownErrorCode";
  }
  return __toCommonJS(index_exports);
})();
