"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var ramda_1 = require("ramda");
var deep_diff_1 = require("deep-diff");
var defaultOptions = {
    excludedActionTypes: []
};
var log = function (action, currentState, nextState) {
    var timestamp = new Date().getTime();
    var stateDiff = deep_diff_1.diff(currentState, nextState);
    var type = action.type;
    console.log("Redux Fire Logger | Diff from " + type, stateDiff, timestamp);
};
var logger = function (options) { return function (store) { return function (next) { return function (action) {
    options = __assign({}, defaultOptions, options);
    var currentState = store.getState();
    var result = next(action);
    if (ramda_1.contains(action.type, options.excludedActionTypes)) {
        return result;
    }
    log(action, currentState, store.getState());
    return result;
}; }; }; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logger;
