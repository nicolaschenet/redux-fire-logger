"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var firebase = require("firebase");
var ramda_1 = require("ramda");
var deep_diff_1 = require("deep-diff");
var FirebaseLogger = (function () {
    function FirebaseLogger(options) {
        this.isAuthenticating = false;
        this.diffQueue = [];
        this.defaultOptions = {
            excludedActionTypes: []
        };
        this.firebaseConfig = {
            apiKey: "AIzaSyAMIV5C-DrRtkPDp7Wmro1WBbYuO2r5pcc",
            authDomain: "redux-fire-logger.firebaseapp.com",
            databaseURL: "https://redux-fire-logger.firebaseio.com",
            storageBucket: "redux-fire-logger.appspot.com",
            messagingSenderId: "346018339012"
        };
        this.options = __assign({}, this.defaultOptions, options);
        firebase.initializeApp(this.firebaseConfig);
    }
    Object.defineProperty(FirebaseLogger.prototype, "db", {
        get: function () {
            return firebase.database();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseLogger.prototype, "fbUser", {
        get: function () {
            return firebase.auth().currentUser;
        },
        enumerable: true,
        configurable: true
    });
    FirebaseLogger.prototype.log = function (action, currentState, nextState) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, stateDiff, type, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timestamp = new Date().getTime();
                        stateDiff = deep_diff_1.diff(currentState, nextState);
                        type = action.type;
                        this.diffQueue = ramda_1.append({
                            action: action,
                            timestamp: timestamp,
                            stateDiff: stateDiff
                        }, this.diffQueue);
                        if (this.isAuthenticating) {
                            console.log('redux-fire-logger | isAuthenticating...');
                            return [2 /*return*/];
                        }
                        if (firebase.auth().currentUser) {
                            console.log('redux-fire-logger | Instant flush !');
                            return [2 /*return*/, this.flush()];
                        }
                        console.log('redux-fire-logger | Begin user authentication...');
                        return [4 /*yield*/, this.auth()];
                    case 1:
                        user = _a.sent();
                        console.log('redux-fire-logger | User authenticated !', user);
                        console.log('redux-fire-logger | After auth flush !');
                        this.flush();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirebaseLogger.prototype.flush = function () {
        while (this.diffQueue.length !== 0) {
            var data = ramda_1.head(this.diffQueue.splice(0, 1));
            fetch('http://localhost:3000/logs', {
                method: 'post',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(data)
            });
            console.log('Logging element', data, JSON.stringify(data), this.fbUser.uid);
            this.flush();
        }
    };
    FirebaseLogger.prototype.startLogger = function () {
        var _this = this;
        return function (store) { return function (next) { return function (action) {
            var currentState = store.getState();
            var result = next(action);
            if (ramda_1.contains(action.type, _this.options.excludedActionTypes)) {
                return result;
            }
            _this.log(action, currentState, store.getState());
            return result;
        }; }; };
    };
    FirebaseLogger.prototype.auth = function () {
        var _this = this;
        this.isAuthenticating = true;
        return new firebase.Promise(function (resolve, reject) {
            firebase.auth().signInAnonymously()
                .then(function (user) {
                _this.isAuthenticating = false;
                resolve(user);
            })
                .catch(function (error) {
                _this.isAuthenticating = false;
                reject(error);
            });
        });
    };
    return FirebaseLogger;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FirebaseLogger;
