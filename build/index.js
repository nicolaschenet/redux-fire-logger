"use strict";
var deep_diff_1 = require("deep-diff");
var logger = function (options) {
    if (options === void 0) { options = {}; }
    return function (store) { return function (next) { return function (action) {
        var currentState = store.getState();
        var result = next(action);
        var nextState = store.getState();
        console.log("diff from " + action.type, deep_diff_1.diff(currentState, nextState), options);
        return result;
    }; }; };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logger;
