"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_datasource_1 = require("apollo-datasource");
class MongoDataSource extends apollo_datasource_1.DataSource {
    constructor(
    /**
     * MongoDB collection for the data source.
     */
    collection, 
    /**
     * Cache instance
     */
    cache, 
    /**
     * Options for the DataSource
     */
    options) {
        super();
        this.collection = collection;
        this.cache = cache;
        /**
         * The prefix for the cache key
         * @default "mongodb"
         */
        this.cachePrefix = "mongodb";
        this.pendingResults = [];
        this.defaultTTL = 60;
        this.cachePrefix = `${this.cachePrefix}-${this.collection.dbName}-${this.collection.collectionName}-`;
        if (options === null || options === void 0 ? void 0 : options.defaultTTL)
            this.defaultTTL = options.defaultTTL;
        if (options === null || options === void 0 ? void 0 : options.cachePrefix)
            this.cachePrefix = options.cachePrefix;
    }
    initialize({ context, cache }) {
        this.cache = cache;
        this.context = context;
    }
    async count(query = {}, options = { ttl: this.defaultTTL }) {
        var _a;
        const cacheKey = this.getCacheKey("count", query), cacheDoc = await ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(cacheKey));
        if (cacheDoc)
            return JSON.parse(cacheDoc);
        const count = await this.antiSpam(cacheKey, async () => {
            var _a;
            const r = await this.collection.countDocuments(query);
            (_a = this.cache) === null || _a === void 0 ? void 0 : _a.set(cacheKey, JSON.stringify(r), options);
            return r;
        });
        return count;
    }
    async find(fields = {}, options = {
        ttl: this.defaultTTL
    }) {
        var _a;
        const cacheKey = this.getCacheKey("find", fields, options), cacheDoc = await ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(cacheKey));
        if (cacheDoc)
            return JSON.parse(cacheDoc);
        const docs = await this.antiSpam(cacheKey, async () => {
            var _a;
            const r = await this.collection
                .find(fields, options.findOptions)
                .toArray();
            await ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.set(cacheKey, JSON.stringify(r), options));
            return r;
        });
        return docs;
    }
    async findOne(fields = {}, options = {
        ttl: this.defaultTTL
    }) {
        var _a;
        const cacheKey = this.getCacheKey("findOne", fields, options), cacheDoc = await ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(cacheKey));
        if (cacheDoc)
            return JSON.parse(cacheDoc);
        const docs = await this.antiSpam(cacheKey, async () => {
            var _a;
            const r = await this.collection.findOne(fields, options.findOptions);
            await ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.set(cacheKey, JSON.stringify(r), options));
            return r;
        });
        return docs;
    }
    async delete(type, fields = {}, options = {}) {
        var _a;
        return await ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.delete(this.getCacheKey(type, fields, options)));
    }
    getCacheKey(type, fields, options = {}) {
        return (this.cachePrefix +
            `${type}-` +
            JSON.stringify(fields) +
            (options.findOptions ? "-" + JSON.stringify(options.findOptions) : ""));
    }
    async antiSpam(key, callback) {
        const pR = this.pendingResults.find(r => r.key === key);
        if (pR)
            return await pR.promise;
        const d = {
            key,
            promise: callback()
        };
        this.pendingResults.push(d);
        const res = await d.promise;
        this.pendingResults = this.pendingResults.filter(r => r.key !== key);
        return res;
    }
}
exports.default = MongoDataSource;
//# sourceMappingURL=index.js.map