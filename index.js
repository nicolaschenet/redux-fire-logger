"use strict";
var logger = function (store) { return function (next) { return function (action) {
    console.log('dispatching', action);
    var result = next(action);
    console.log('next state', store.getState());
    return result;
}; }; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logger;
