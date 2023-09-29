// Extend array functionality

// Array Remove - By John Resig (MIT Licensed)
// http://ejohn.org/blog/javascript-array-remove/
// https://stackoverflow.com/a/9815010/10332984

Array.prototype.remove = function (from, to)
{
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/**
 * Filter an array, returning the filtered array and modifying the array in place so it includes the unfiltered elements
 * Inspired by https://reeversedev.com/polyfill-for-foreach-map-filter-reduce
 * and the above
 */
if (!Array.prototype.sift)
{
  Object.defineProperty(Array.prototype, 'sift', {
    value: function (callback, context)
    {
      var filtered = [];
      var sifted = []
      for (i = 0; i < this.length; i++)
      {
        if (callback.call(context, this[i], i, this))
        {
          filtered.push(this[i])
        } else
        {
          sifted.push(this[i])
        }
      }
      this.length = 0;
      this.push.apply(this, sifted);
      return filtered;
    },
    configurable: true,
    writable: true
  });
}


/**
 * Sort an array of objects by a specific key
 * @param {string} key 
 * @param {string} direction 'asc' or 'desc'; defaults to 'asc'
 * @returns {Object[]}  The array, sorted in place
 */
if (!Array.prototype.sortBy)
{
  Object.defineProperty(Array.prototype, 'sortBy', {
    value: function (key, direction)
    {
      let numericalDirection = (direction === 'desc') ? -1 : 1;
      return this.sort(function (a, b)
      {
        let aHasKey = (a.hasOwnProperty(key) && a[key] !== null && a[key] !== undefined)
        let bHasKey = (b.hasOwnProperty(key) && b[key] !== null && b[key] !== undefined)
        if (aHasKey && !bHasKey) return numericalDirection;
        if (!aHasKey && bHasKey) return (-1) * numericalDirection;
        if (!aHasKey && !bHasKey) return 0;
        if (a[key] > b[key]) return numericalDirection;
        if (a[key] < b[key]) return (-1) * numericalDirection;
        return 0
      });
    },
    configurable: true,
    writable: true
  });
}
