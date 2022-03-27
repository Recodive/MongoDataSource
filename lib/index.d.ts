import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-caching";
import type { Collection, Document, Filter, FindOptions, Sort, SortDirection } from "mongodb";
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
    count(query?: Filter<TSchema>, options?: {
        ttl: number;
    }): Promise<any>;
    find(fields?: Filter<TSchema>, options?: {
        ttl: number;
        findOptions?: FindOptions<TSchema>;
    }, sort?: {
        sort: Sort;
        direction?: SortDirection;
    }, skip?: number, limit?: number): Promise<TSchema[]>;
    findOne(fields?: Filter<TSchema>, options?: {
        ttl: number;
        findOptions?: FindOptions<TSchema>;
    }): Promise<TSchema | null>;
    delete(type: DataSourceOperation, fields?: Filter<TSchema>, options?: {
        findOptions?: FindOptions<TSchema>;
    }): Promise<boolean | void | undefined>;
    private getCacheKey;
    private antiSpam;
}
export {};
