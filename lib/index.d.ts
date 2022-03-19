import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-caching";
import type { Collection, Document, FindOptions } from "mongodb";
declare type DataSourceOperation = "findOne" | "find" | "count";
export default abstract class MongoDataSource<TSchema extends Document = Document, TContext = any> extends DataSource<TContext> {
    /**
     * MongoDB collection for the data source.
     */
    collection: Collection<TSchema>;
    /**
     * Cache instance
     */
    cache?: KeyValueCache<string> | undefined;
    /**
     * Request context
     */
    context?: TContext;
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
    initialize({ context, cache }: DataSourceConfig<TContext>): void;
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
