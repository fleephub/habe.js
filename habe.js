/*
 * habe.js - Lispy expressions for Handlebars templates.
 *
 *      Greenspun's Tenth Rule of Programming: "Any sufficiently complicated
 *      C or Fortran program contains an ad-hoc, informally-specified
 *      bug-ridden slow implementation of half of Common Lisp." 
 *
 * Example:
 *
 *      Usage in s-expr:    {{#if (and a (or b c))}} .. {{/if}}
 *
 *      Usage in tags:      {{or a b}}
 *
 * Create new object
 *
 *      (mklist x y ..)     [x, y, ..]      - Return array made from positional arguments
 *      (mkhash x=1 y=2 ..) {x:1, y:2, ..}  - Return object made from hash arguments
 *
 * Boolean logic
 *
 *      (and x y ...)       x && y          - Returns first falsy or last value
 *      (or x y ...)        x || y          - Returns first truthy or last value 
 *      (not x)             !x              - Reverse boolean value
 *
 * Comparision
 *
 *      (eq x y ...)        x === y         - returns true if all values are equal, false otherwise
 *      (ne x y ...)        x !== y         - returns false if all values are equal, false otherwise
 *
 *      (gt x y ...)        x > y           - returns true if values are in decreasing order
 *      (ge x y ...)        x >= y          - returns true if values are in decreasing or equal order
 *      (lt x y ...)        x < y           - returns true if values are in increasing order
 *      (le x y ...)        x <= y          - returns true if values are in decreasing or equal order
 *
 *      (min x y ...)                       - Returns smallest value
 *      (max x y ...)                       - Returns largest value
 *
 * Arithmetic
 *
 *      (add x y ...)       x + y           - returns sum of values
 *      (sub x y ...)       x - y           - subtract values from first one
 *      (mul x y ...)       x * y           - multiply values together
 *      (div x y ...)       x / y           - divide first values with rest
 *      (neg x)             -x              - negative value
 *
 * Float arithmetic
 *
 *      (abs x)                             - Absolute value
 *      (ceil x)                            - Smallest integer >= x
 *      (floor x)                           - Largest integer <= x
 *      (round x)                           - Nearest integer
 *      (trunc x)                           - Integer part of x
 */

(function (factory) {
    if (typeof define === "function" && define.amd) {    // AMD, RequireJS
        define([], factory);
    } else if (typeof exports === "object") {            // CommonJS, node.js
        module.exports = factory();
    } else {                                             // Browser
        this.habe = factory();
    }
}(function () {

"use strict";

function register(hbenv) {
    var TemplateError = hbenv.Utils.TemplateError;

    // Handlebars.js isEmpty() is buggy, it does not count 0 as falsy.
    //var isEmpty = hbenv.Utils.isEmpty;
    var isArray = hbenv.Utils.isArray;
    var isEmpty = function(o) { return !o || (isArray(o) && !o.length); };

    /*
     * Argument validators.
     */

    function req_args(args, req) {
        var got = args.length - 1;
        if (got !== req)
            throw new TemplateError("Wrong number of arguments to '" + args[got].name + "': got " + got + " expect "+req);
    }

    function min_args(args, min) {
        var got = args.length - 1;
        if (got < min)
            throw new TemplateError("Wrong number of arguments to '" + args[got].name + "': got " + got + " expect at least "+min);
    }

    /*
     * Function generators.
     */

    function wrap_simple(name, func) {
        hbenv.registerHelper(name, function(x) {
            req_args(arguments, 1);
            return func(x);
        });
    }

    function reducer(name, func, success, failure) {
        if (failure == null)
            failure = false;

        hbenv.registerHelper(name, function() {
            var args = arguments, alen = args.length - 1;
            var i, v0 = args[0];
            min_args(args, 2);
            for (i = 1; i < alen; i++) {
                v0 = func(v0, args[i]);
                if (v0 == null)
                    return failure;
            }
            return (success == null) ? v0 : success;
        });
    }

    /*
     * Return arguments as single value.
     */

    /* Return positional args as list */
    hbenv.registerHelper('mklist', function() {
        var i, args = arguments, alen = args.length - 1;
        var res = [];
        for (i = 0; i < alen; i++) {
            res.push(args[i]);
        }
        return res;
    });

    /* Return hash args as object */
    hbenv.registerHelper('mkhash', function() {
        var args = arguments;
        var opts = args[args.length-1];
        return opts.hash;
    });

    /*
     * 'and' and 'or' are special due to return-argument-value behavior.
     */

    hbenv.registerHelper('and', function() {
        var i, v, args = arguments, alen = args.length - 1;
        min_args(arguments, 1);
        for (i = 0; i < alen; i++) {
            v = args[i];
            if (isEmpty(v))
                break;
        }
        return v;
    });

    hbenv.registerHelper('or', function() {
        var i, v, args = arguments, alen = args.length - 1;
        min_args(arguments, 1);
        for (i = 0; i < alen; i++) {
            v = args[i];
            if (!isEmpty(v))
                break;
        }
        return v;
    });

    /*
     * Simple functions
     */

    wrap_simple('not', isEmpty);

    reducer('ne', function(a,b) { return a === b ? a : null; }, false, true);
    reducer('eq', function(a,b) { return a === b ? a : null; }, true, false);

    reducer('gt', function(a,b) { return a > b ? b : null; }, true, false);
    reducer('ge', function(a,b) { return a >= b ? b : null; }, true, false);
    reducer('lt', function(a,b) { return a < b ? b : null; }, true, false);
    reducer('le', function(a,b) { return a <= b ? b : null; }, true, false);

    wrap_simple('neg', function(x) { return -x; });
    reducer('add', function(a,b) { return a + b; });
    reducer('sub', function(a,b) { return a - b; });
    reducer('mul', function(a,b) { return a * b; });
    reducer('div', function(a,b) { return a / b;  });

    reducer('min', function(a,b) { return a <= b ? a : b; });
    reducer('max', function(a,b) { return a >= b ? a : b; });

    wrap_simple('abs', Math.abs);
    wrap_simple('ceil', Math.ceil);
    wrap_simple('floor', Math.floor);
    wrap_simple('round', Math.round);
    wrap_simple('trunc', Math.trunc);
}

return { register: register };

}));

