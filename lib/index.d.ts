import { DataSource } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-caching";
import { Collection, Document, FindOptions } from "mongodb";
declare type DataSourceOperation = "findOne" | "find" | "count";
export default class MongoDataSource<TSchema extends Document = Document> implements DataSource {
    cache?: KeyValueCache<string> | undefined;
    context: any;
    collection: Collection<TSchema>;
    cachePrefix: string;
    private pendingResults;
    constructor(collection: Collection<TSchema>, cache?: KeyValueCache<string> | undefined);
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
    }): Promise<TSchema[]>;
    findOne(fields?: any, options?: {
        ttl: number;
        findOptions?: FindOptions;
    }): Promise<TSchema | null>;
    delete(type: DataSourceOperation, fields: any, options?: {
        findOptions?: FindOptions<Document>;
    }): Promise<boolean | void | undefined>;
    private getCacheKey;
    private antiSpam;
}
export {};
