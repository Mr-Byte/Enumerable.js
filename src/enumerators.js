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

var enumerable = enumerable || {};

(function (exports) {
    exports.enumerators = {};

    /**
     * Creates a factory for generating basic enumerators for a given source (an array).
     * The enumerators generated by this factory enable basic enumerator semantics.
     */
    exports.enumerators.EnumeratorFactory = (function () {
        var EnumeratorFactory = function (source) {
                if (!(source instanceof Array)) {
                    throw {
                        name: "EnumeratorFactorySourceTypeMismatchException",
                        message: "The given source type for this enumerator is not an instance of Array."
                    };
                }

                this.create = function () {
                    var _source = source;
                    var _position = -1;
                    var _keys = Object.keys(_source);
                    var _length = _keys.length;

                    return {
                        moveNext: function () {
                            return ++_position < _length;
                        },

                        current: function () {
                            return _source[_keys[_position]];
                        }
                    };
                };
            };

        EnumeratorFactory.prototype.toLookupTable = function (keySelector, valueSelector) {
            var result = {};

            valueSelector = typeof valueSelector === 'function' ? valueSelector : function (item) {
                return item;
            };

            var enumerator = this.create();

            while (enumerator.moveNext()) {
                var current = valueSelector(enumerator.current());
                var key = keySelector(enumerator.current());

                if (result.hasOwnProperty(key)) {
                    result[key].push(current);
                }
                else {
                    result[key] = [current];
                }
            }

            return result;
        };

        return EnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results upon enumeration are key/value pairs.
     */
    exports.enumerators.KeyValueEnumeratorFactory = (function () {
        var KeyValueEnumeratorFactory = function (source) {

                if (typeof source !== 'object') {
                    throw {
                        name: 'EnumeratorFactorySourceTypeMismatchException',
                        message: 'The given source type for this enumerator is not an object'
                    };
                }

                this.create = function () {
                    var _source = source;
                    var _keys = Object.keys(_source);
                    var _position = -1;
                    var _length = _keys.length;

                    return {
                        moveNext: function () {
                            return ++_position < _length;
                        },

                        current: function () {
                            return {
                                key: _keys[_position],
                                value: _source[_keys[_position]]
                            };
                        }
                    };
                };
            };

        KeyValueEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return KeyValueEnumeratorFactory;
    })();

    /**
     *  Creates a factory for creating enumerators whose results are filtered such that only those elements matching the predicate are returned.
     */
    exports.enumerators.FilterEnumeratorFactory = (function () {
        var FilterEnumeratorFactory = function (source, predicate) {

                this.create = function () {
                    var _source = (source.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? source.enumeratorFactory : new exports.enumerators.EnumeratorFactory(source)).create();
                    var _predicate = predicate;

                    return {
                        moveNext: function () {
                            if (_source.moveNext()) {
                                if (_predicate(_source.current())) {
                                    return true;
                                }

                                while (_source.moveNext()) {
                                    if (_predicate(_source.current())) {
                                        return true;
                                    }
                                }

                                return false;
                            }
                            else {
                                return false;
                            }
                        },

                        current: function () {
                            return _source.current();
                        }
                    };
                };
            };

        FilterEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return FilterEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are projected to another form as returned by the mapper function.
     */
    exports.enumerators.MapEnumeratorFactory = (function () {
        var MapEnumeratorFactory = function (source, mapper) {
                this.create = function () {
                    var _mapper = mapper;
                    var _source = (source.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? source.enumeratorFactory : new exports.enumerators.EnumeratorFactory(source)).create();

                    return {
                        moveNext: function () {
                            return _source.moveNext();
                        },

                        current: function () {
                            return _mapper(_source.current());
                        }
                    };
                };
            };

        MapEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return MapEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are the reversed order of the source.
     */
    exports.enumerators.ReverseEnumeratorFactory = (function () {
        var ReverseEnumeratorFactory = function (source) {

                this.create = function () {
                    var _source = (source.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? source.enumeratorFactory : new exports.enumerators.EnumeratorFactory(source)).create();
                    var _reverseReady = false;
                    var _itemStack = [];
                    var _current;

                    return {
                        moveNext: function () {
                            if (!_reverseReady) {
                                if (_source.moveNext()) {
                                    _itemStack.push(_source.current());

                                    while (_source.moveNext()) {
                                        _itemStack.push(_source.current());
                                    }
                                }
                                else {
                                    return false;
                                }

                                _reverseReady = true;
                            }

                            var currentSize = _itemStack.length;
                            _current = _itemStack.pop();
                            return currentSize > 0;
                        },

                        current: function () {
                            return _current;
                        }
                    };
                };
            };

        ReverseEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return ReverseEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are the results of the right side appended to the end of the left side.
     */
    exports.enumerators.AppendEnumeratorFactory = (function () {
        var AppendEnumeratorFactory = function (left, right) {

                this.create = function () {
                    var _current;
                    var _left = (left.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? left.enumeratorFactory : new exports.enumerators.EnumeratorFactory(left)).create();
                    var _right = (right.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? right.enumeratorFactory : new exports.enumerators.EnumeratorFactory(right)).create();

                    return {
                        moveNext: function () {
                            if (_left.moveNext()) {
                                _current = _left.current();
                                return true;
                            }
                            else if (_right.moveNext()) {
                                _current = _right.current();
                                return true;
                            }

                            return false;
                        },

                        current: function () {
                            return _current;
                        }
                    };
                };
            };

        AppendEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return AppendEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are only those items remaining after the predicate is first computed to be true.
     */
    exports.enumerators.SkipEnumeratorFactory = (function () {
        var SkipEnumeratorFactory = function (source, predicate) {

                this.create = function () {
                    var _source = source.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? source.enumeratorFactory.create() : new exports.enumerators.EnumeratorFactory(source).create();
                    var _done = false;

                    return {
                        moveNext: function () {
                            while (!_done && _source.moveNext()) {
                                if (predicate(_source.current())) {
                                    continue;
                                }
                                else {
                                    _done = true;
                                    return true;
                                }
                            }

                            return _source.moveNext();
                        },

                        current: function () {
                            return _source.current();
                        }
                    };
                };
            };

        SkipEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return SkipEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are all items prior to the predicate failing.
     */
    exports.enumerators.TakeEnumeratorFactory = (function () {
        var TakeEnumeratorFactory = function (source, predicate) {

                this.create = function () {
                    var _source = (source.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? source.enumeratorFactory : new exports.enumerators.EnumeratorFactory(source)).create();
                    var _done = false;

                    return {
                        moveNext: function () {
                            while (!_done && _source.moveNext()) {
                                if (predicate(_source.current())) {
                                    return true;
                                }
                                else {
                                    _done = true;
                                }
                            }

                            return false;
                        },

                        current: function () {
                            return _source.current();
                        }
                    };
                };
            };

        TakeEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return TakeEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are sorted according to the given comparer.
     */
    exports.enumerators.SortEnumeratorFactory = (function () {
        var SortEnumeratorFactory = function (source, comparer) {
                this.create = function () {
                    var _source = (source instanceof exports.enumerators.EnumeratorFactory ? source : (source.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? source.enumeratorFactory : new exports.enumerators.EnumeratorFactory(source))).create();
                    var _result = null;
                    var _comparer = comparer;

                    var sortSource = function () {
                            var result = [];

                            while (_source.moveNext()) {
                                result.push(_source.current());
                            }

                            for (var index = 1; index < result.length; ++index) {
                                var current = result[index];
                                var previousIndex = index - 1;
                                var done = false;

                                while (!done) {
                                    var comparison = _comparer(result[previousIndex], current);

                                    if (comparison === 1) {
                                        result[previousIndex + 1] = result[previousIndex];
                                        previousIndex--;

                                        if (previousIndex < 0) {
                                            done = true;
                                        }
                                    }
                                    else {
                                        done = true;
                                    }
                                }

                                result[previousIndex + 1] = current;
                            }

                            return new exports.enumerators.EnumeratorFactory(result).create();
                        };

                    return {
                        source: function () {
                            return _source;
                        },

                        comparer: function () {
                            return _comparer;
                        },

                        moveNext: function () {
                            if (_result === null) {
                                _result = sortSource();
                            }

                            return _result.moveNext();
                        },

                        current: function () {
                            return _result.current();
                        }
                    };
                };
            };

        SortEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;
        return SortEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are generated by a callback for the moveNext method.
     */
    exports.enumerators.CallbackEnumeratorFactory = (function () {
        var CallbackEnumeratorFactory = function (callback) {

                this.create = function () {
                    var _callback = callback();
                    var _current;

                    return {
                        moveNext: function () {
                            return (_current = _callback()) !== CallbackEnumeratorFactory.done;
                        },

                        current: function () {
                            return _current;
                        }
                    };
                };
            };

        CallbackEnumeratorFactory.done = {};

        CallbackEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return CallbackEnumeratorFactory;
    })();

    /**
     * Creates a factory for creating enumerators whose results are the inner join of the two sources as joined on the given keys and returned by the resultSelector.
     */
    exports.enumerators.JoinEnumeratorFactory = (function () {
        var JoinEnumeratorFactory = function (outerSource, innerSource, outerKeySelector, innerKeySelector, resultSelector) {

                this.create = function () {
                    var _outerSource = (outerSource.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? outerSource.enumeratorFactory : new exports.enumerators.EnumeratorFactory(outerSource)).create();
                    var _innerSource = innerSource.enumeratorFactory instanceof exports.enumerators.EnumeratorFactory ? innerSource.enumeratorFactory : new exports.enumerators.EnumeratorFactory(innerSource);
                    var _outerKeySelector = outerKeySelector;
                    var _innerKeySelector = innerKeySelector;
                    var _resultSelector = resultSelector;

                    var _innerLookup = null;
                    var _innerLoopDone = true;
                    var _currentInnerLookup = null;
                    var _current;

                    return {
                        moveNext: function () {
                            if (_innerLookup === null) {
                                _innerLookup = _innerSource.toLookupTable(_innerKeySelector);
                                var keys = Object.keys(_innerLookup);

                                for (var index = 0; index < keys.length; ++index) {
                                    _innerLookup[keys[index]] = new exports.enumerators.EnumeratorFactory(_innerLookup[keys[index]]).create();
                                }
                            }

                            while (true) {
                                if (_innerLoopDone) {
                                    if (!_outerSource.moveNext()) {
                                        return false;
                                    }

                                    _innerLoopDone = false;
                                    _currentInnerLookup = _innerLookup[_outerKeySelector(_outerSource.current())];

                                    if (_currentInnerLookup === undefined) {
                                        _innerLoopDone = true;
                                        continue;
                                    }
                                }

                                if (_currentInnerLookup.moveNext()) {
                                    _current = _resultSelector(_outerSource.current(), _currentInnerLookup.current());
                                    return true;
                                }
                                else {
                                    _innerLoopDone = true;
                                }
                            }
                        },

                        current: function () {
                            return _current;
                        }
                    };
                };
            };

        JoinEnumeratorFactory.prototype = exports.enumerators.EnumeratorFactory.prototype;

        return JoinEnumeratorFactory;
    })();
})(typeof exports === undefined ? enumerable : exports);