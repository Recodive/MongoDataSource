import { DataSource } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-caching";
import { Collection, Document, FindOptions } from "mongodb";

type DataSourceOperation = "findOne" | "find" | "count";

export default class MongoDataSource<TSchema extends Document = Document>
	implements DataSource
{
	/**
	 * The prefix for the cache key
	 * @default "mongodb"
	 */
	cachePrefix = "mongodb";

	private pendingResults: { key: string; promise: Promise<any> }[] = [];

	private defaultTTL = 60;

	constructor(
		/**
		 * MongoDB collection for the data source.
		 */
		public collection: Collection<TSchema>,
		/**
		 * Cache instance
		 */
		public cache?: KeyValueCache,
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
		}
	) {
		this.cachePrefix = `${this.cachePrefix}-${this.collection.dbName}-${this.collection.collectionName}-`;

		if (options?.defaultTTL) this.defaultTTL = options.defaultTTL;
		if (options?.cachePrefix) this.cachePrefix = options.cachePrefix;
	}

	initialize({ cache }: { cache: KeyValueCache }) {
		this.cache = cache;
	}

	async count(query: {} = {}, options = { ttl: this.defaultTTL }) {
		const cacheKey = this.getCacheKey("count", query),
			cacheDoc = await this.cache?.get(cacheKey);
		if (cacheDoc) return JSON.parse(cacheDoc);

		const count = await this.antiSpam(cacheKey, async () => {
			const r = await this.collection.countDocuments(query);
			this.cache?.set(cacheKey, JSON.stringify(r), options);

			return r;
		});

		return count;
	}

	async find(
		fields: any = {},
		options: { ttl: number; findOptions?: FindOptions<TSchema> } = {
			ttl: this.defaultTTL
		}
	): Promise<TSchema[]> {
		const cacheKey = this.getCacheKey("find", fields, options),
			cacheDoc = await this.cache?.get(cacheKey);

		if (cacheDoc) return JSON.parse(cacheDoc);

		const docs = await this.antiSpam(cacheKey, async () => {
			const r = await this.collection
				.find(fields, options.findOptions)
				.toArray();
			await this.cache?.set(cacheKey, JSON.stringify(r), options);

			return r;
		});

		return docs;
	}

	async findOne(
		fields: any = {},
		options: { ttl: number; findOptions?: FindOptions<TSchema> } = {
			ttl: this.defaultTTL
		}
	): Promise<TSchema | null> {
		const cacheKey = this.getCacheKey("findOne", fields, options),
			cacheDoc = await this.cache?.get(cacheKey);

		if (cacheDoc) return JSON.parse(cacheDoc);

		const docs = await this.antiSpam(cacheKey, async () => {
			const r = await this.collection.findOne(fields, options.findOptions);
			await this.cache?.set(cacheKey, JSON.stringify(r), options);

			return r;
		});

		return docs;
	}

	async delete(
		type: DataSourceOperation,
		fields: any = {},
		options: { findOptions?: FindOptions<TSchema> } = {}
	) {
		return await this.cache?.delete(this.getCacheKey(type, fields, options));
	}

	private getCacheKey(
		type: DataSourceOperation,
		fields: any,
		options: { findOptions?: FindOptions<TSchema> } = {}
	) {
		return (
			this.cachePrefix +
			`${type}-` +
			JSON.stringify(fields) +
			(options.findOptions ? "-" + JSON.stringify(options.findOptions) : "")
		);
	}

	private async antiSpam(key: string, callback: () => Promise<any>) {
		const pR = this.pendingResults.find(r => r.key === key);
		if (pR) return await pR.promise;

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
