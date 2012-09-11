// Copyright (c) 2012 Joshua R. Rodgers
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
"use strict";
var assert = require("assert");
var e = require('../src/enumerable.js');

module.exports = {
    "Test - forEach": function () {
        var expected = [1, 2, 3, 4, 5];
        var enumerable = new e.Enumerable(expected);
        var count = 0;

        enumerable.forEach(function (item) {
            assert.notEqual(expected.indexOf(item), -1);
            count++;
        });

        assert.equal(count, expected.length);
    },

    "Test - lazy evaluation": function () {
        var expected = [1, 2, 3, 4, 5];
        var enumerable = new e.Enumerable(expected);
        expected.push(6);
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - ensure iteration of same source at the same time works.": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = [
            [1, 2, 3, 4, 5],
            [1, 2, 3, 4, 5],
            [1, 2, 3, 4, 5],
            [1, 2, 3, 4, 5],
            [1, 2, 3, 4, 5]
        ];
        var actual = [];

        enumerable.forEach(function () {
            actual.push(enumerable.toArray());
        });

        assert.deepEqual(actual, expected);
    },

    "Test - input is not an array": function () {
        assert.throws(function () {
            new e.Enumerable({});
        });
    },

    "Test - toArray": function () {
        var expected = [1, 2, 3, 4, 5];
        var enumerable = new e.Enumerable(expected);
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - toArray (empty enumerable)": function () {
        var expected = [];
        var enumerable = new e.Enumerable([]);
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - toLookup": function () {
        var source = [1, 1, 1, 2, 3, 2, 4, 4];
        var enumerable = new e.Enumerable(source);
        var expected = {
            "1": [1, 1, 1],
            "2": [2, 2],
            "3": [3],
            "4": [4, 4]
        };
        var actual = enumerable.toLookup(function (item) {
            return item.toString();
        });

        for (var key in actual) {
            actual[key] = actual[key].toArray();
        }

        assert.deepEqual(actual, expected);
    },

    "Test - toLookup (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = {};
        var actual = enumerable.toLookup(function (item) {
            return item.toString();
        });

        assert.deepEqual(actual, expected);
    },

    "Test - toKeyValueEnumerable": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).toKeyValueEnumerable(function (item) {
            return item.toString();
        }, function (item) {
            return item;
        });
        var expected = [{
            key: '1',
            value: 1
        }, {
            key: '2',
            value: 2
        }, {
            key: '3',
            value: 3
        }, {
            key: '4',
            value: 4
        }, {
            key: '5',
            value: 5
        }];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - toKeyValueEnumerable (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).toKeyValueEnumerable(function (item) {
            return item.toString();
        }, function (item) {
            return item;
        });
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - toObject": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).toKeyValueEnumerable(function (item) {
            return item.toString();
        }, function (item) {
            return item;
        });
        var expected = {
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5
        };
        var actual = enumerable.toObject();

        assert.deepEqual(actual, expected);
    },

    "Test - toObject (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).toKeyValueEnumerable(function (item) {
            return item.toString();
        }, function (item) {
            return item;
        });
        var expected = {};
        var actual = enumerable.toObject();

        assert.deepEqual(actual, expected);
    },

    "Test - fold": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);

        var expected = 15;
        var actual = enumerable.fold(0, function (current, next) {
            return current + next;
        });

        assert.equal(actual, expected);
    },

    "Test - filter": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).filter(function (item) {
            return item % 2 === 0;
        });
        var expected = [2, 4, 6, 8, 10];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - filter (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).filter(function (item) {
            return item;
        });
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - map": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).map(function (item) {
            return item * 2;
        });
        var expected = [2, 4, 6, 8, 10];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - map (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).map(function (item) {
            return item;
        });
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - first": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = 1;
        var actual = enumerable.first();

        assert.equal(actual, expected);
    },

    "Test - first (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = undefined;
        var actual = enumerable.first();

        assert.equal(actual, expected);
    },

    "Test - last": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = 5;
        var actual = enumerable.last();

        assert.equal(actual, expected);
    },

    "Test - last (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = undefined;
        var actual = enumerable.last();

        assert.equal(actual, expected);
    },

    "Test - first (with predicate)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = 2;
        var actual = enumerable.first(function (item) {
            return item % 2 === 0;
        });

        assert.equal(actual, expected);
    },

    "Test - last (with predicate)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = 4;
        var actual = enumerable.last(function (item) {
            return item % 2 === 0;
        });

        assert.equal(actual, expected);
    },

    "Test - count": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = 5;
        var actual = enumerable.count();

        assert.equal(actual, expected);
    },

    "Test - count (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = 0;
        var actual = enumerable.count();

        assert.equal(actual, expected);
    },

    "Test - reverse": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = [5, 4, 3, 2, 1];
        var actual = enumerable.reverse().toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - reverse (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = [];
        var actual = enumerable.reverse().toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - filter (reversed enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5, 6]);
        var expected = [6, 4, 2];
        var actual = enumerable.reverse().filter(function (item) {
            return item % 2 === 0;
        }).toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - reverse (lazy evaluation)": function () {
        var source = [1, 2, 3, 4, 5];
        var enumerable = new e.Enumerable(source);
        var expected = [1, 2, 3, 4, 5, 6];

        source.push(6);
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - anyMatch (with match)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = true;
        var actual = enumerable.anyMatch(function (item) {
            return item === 3;
        });

        assert.equal(actual, expected);
    },

    "Test - anyMatch (without match)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = false;
        var actual = enumerable.anyMatch(function (item) {
            return item === 6;
        });

        assert.equal(actual, expected);
    },

    "Test - anyMatch (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = false;
        var actual = enumerable.anyMatch(function (item) {
            return item === 3;
        });

        assert.equal(actual, expected);
    },

    "Test - allMatch (with match)": function () {
        var enumerable = new e.Enumerable([2, 4, 6, 8, 10]);
        var expected = true;
        var actual = enumerable.allMatch(function (item) {
            return item % 2 === 0;
        });

        assert.equal(actual, expected);
    },

    "Test - allMatch (without match)": function () {
        var enumerable = new e.Enumerable([1, 3, 5, 7]);
        var expected = false;
        var actual = enumerable.allMatch(function (item) {
            return item % 2 === 0;
        });

        assert.equal(actual, expected);
    },

    "Test - allMatch (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = true;
        var actual = enumerable.allMatch(function (item) {
            return item % 2 === 0;
        });

        assert.equal(actual, expected);
    },

    "Test - allMatch (with partial match)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = false;
        var actual = enumerable.allMatch(function (item) {
            return item % 2 === 0;
        });

        assert.equal(actual, expected);
    },

    "Test - isEmpty (non-empty enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = false;
        var actual = enumerable.isEmpty();

        assert.equal(actual, expected);
    },

    "Test - isEmpty (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = true;
        var actual = enumerable.isEmpty();

        assert.equal(actual, expected);
    },

    "Test - empty": function () {
        var enumerable = new e.Enumerable([]);

        assert.equal(enumerable.isEmpty(), true);
    },

    "Test - append": function () {
        var enumerable = new e.Enumerable([1, 2]).append([3, 4, 5]);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (empty enumerable on left)": function () {
        var enumerable = new e.Enumerable([]).append([1, 2, 3, 4, 5]);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (empty enumerable on right)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).append([]);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (many enumerables)": function () {
        var enumerable = new e.Enumerable([1, 2]).append([3, 4]).append([5]);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (many enumerables with empty enumerable in middle)": function () {
        var enumerable = new e.Enumerable([1, 2, 3]).append([]).append([4, 5]);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (two empty enumerables)": function () {
        var enumerable = new e.Enumerable([]).append([]);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (many empty enumerables)": function () {
        var enumerable = new e.Enumerable([]).append([]).append([]);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - append (lazy evaulation)": function () {
        var leftSource = [1, 2];
        var rightSource = [4];
        var enumerable = new e.Enumerable(leftSource).append(rightSource);

        leftSource.push(3);
        rightSource.push(5);

        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - flatten": function () {
        var enumerable = new e.Enumerable([
            [1, 2],
            [3, 4],
            [5]
        ]).flatten(function (item) {
            return item;
        });
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - flatten (object hierarchy)": function () {
        var enumerable = new e.Enumerable([{
            values: [1, 2]
        }, {
            values: [3, 4]
        }, {
            values: [5]
        }]).flatten(function (item) {
            return item.values;
        });
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - flatten (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).flatten(function () {});
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - flatten (lazy evaulation)": function () {
        var source = [
            [1, 2],
            [3, 4],
            [5, 6]
        ];
        var enumerable = new e.Enumerable(source).flatten(function (item) {
            return item;
        });
        var expected = [1, 2, 3, 4, 5, 6, 7, 8];

        source.push([7, 8]);

        var firstActual = enumerable.toArray();
        var secondActual = enumerable.toArray();

        assert.deepEqual(firstActual, expected);
        assert.deepEqual(secondActual, expected);
    },

    "Test - skip": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).skip(2);
        var expected = [3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - skip (total in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).skip(5);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - skip (more than in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).skip(6);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - skip (0 in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).skip(0);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - skip (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).skip(1);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - skip (with predicate)": function () {
        var enumerable = new e.Enumerable([2, 2, 3, 4, 2, 2]).skip(function (item) {
            return item === 2;
        });
        var expected = [3, 4, 2, 2];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - skip (with predicate on empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).skip(function (item) {
            return item === 2;
        });
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).take(3);
        var expected = [1, 2, 3];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take (total in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).take(5);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take (more than in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).take(6);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take (0 from enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]).take(0);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).skip(2);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take (with predicate)": function () {
        var enumerable = new e.Enumerable([2, 2, 3, 4, 2, 2]).take(function (item) {
            return item == 2;
        });
        var expected = [2, 2];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - take (with predicate on empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).take(function (item) {
            return item == 2;
        });
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - contains (item is in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = true;
        var actual = enumerable.contains(3);

        assert.equal(actual, expected);
    },

    "Test - contains (item is not in enumerable)": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var expected = false;
        var actual = enumerable.contains(6);

        assert.equal(actual, expected);
    },

    "Test - contains (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = false;
        var actual = enumerable.contains(3);

        assert.equal(actual, expected);
    },

    "Test - contains (function search)": function () {
        var enumerable = new e.Enumerable([{
            value: 1
        }, {
            value: 2
        }, {
            value: 3
        }, {
            value: 4
        }, {
            value: 5
        }]);
        var expected = true;
        var actual = enumerable.contains(function (item) {
            return item.value === 3;
        });

        assert.equal(actual, expected);
    },

    "Test - group": function () {
        var enumerable = new e.Enumerable([1, 2, 2, 3, 3, 3, 4, 4, 4, 4]).group(function (item) {
            return item;
        });

        var expected = [{
            key: 1,
            value: [1]
        }, {
            key: 2,
            value: [2, 2]
        }, {
            key: 3,
            value: [3, 3, 3]
        }, {
            key: 4,
            value: [4, 4, 4, 4]
        }];
        var actual = enumerable.toArray();

        for (var index = 0; index < actual.length; ++index) {
            actual[index].value = actual[index].value.toArray();
        }

        assert.deepEqual(actual, expected);
    },

    "Test - group (string key)": function () {
        var enumerable = new e.Enumerable([{
            name: "test",
            value: 1
        }, {
            name: "test2",
            value: 3
        }, {
            name: "test",
            value: 2
        }]).group("name");

        var expected = [{
            key: "test",
            value: [{
                name: "test",
                value: 1
            }, {
                name: "test",
                value: 2
            }]
        }, {
            key: "test2",
            value: [{
                name: "test2",
                value: 3
            }]
        }];
        var actual = enumerable.toArray();

        for (var index = 0; index < actual.length; ++index) {
            actual[index].value = actual[index].value.toArray();
        }

        assert.deepEqual(actual, expected);
    },

    "Test - group (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).group(function (item) {
            return item;
        });
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - group (value selector)": function () {
        var enumerable = new e.Enumerable([1, 2, 2, 3, 3, 3, 4, 4, 4, 4]).group(function (item) {
            return item;
        }, function (item) {
            return item * 2;
        });

        var expected = [{
            key: 1,
            value: [2]
        }, {
            key: 2,
            value: [4, 4]
        }, {
            key: 3,
            value: [6, 6, 6]
        }, {
            key: 4,
            value: [8, 8, 8, 8]
        }];
        var actual = enumerable.toArray();

        for (var index = 0; index < actual.length; ++index) {
            actual[index].value = actual[index].value.toArray();
        }

        assert.deepEqual(actual, expected);
    },

    "Test - group (result selector)": function () {
        var enumerable = new e.Enumerable([1, 2, 2, 3, 3, 3, 4, 4, 4, 4]).group(function (item) {
            return item;
        }, function (key, value) {
            return key + ': ' + value.toArray().join(', ');
        });

        var expected = ['1: 1', '2: 2, 2', '3: 3, 3, 3', '4: 4, 4, 4, 4'];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join": function () {
        var outerEnumerable = new e.Enumerable([5, 3, 2]);
        var innerEnumerable = new e.Enumerable(['house', 'cat', 'hi', 'bat', 'rat', 'mouse']);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = ['5: house', '5: mouse', '3: cat', '3: bat', '3: rat', '2: hi'];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join (outer empty)": function () {
        var outerEnumerable = new e.Enumerable([]);
        var innerEnumerable = new e.Enumerable(['house', 'cat', 'hi', 'bat', 'rat', 'mouse']);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join (inner empty)": function () {
        var outerEnumerable = new e.Enumerable([5, 3, 2]);
        var innerEnumerable = new e.Enumerable([]);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join (both empty)": function () {
        var outerEnumerable = new e.Enumerable([]);
        var innerEnumerable = new e.Enumerable([]);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join (outer has extra keys)": function () {
        var outerEnumerable = new e.Enumerable([7, 5, 3, 2]);
        var innerEnumerable = new e.Enumerable(['house', 'cat', 'hi', 'bat', 'rat', 'mouse']);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = ['5: house', '5: mouse', '3: cat', '3: bat', '3: rat', '2: hi'];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join (inner has extra keys)": function () {
        var outerEnumerable = new e.Enumerable([5, 3, 2]);
        var innerEnumerable = new e.Enumerable(['house', 'cat', 'hi', 'bat', 'rat', 'mouse', 'aardvark']);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = ['5: house', '5: mouse', '3: cat', '3: bat', '3: rat', '2: hi'];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - join (both have extra keys)": function () {
        var outerEnumerable = new e.Enumerable([7, 5, 3, 2]);
        var innerEnumerable = new e.Enumerable(['house', 'cat', 'hi', 'bat', 'rat', 'mouse', 'bear']);
        var enumerable = outerEnumerable.join(innerEnumerable, function (item) {
            return item;
        }, function (item) {
            return item.length;
        }, function (outer, inner) {
            return outer + ': ' + inner;
        });

        var expected = ['5: house', '5: mouse', '3: cat', '3: bat', '3: rat', '2: hi'];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort": function () {
        var enumerable = new e.Enumerable([3, 5, 2, 4, 1]).sort(function (item) {
            return item;
        });
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort (descending)": function () {
        var enumerable = new e.Enumerable([3, 5, 2, 4, 1]).sort(function (item) {
            return item;
        }, 'DESC');
        var expected = [5, 4, 3, 2, 1];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]).sort(function (item) {
            return item;
        }, false);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort (lazy evaluation)": function () {
        var source = [3, 5, 2, 4, 1];
        var enumerable = new e.Enumerable(source).sort(function (item) {
            return item;
        });
        source.push(6);

        var expected = [1, 2, 3, 4, 5, 6];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort (objects, no comparer)": function () {
        var enumerable = new e.Enumerable([{
            value: 3
        }, {
            value: 5
        }, {
            value: 1
        }]).sort(function (item) {
            return item.value;
        });
        var expected = [{
            value: 1
        }, {
            value: 3
        }, {
            value: 5
        }];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort (objects, comparer)": function () {
        var enumerable = new e.Enumerable([{
            value: 3
        }, {
            value: 5
        }, {
            value: 1
        }]).sort(function (item) {
            return item.value;
        }, function (left, right) {
            return left === right ? 0 : (left > right ? 1 : -1);
        });

        var expected = [{
            value: 1
        }, {
            value: 3
        }, {
            value: 5
        }];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - sort (objects, descending, comparer)": function () {
        var enumerable = new e.Enumerable([{
            value: 3
        }, {
            value: 5
        }, {
            value: 1
        }]).sort(function (item) {
            return item.value;
        }, 'DESC', function (left, right) {
            return left === right ? 0 : (left > right ? 1 : -1);
        });

        var expected = [{
            value: 5
        }, {
            value: 3
        }, {
            value: 1
        }];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - subsort (objects)": function () {
        var enumerable = new e.Enumerable([{
            x: 5,
            y: 3
        }, {
            x: 5,
            y: 2
        }, {
            x: 3,
            y: 2
        }, {
            x: 3,
            y: 1
        }, {
            x: 5,
            y: 1
        }]);
        var sorted = enumerable.sort(function (item) {
            return item.x;
        }).subsort(function (item) {
            return item.y;
        });
        var expected = [{
            x: 3,
            y: 1
        }, {
            x: 3,
            y: 2
        }, {
            x: 5,
            y: 1
        }, {
            x: 5,
            y: 2
        }, {
            x: 5,
            y: 3
        }];
        var actual = sorted.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - subsort (objects, descending)": function () {
        var enumerable = new e.Enumerable([{
            x: 5,
            y: 3
        }, {
            x: 5,
            y: 2
        }, {
            x: 3,
            y: 2
        }, {
            x: 3,
            y: 1
        }, {
            x: 5,
            y: 1
        }]);
        var sorted = enumerable.sort(function (item) {
            return item.x;
        }).subsort(function (item) {
            return item.y;
        }, 'DESC');
        var expected = [{
            x: 3,
            y: 2
        }, {
            x: 3,
            y: 1
        }, {
            x: 5,
            y: 3
        }, {
            x: 5,
            y: 2
        }, {
            x: 5,
            y: 1
        }];
        var actual = sorted.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - subsort (objects - lazy evaluation)": function () {
        var source = [{
            x: 5,
            y: 3
        }, {
            x: 5,
            y: 2
        }, {
            x: 3,
            y: 2
        }, {
            x: 3,
            y: 1
        }, {
            x: 5,
            y: 1
        }];
        var enumerable = new e.Enumerable(source);
        var sorted = enumerable.sort(function (item) {
            return item.x;
        }).subsort(function (item) {
            return item.y;
        });

        source.push({
            x: 6,
            y: 6
        });

        var expected = [{
            x: 3,
            y: 1
        }, {
            x: 3,
            y: 2
        }, {
            x: 5,
            y: 1
        }, {
            x: 5,
            y: 2
        }, {
            x: 5,
            y: 3
        }, {
            x: 6,
            y: 6
        }];
        var actual = sorted.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - distinct": function () {
        var enumerable = new e.Enumerable([1, 2, 3, 4, 5, 2, 3, 4, 5, 3, 4, 5, 4, 5, 5]).distinct();
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - distinct (empty enumerable)": function () {
        var enumerable = new e.Enumerable([]);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.range": function () {
        var enumerable = e.Enumerable.range(1, 5);
        var expected = [1, 2, 3, 4, 5];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.range (evaluated twice)": function () {
        var enumerable = e.Enumerable.range(1, 5);
        var expected = [1, 2, 3, 4, 5];
        var firstActual = enumerable.toArray();
        var secondActual = enumerable.toArray();

        assert.deepEqual(firstActual, expected);
        assert.deepEqual(secondActual, expected);
    },

    "Test - Enumerable.range (start = 0, count = 0)": function () {
        var enumerable = e.Enumerable.range(0, 0);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.range (start = -5, count = 5)": function () {
        var enumerable = e.Enumerable.range(-5, 5);
        var expected = [-5, -4, -3, -2, -1];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.repeat": function () {
        var enumerable = e.Enumerable.repeat('a', 5);
        var expected = ['a', 'a', 'a', 'a', 'a'];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.repeat (value = 'a', count = 0)": function () {
        var enumerable = e.Enumerable.repeat('a', 0);
        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip": function () {
        var leftEnumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var rightEnumerable = leftEnumerable.reverse();
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        var expected = [
            [1, 5],
            [2, 4],
            [3, 3],
            [4, 2],
            [5, 1]
        ];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip (lazy evaluation)": function () {
        var source = [1, 2, 3, 4, 5];
        var leftEnumerable = new e.Enumerable(source);
        var rightEnumerable = leftEnumerable.reverse();
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        source.push(6);

        var expected = [
            [1, 6],
            [2, 5],
            [3, 4],
            [4, 3],
            [5, 2],
            [6, 1]
        ];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip (left is longer)": function () {
        var leftEnumerable = new e.Enumerable([1, 2, 3, 4, 5, 6]);
        var rightEnumerable = new e.Enumerable([5, 4, 3, 2, 1]);
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        var expected = [
            [1, 5],
            [2, 4],
            [3, 3],
            [4, 2],
            [5, 1]
        ];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip (right is longer)": function () {
        var leftEnumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var rightEnumerable = new e.Enumerable([6, 5, 4, 3, 2, 1]);
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        var expected = [
            [1, 6],
            [2, 5],
            [3, 4],
            [4, 3],
            [5, 2]
        ];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip (left is empty)": function () {
        var leftEnumerable = new e.Enumerable([]);
        var rightEnumerable = new e.Enumerable([5, 4, 3, 2, 1]);
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip (right is empty)": function () {
        var leftEnumerable = new e.Enumerable([1, 2, 3, 4, 5]);
        var rightEnumerable = new e.Enumerable([]);
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    },

    "Test - Enumerable.zip (both are empty)": function () {
        var leftEnumerable = new e.Enumerable([]);
        var rightEnumerable = new e.Enumerable([]);
        var enumerable = e.Enumerable.zip(leftEnumerable, rightEnumerable);

        var expected = [];
        var actual = enumerable.toArray();

        assert.deepEqual(actual, expected);
    }
};