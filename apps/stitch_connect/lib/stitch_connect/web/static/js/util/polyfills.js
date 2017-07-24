// https://stackoverflow.com/a/36948541/5129131
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
