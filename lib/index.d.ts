import { DataSource } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-caching";
import { Collection, Document, FindOptions } from "mongodb";
declare type DataSourceOperation = "findOne" | "find" | "count";
export default class MongoDataSource<TSchema extends Document = Document> implements DataSource {
    /**
     * MongoDB collection for the data source.
     */
    collection: Collection<TSchema>;
    /**
     * Cache instance
     */
    cache?: KeyValueCache<string> | undefined;
    /**
     * The prefix for the cache key
     * @default "mongodb"
     */
    cachePrefix: string;
    private pendingResults;
    private defaultTTL;
    constructor(
    /**
     * MongoDB collection for the data source.
     */
    collection: Collection<TSchema>, 
    /**
     * Cache instance
     */
    cache?: KeyValueCache<string> | undefined, 
    /**
     * Options for the DataSource
     */
    options?: {
        /**
         * The default TTL for the cache
         */
        defaultTTL?: number;
        /**
         * The prefix for the cache key
         */
        cachePrefix?: string;
    });
    initialize({ cache }: {
        cache: KeyValueCache;
    }): void;
    count(query?: {}, options?: {
        ttl: number;
    }): Promise<any>;
    find(fields?: any, options?: {
        ttl: number;
        findOptions?: FindOptions<Document>;
    }): Promise<TSchema[]>;
    findOne(fields?: any, options?: {
        ttl: number;
        findOptions?: FindOptions;
    }): Promise<TSchema | null>;
    delete(type: DataSourceOperation, fields?: any, options?: {
        findOptions?: FindOptions;
    }): Promise<boolean | void | undefined>;
    private getCacheKey;
    private antiSpam;
}
export {};
