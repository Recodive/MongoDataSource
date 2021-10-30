# MongoDataSource

An Apollo GraphQL Datasource using MongoDB.

## Why

While there already is a somewhat good MongoDB DataSource package available ([apollo-datasource-mongodb](https://github.com/GraphQLGuide/apollo-datasource-mongodb)), it still lacks some features / functions that we needed in our projects, while it doesn't _yet_ support the main feature of the existing package ([Batching](https://github.com/GraphQLGuide/apollo-datasource-mongodb#batching)), it fixes other small issues like the prevention of spamming MongoDB with requests when there's already a query running for it.

This DataSource is currently in use by [PreMiD/API](https://github.com/PreMiD/API) at a large scale.

## Installation

```Shell
# NPM
npm i apollo-mongodb-datasource

# YARN
yarn add apollo-mongodb-datasource
```

## Usage

### TypeScript

index.ts

```TS
import { MongoClient } from 'mongodb'

import Users from './dataSources/Users'

const client = new MongoClient('mongodb://localhost:27017/test');
client.connect()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    users: new Users(client.db().collection('users'))
  })
})
```

Users.ts

```TS
import MongoDataSource from 'apollo-mongodb-datasource'

export default class Users extends MongoDataSource {
  getUser(userId: string) {
    return this.findOne({userId})
  }
}
```
