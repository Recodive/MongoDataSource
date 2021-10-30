import { DataSource } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-caching";
import { Collection, FindOptions } from "mongodb";
declare type DataSourceOperation = "findOne" | "find" | "count";
export default class MongoDataSource implements DataSource {
    cache?: KeyValueCache<string> | undefined;
    context: any;
    collection: Collection<Document>;
    cachePrefix: string;
    private pendingResults;
    constructor(collection: Collection<Document>, cache?: KeyValueCache<string> | undefined);
    initialize({ cache }: {
        context: any;
        cache: KeyValueCache;
    }): void;
    count(query?: {}, options?: {
        ttl: number;
    }): Promise<any>;
    find(fields?: any, options?: {
        ttl: number;
        findOptions?: FindOptions<Document>;
    }): Promise<any[]>;
    findOne(fields?: any, options?: {
        ttl: number;
        findOptions?: FindOptions<Document>;
    }): Promise<any>;
    delete(type: DataSourceOperation, fields: any, options?: {
        findOptions?: FindOptions<Document>;
    }): Promise<boolean | void | undefined>;
    private getCacheKey;
    private antiSpam;
}
export {};
