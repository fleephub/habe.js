/*globals test, habe, poirot, Handlebars, require */

(function (Poirot, Handlebars, habe) {
'use strict';

function run_env_tests(env) {

    function render(tmpl, data) {
        return env.compile(tmpl)(data);
    }

    test('mklist', function(assert) {
        assert.equal(render('{{#each (mklist 1)}}{{.}},{{/each}}'), '1,');
        assert.equal(render('{{#each (mklist 1 "x" false)}}{{.}},{{/each}}'), '1,x,false,');
    });

    test('mkhash', function(assert) {
        assert.equal(render('{{#with (mkhash a="A" b="B")}}{{a}},{{b}}{{/with}}'), 'A,B');
    });

    test('not', function(assert) {
        assert.equal(render('{{not 1}}'), 'false');
        assert.equal(render('{{not false}}'), 'true');
        assert.equal(render('{{not (not val)}}', {val: 5}), 'true');
    });

    test('or', function(assert) {
        assert.equal(render('{{or "" 1}}'), '1');
        assert.equal(render('{{or 1 ""}}'), '1');
        assert.equal(render('{{or 0 0 1}}'), '1');
        assert.equal(render('{{or 0 0 1 0}}'), '1');
        assert.equal(render('{{or false 0}}'), '0');
        assert.equal(render('{{or 0 false}}'), 'false');
    });

    test('and', function(assert) {
        assert.equal(render('{{and 0 1}}'), '0');
        assert.equal(render('{{and 1 0}}'), '0');
        assert.equal(render('{{and 1 2}}'), '2');
        assert.equal(render('{{and 1 2}}'), '2');
        assert.equal(render('{{and 1 2 3}}'), '3');
        assert.equal(render('{{and 1 2 0}}'), '0');
        assert.equal(render('{{and false 2 0}}'), 'false');
        assert.equal(render('{{and 1 undef 0}}', {}), '');
    });

    test('add', function(assert) {
        assert.equal(render('{{add 0 1 2}}'), '3');
        assert.equal(render('{{add -1 -2}}'), '-3');
    });

    test('sub', function(assert) {
        assert.equal(render('{{sub 3 1}}'), '2');
        assert.equal(render('{{sub 7 2 1}}'), '4');
    });

    test('mul', function(assert) {
        assert.equal(render('{{mul 2 3}}'), '6');
        assert.equal(render('{{mul 2 5 3}}'), '30');
    });

    test('div', function(assert) {
        assert.equal(render('{{div 6 2}}'), '3');
        assert.equal(render('{{div 24 2 3}}'), '4');
    });

    test('neg', function(assert) {
        assert.equal(render('{{neg 6}}'), '-6');
        assert.equal(render('{{neg -2}}'), '2');
    });

    test('eq', function(assert) {
        assert.equal(render('{{eq 1 2}}'), 'false');
        assert.equal(render('{{eq 1 1}}'), 'true');
        assert.equal(render('{{eq 1 1 1}}'), 'true');
        assert.equal(render('{{eq 1 1 2}}'), 'false');
        assert.equal(render('{{eq 1 undef 2}}', {}), 'false');
        assert.equal(render('{{eq "x" "x"}}', {}), 'true');
    });

    test('ne', function(assert) {
        assert.equal(render('{{ne 1 2}}'), 'true');
        assert.equal(render('{{ne 1 1}}'), 'false');
        assert.equal(render('{{ne 1 1 1}}'), 'false');
        assert.equal(render('{{ne 1 1 2}}'), 'true');
        assert.equal(render('{{ne 1 undef 2}}', {}), 'true');
        assert.equal(render('{{ne "x" "x"}}'), 'false');
    });

    test('gt', function(assert) {
        assert.equal(render('{{gt 1 2}}'), 'false');
        assert.equal(render('{{gt 2 1}}'), 'true');
        assert.equal(render('{{gt 2 1 0}}'), 'true');
        assert.equal(render('{{gt 2 1 1}}'), 'false');
    });

    test('ge', function(assert) {
        assert.equal(render('{{ge 1 2}}'), 'false');
        assert.equal(render('{{ge 2 1}}'), 'true');
        assert.equal(render('{{ge 1 1 1}}'), 'true');
        assert.equal(render('{{ge 2 1 2}}'), 'false');
    });

    test('lt', function(assert) {
        assert.equal(render('{{lt 1 2}}'), 'true');
        assert.equal(render('{{lt 2 1}}'), 'false');
        assert.equal(render('{{lt 0 1 2}}'), 'true');
        assert.equal(render('{{lt 0 1 0}}'), 'false');
    });

    test('le', function(assert) {
        assert.equal(render('{{le 1 2}}'), 'true');
        assert.equal(render('{{le 2 1}}'), 'false');
        assert.equal(render('{{le 1 1 1}}'), 'true');
        assert.equal(render('{{le 2 3 2}}'), 'false');
    });

    test('min', function(assert) {
        assert.equal(render('{{min 1 2}}'), '1');
        assert.equal(render('{{min 2 1}}'), '1');
        assert.equal(render('{{min "x" "a" "z"}}'), 'a');
    });

    test('max', function(assert) {
        assert.equal(render('{{max 1 2}}'), '2');
        assert.equal(render('{{max 2 1}}'), '2');
        assert.equal(render('{{max "x" "a" "z"}}'), 'z');
    });
}

var env = Poirot.create();
habe.register(env);
run_env_tests(env);

env = Handlebars.create();
habe.register(env);
run_env_tests(env);

})(typeof poirot !== 'undefined' ? poirot : require('./other/poirot.js'),
  (typeof Handlebars !== 'undefined' ? Handlebars : require('./other/handlebars.js')),
  (typeof habe !== 'undefined' ? habe : require('./habe.js')));

