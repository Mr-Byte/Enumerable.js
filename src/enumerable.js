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

if (typeof exports !== undefined) {
    exports.enumerators = require('./enumerators.js').enumerators;
    var window = window || {};
}

(function (exports) {
    var enumerators = exports.enumerators;

    exports.Enumerable = (function () {
        var Enumerable = function (source) {
                if (!(this instanceof Enumerable)) {
                    return new Enumerable(source);
                }

                if (!(source instanceof enumerators.EnumeratorFactory)) {
                    source = new enumerators.EnumeratorFactory(source);
                }

                this.enumeratorFactory = source;
            };

        /**
         * Filters the enumerable with the given predicate.
         * @param predicate A function that returns true/false to determine if the item is included in the filtered result.
         * @return A FilterEnumerable, representing the filtered results of this Enumerable.
         */
        Enumerable.prototype.filter = function (predicate) {
            return new Enumerable(new enumerators.FilterEnumeratorFactory(this, predicate));
        };

        /**
         * Maps all items in an enumerable from current form to another form.
         * @param valueSelector A function to map the current value to another value.
         * @return A MapEnumerable representing the mapped result of this Enumerable.
         */
        Enumerable.prototype.map = function (valueSelector) {
            return new Enumerable(new enumerators.MapEnumeratorFactory(this, valueSelector));
        };

        /**
         * Gets a reversed version of the enumerable.
         */
        Enumerable.prototype.reverse = function () {
            return new Enumerable(new enumerators.ReverseEnumeratorFactory(this));
        };

        /**
         * Appends the given enumerable to the current enumerable.
         */
        Enumerable.prototype.append = function (toAppend) {
            var appendEnumeratorFactory = new enumerators.AppendEnumeratorFactory(this, toAppend);
            return new Enumerable(appendEnumeratorFactory);
        };

        /**
         * Skips the given number of elements on the enumerable.
         */
        Enumerable.prototype.skip = function (predicate) {
            if (typeof predicate === 'number') {
                var count = 0;
                var skipCount = predicate;

                return new Enumerable(new enumerators.SkipEnumeratorFactory(this, function () {
                    return count++ < skipCount;
                }));
            }

            return new Enumerable(new enumerators.SkipEnumeratorFactory(this, predicate));
        };

        /**
         * Takes the given number of elements from the enumerable.
         */
        Enumerable.prototype.take = function (predicate) {
            if (typeof predicate === 'number') {
                var count = 0;
                var skipCount = predicate;

                return new Enumerable(new enumerators.TakeEnumeratorFactory(this, function () {
                    return count++ < skipCount;
                }));
            }

            return new Enumerable(new enumerators.TakeEnumeratorFactory(this, predicate));
        };

        /**
         * Sorts the enumerable.
         */
        Enumerable.prototype.sort = function (selector, direction, comparer) {
            return new exports.SortedEnumerable(new enumerators.SortEnumeratorFactory(this, buildComparer(selector, comparer, direction)));
        };

        /**
         * Returns an enumerable of key/value pairs, where the values are all items matched on the given key.
         */
        Enumerable.prototype.group = function (keySelector, valueSelector, resultSelector) {
            if (typeof keySelector === "string" || keySelector instanceof String) {
                var itemKey = keySelector;
                keySelector = function (item) {
                    return item[itemKey];
                };
            }

            if (typeof valueSelector !== 'function') {
                valueSelector = function (item) {
                    return item;
                };
            }

            if (valueSelector.length === 2) {
                resultSelector = valueSelector;
                valueSelector = null;
            }

            var result = new exports.KeyValueEnumerable(new enumerators.KeyValueEnumeratorFactory(this.toLookup(keySelector, valueSelector)));

            return typeof resultSelector === 'function' ? result.map(function (keyValue) {
                return resultSelector(keyValue.key, keyValue.value);
            }) : result;
        };

        Enumerable.prototype.join = function (inner, outerKeySelector, innerKeySelector, resultSelector) {
            return new Enumerable(new enumerators.JoinEnumeratorFactory(this, inner, outerKeySelector, innerKeySelector, resultSelector));
        };

        /**
         * Enumerates through the enumerable, executing the given function on each item.
         * @param method    A function to operate on the current item.
         */
        Enumerable.prototype.forEach = function (callback) {
            var enumerator = new this.enumeratorFactory.create();

            var index = 0;
            if (enumerator.moveNext()) {
                if (callback(enumerator.current(), index++) === false) {
                    return;
                }

                while (enumerator.moveNext()) {
                    if (callback(enumerator.current(), index++) === false) {
                        return;
                    }
                }
            }
        };

        /**
         * Counts the number of elements represented by the enumerable.
         */
        Enumerable.prototype.count = function () {
            var count = 0;

            this.forEach(function () {
                count++;
            });

            return count;
        };

        /**
         * Folds all items in an enumerable into a single, aggregated value.
         * @param initial   The initial value to use for the folding.
         * @param accumulator    A function used to fold the current value into an accumulated value.
         * @return  A folded result.
         */
        Enumerable.prototype.fold = function (initial, accumulator) {
            var current = initial;
            this.forEach(function (item) {
                current = accumulator(current, item);
            });

            return current;
        };

        /**
         * Converts the current enumerable into an array.
         * @return  An array representing the values in the current enumerable.
         */
        Enumerable.prototype.toArray = function () {
            var out = [];

            this.forEach(function (current) {
                out.push(current);
            });

            return out;
        };

        /**
         * Eagerly converts the enumerable to a lookup, where the key of each lookup group is determined by the key selector.
         * @param keySelector The key selector used to determine the key for the current item.
         */
        Enumerable.prototype.toLookup = function (keySelector, valueSelector) {
            var result = this.enumeratorFactory.toLookupTable(keySelector, valueSelector);
            var keys = Object.keys(result);

            for (var index = 0; index < keys.length; ++index) {
                result[keys[index]] = new Enumerable(result[keys[index]]);
            }

            return result;
        };

        /**
         * Using the key selector and value selector, builds a key/value enumerator.
         */
        Enumerable.prototype.toKeyValueEnumerable = function (keySelector, valueSelector) {
            var result = {};

            var enumerator = this.enumeratorFactory.create();

            while (enumerator.moveNext()) {
                var current = enumerator.current();

                var key = keySelector(current);

                if (result.hasOwnProperty(key)) {
                    throw {
                        name: 'DuplicateKeyException',
                        value: 'The given key already exists.'
                    };
                }

                result[key] = valueSelector(current);
            }

            return new exports.KeyValueEnumerable(new enumerators.KeyValueEnumeratorFactory(result));
        };

        /**
         * Gets the first item in the enumerable.
         */
        Enumerable.prototype.first = function (predicate) {
            if (typeof predicate === 'function') {
                return this.filter(predicate).first();
            }

            var enumerator = this.enumeratorFactory.create();

            if (enumerator.moveNext()) {
                return enumerator.current();
            }
        };

        /**
         * Gets the last item in the enumerable.
         */
        Enumerable.prototype.last = function (predicate) {
            if (typeof predicate === 'function') {
                return this.filter(predicate).last();
            }

            var enumerator = this.enumeratorFactory.create();

            var last = enumerator.current();

            while (enumerator.moveNext()) {
                last = enumerator.current();
            }

            return last;
        };

        /**
         * Returns whether or not if the collection is empty.
         */
        Enumerable.prototype.isEmpty = function () {
            var enumerator = this.enumeratorFactory.create();
            return !enumerator.moveNext();
        };

        /**
         * Returns whether or not if any item in the collection matches the predicate.
         */
        Enumerable.prototype.anyMatch = function (predicate) {
            var matched = false;

            this.forEach(function (item) {
                if (predicate(item)) {
                    matched = true;
                    return false;
                }
            });

            return matched;
        };

        /**
         * Returns whether or not if all items int he collection match the predicate.
         */
        Enumerable.prototype.allMatch = function (predicate) {
            var matched = true;

            this.forEach(function (item) {
                if (!predicate(item)) {
                    matched = false;
                    return false;
                }
            });

            return matched;
        };

        /**
         * Flattens the given enumerable out using the given selector to select sub-enumerables.
         */
        Enumerable.prototype.flatten = function (selector) {
            var enumerable = this;

            return new Enumerable(new enumerators.CallbackEnumeratorFactory(function () {
                var enumerator = enumerable.enumeratorFactory.create();

                var result = new Enumerable([]);

                while (enumerator.moveNext()) {
                    result = result.append(selector(enumerator.current()));
                }

                var finalEnumerator = result.enumeratorFactory.create();

                return function () {
                    if (finalEnumerator.moveNext()) {
                        return finalEnumerator.current();
                    }
                    else {
                        return enumerators.CallbackEnumeratorFactory.done;
                    }
                };
            }));
        };

        /**
         * Determines if the given item is in the enumerable or not.
         * @param item  Either an item to search for or a predicate to determine if the current item is a match.
         * @returns True if found; otherwise false.
         */
        Enumerable.prototype.contains = function (item) {
            var finder = item instanceof Function ? item : function (current) {
                    return current === item;
                };
            var found = false;

            this.forEach(function (current) {
                if (finder(current)) {
                    found = true;
                    return true;
                }
            });

            return found;
        };

        Enumerable.prototype.distinct = function () {
            var enumeratorFactory = this.enumeratorFactory;

            return new Enumerable(new enumerators.CallbackEnumeratorFactory(function () {
                var enumerator = enumeratorFactory.create();
                var valuesSeen = {};

                return function () {
                    while (enumerator.moveNext()) {
                        var currentValue = enumerator.current();

                        if (!valuesSeen.hasOwnProperty(currentValue)) {
                            valuesSeen[currentValue] = true;
                            return currentValue;
                        }
                    }

                    return enumerators.CallbackEnumeratorFactory.done;
                };
            }));
        };

        /** STATIC METHODS **/

        /**
         * Generates a range of numbers starting at the given start value and continuing the for count value.
         * @param start The number to start counting from.
         * @param count The count of the total number of values in the range.
         */
        Enumerable.range = function (start, count) {
            return new Enumerable(new enumerators.CallbackEnumeratorFactory(function () {
                var currentCount = 0;
                var current = start;
                return function () {
                    if (currentCount++ >= count) {
                        return enumerators.CallbackEnumeratorFactory.done;
                    }

                    return current++;
                };
            }));
        };

        /**
         * Generates a repeated sequence of the given value, with a length of the count value.
         * @param value The value to repeat.
         * @param count The number of repetitions.
         */
        Enumerable.repeat = function (value, count) {
            return new Enumerable(new enumerators.CallbackEnumeratorFactory(function () {
                var currentCount = 0;
                return function () {
                    if (currentCount++ >= count) {
                        return enumerators.CallbackEnumeratorFactory.done;
                    }

                    return value;
                };
            }));
        };

        /**
         * Returns an empty enumerable.
         */
        Enumerable.empty = function () {
            return new Enumerable([]);
        };

        /**
         * Returns an enumerable that pairs together items, in order, from the left and right enumerables.
         */
        Enumerable.zip = function (left, right) {
            return new Enumerable(new enumerators.CallbackEnumeratorFactory(function () {
                var leftEnumerator = left.enumeratorFactory.create();
                var rightEnumerator = right.enumeratorFactory.create();

                return function () {
                    if (leftEnumerator.moveNext() && rightEnumerator.moveNext()) {
                        return [leftEnumerator.current(), rightEnumerator.current()];
                    }
                    else {
                        return enumerators.CallbackEnumeratorFactory.done;
                    }
                };
            }));
        };

        // Create an alias to Enumerable on window if available.
        if (typeof window !== undefined) {
            window.$e = Enumerable;
        }

        return Enumerable;
    })();

    /**
     * Represents an enumerable of key/value pairs.
     */
    exports.KeyValueEnumerable = (function () {
        var KeyValueEnumerable = function (source) {
                if (!(source instanceof enumerators.KeyValueEnumeratorFactory)) {
                    throw {
                        name: 'EnumeratorFactorySourceIsNotKeyValueException',
                        message: 'The given enumerator source is not a KeyValueEnumeratorFactory'
                    };
                }

                this.enumeratorFactory = source;
            };

        KeyValueEnumerable.prototype = exports.Enumerable.prototype;
        KeyValueEnumerable.prototype.constructor = exports.Enumerable;

        KeyValueEnumerable.prototype.toObject = function () {
            var result = {};

            var enumerator = this.enumeratorFactory.create();

            while (enumerator.moveNext()) {
                var current = enumerator.current();

                result[current.key] = current.value;
            }

            return result;
        };

        return KeyValueEnumerable;
    })();

    /**
     * Represents an enumerable that has been sorted.
     */
    exports.SortedEnumerable = (function () {
        var SortedEnumerable = function (source) {
                if (!(source instanceof enumerators.SortEnumeratorFactory)) {
                    throw {
                        name: 'EnumeratorFactorySourceIsNotSortedException',
                        message: 'The given enumerator source is not a SortedEnumeratorFactory'
                    };
                }

                this.enumeratorFactory = source;
            };

        SortedEnumerable.prototype = exports.Enumerable.prototype;
        SortedEnumerable.prototype.constructor = exports.Enumerable;

        SortedEnumerable.prototype.subsort = function (selector, direction, comparer) {
            var enumerator = this.enumeratorFactory.create();
            return new SortedEnumerable(new enumerators.SortEnumeratorFactory(this, combineComparers(enumerator.comparer(), buildComparer(selector, comparer, direction))));
        };

        return SortedEnumerable;
    })();

    /** UTILITY METHODS **/

    function combineComparers(parent, child) {
        return function (left, right) {
            var result = parent(left, right);

            if (result !== 0) {
                return result;
            }

            return child(left, right);
        };
    }

    function buildComparer(selector, comparer, direction) {
        if (typeof direction === 'function') {
            comparer = direction;
            direction = 'ASC';
        }

        if (direction === undefined || direction === null || typeof direction !== 'string') {
            direction = 'ASC';
        }

        if (comparer === undefined || comparer === null) {
            comparer = function (left, right) {
                if (left < right) {
                    return -1;
                }

                if (left > right) {
                    return 1;
                }

                return 0;
            };
        }

        return direction.toUpperCase() !== 'DESC' ?
        function (left, right) {
            return comparer(selector(left), selector(right));
        } : function (left, right) {
            return comparer(selector(right), selector(left));
        };
    }
})(typeof exports === undefined ? enumerable : exports);