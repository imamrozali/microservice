# @repo/database

Shared database package dengan dukungan untuk multiple database menggunakan Knex.js untuk SQL databases dan MongoDB native driver.

## Supported Databases

- ✅ PostgreSQL
- ✅ MySQL
- ✅ SQLite
- ✅ SQL Server (MSSQL)
- ✅ Oracle
- ✅ MongoDB

## Struktur Package

```
src/
├── config/
│   └── types.ts          # Type definitions untuk config
├── drivers/
│   ├── postgresql.ts     # PostgreSQL driver
│   ├── mysql.ts          # MySQL driver
│   ├── sqlite.ts         # SQLite driver
│   ├── mssql.ts          # SQL Server driver
│   ├── oracle.ts         # Oracle driver
│   └── mongodb.ts        # MongoDB driver
├── factory.ts            # Database factory
├── manager.ts            # Connection manager
└── index.ts              # Main exports
```

## Installation

```bash
npm install
```

## Usage

### 1. PostgreSQL

```typescript
import { DatabaseManager, PostgreSQLConfig } from '@repo/database';

const config: PostgreSQLConfig = {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password',
  ssl: false,
  max: 10,
  min: 2,
};

// Create connection
const db = DatabaseManager.create('main', config);

// Get Knex client
const client = (db as PostgreSQLDriver).getClient();

// Query
const users = await client('users').select('*');

// Test connection
const isConnected = await db.testConnection();
```

### 2. MySQL

```typescript
import { DatabaseManager, MySQLConfig } from '@repo/database';

const config: MySQLConfig = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'mydb',
  user: 'root',
  password: 'password',
  connectionLimit: 10,
};

const db = DatabaseManager.create('mysql', config);
const client = (db as MySQLDriver).getClient();

// Query
const products = await client('products').where('active', true).select('*');
```

### 3. SQLite

```typescript
import { DatabaseManager, SQLiteConfig } from '@repo/database';

const config: SQLiteConfig = {
  type: 'sqlite',
  filename: './data/mydb.sqlite',
};

const db = DatabaseManager.create('sqlite', config);
const client = (db as SQLiteDriver).getClient();

// Query
const data = await client('table_name').select('*');
```

### 4. SQL Server (MSSQL)

```typescript
import { DatabaseManager, MSSQLConfig } from '@repo/database';

const config: MSSQLConfig = {
  type: 'mssql',
  host: 'localhost',
  port: 1433,
  database: 'mydb',
  user: 'sa',
  password: 'YourStrong@Passw0rd',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const db = DatabaseManager.create('mssql', config);
const client = (db as MSSQLDriver).getClient();

// Query
const orders = await client('orders').select('*');
```

### 5. Oracle

```typescript
import { DatabaseManager, OracleConfig } from '@repo/database';

const config: OracleConfig = {
  type: 'oracle',
  host: 'localhost',
  port: 1521,
  database: 'ORCL',
  user: 'system',
  password: 'oracle',
  poolMin: 1,
  poolMax: 10,
};

const db = DatabaseManager.create('oracle', config);
const client = (db as OracleDriver).getClient();

// Query
const results = await client('employees').select('*');
```

### 6. MongoDB

```typescript
import { DatabaseManager, MongoDBConfig, MongoDBDriver } from '@repo/database';

const config: MongoDBConfig = {
  type: 'mongodb',
  uri: 'mongodb://localhost:27017',
  database: 'mydb',
  options: {
    maxPoolSize: 10,
    minPoolSize: 2,
  },
};

const driver = DatabaseManager.create('mongo', config) as MongoDBDriver;

// Connect first
await driver.connect();

// Get database
const db = driver.getDb();

// Query
const users = await db.collection('users').find({}).toArray();

// Insert
await db.collection('users').insertOne({
  name: 'John Doe',
  email: 'john@example.com',
});
```

## Database Manager

### Create Connection

```typescript
import { DatabaseManager } from '@repo/database';

// Create named connection
const db = DatabaseManager.create('myConnection', config);
```

### Get Existing Connection

```typescript
// Get connection by name
const db = DatabaseManager.get('myConnection');

if (db) {
  console.log('Connection exists');
}
```

### Check Connection

```typescript
// Check if connection exists
if (DatabaseManager.has('myConnection')) {
  console.log('Connection found');
}
```

### Close Connection

```typescript
// Close specific connection
await DatabaseManager.close('myConnection');

// Close all connections
await DatabaseManager.closeAll();
```

### List Connections

```typescript
// Get all connection names
const names = DatabaseManager.getConnectionNames();
console.log('Active connections:', names);
```

## Direct Driver Usage

Jika tidak ingin menggunakan `DatabaseManager`, bisa langsung instantiate driver:

```typescript
import { PostgreSQLDriver, MySQLDriver, MongoDBDriver } from '@repo/database';

// PostgreSQL
const pgDriver = new PostgreSQLDriver({
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password',
});

const pgClient = pgDriver.getClient();

// MySQL
const mysqlDriver = new MySQLDriver({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'mydb',
  user: 'root',
  password: 'password',
});

const mysqlClient = mysqlDriver.getClient();

// MongoDB
const mongoDriver = new MongoDBDriver({
  type: 'mongodb',
  uri: 'mongodb://localhost:27017',
  database: 'mydb',
});

await mongoDriver.connect();
const mongoDb = mongoDriver.getDb();
```

## Test Connection

Setiap driver memiliki method `testConnection()`:

```typescript
const db = DatabaseManager.create('test', config);

const isConnected = await db.testConnection();

if (isConnected) {
  console.log('Database connected successfully');
} else {
  console.log('Failed to connect to database');
}
```

## Knex Query Examples

Untuk SQL databases (PostgreSQL, MySQL, SQLite, MSSQL, Oracle):

```typescript
const client = (db as PostgreSQLDriver).getClient();

// Select
const users = await client('users').select('*');

// Where
const user = await client('users').where('id', 1).first();

// Insert
await client('users').insert({
  name: 'John Doe',
  email: 'john@example.com',
});

// Update
await client('users').where('id', 1).update({
  name: 'Jane Doe',
});

// Delete
await client('users').where('id', 1).delete();

// Join
const posts = await client('posts')
  .join('users', 'posts.user_id', 'users.id')
  .select('posts.*', 'users.name as author');

// Transaction
await client.transaction(async (trx) => {
  await trx('users').insert({ name: 'User 1' });
  await trx('posts').insert({ title: 'Post 1', user_id: 1 });
});
```

## Environment Variables Example

```env
# PostgreSQL
DB_PG_TYPE=postgresql
DB_PG_HOST=localhost
DB_PG_PORT=5432
DB_PG_DATABASE=mydb
DB_PG_USER=postgres
DB_PG_PASSWORD=password

# MySQL
DB_MYSQL_TYPE=mysql
DB_MYSQL_HOST=localhost
DB_MYSQL_PORT=3306
DB_MYSQL_DATABASE=mydb
DB_MYSQL_USER=root
DB_MYSQL_PASSWORD=password

# MongoDB
DB_MONGO_TYPE=mongodb
DB_MONGO_URI=mongodb://localhost:27017
DB_MONGO_DATABASE=mydb
```

## TypeScript Support

Package ini fully typed dengan TypeScript:

```typescript
import type {
  DatabaseConfig,
  PostgreSQLConfig,
  MySQLConfig,
  SQLiteConfig,
  MSSQLConfig,
  OracleConfig,
  MongoDBConfig,
} from '@repo/database';

// Config akan di-type check
const config: PostgreSQLConfig = {
  type: 'postgresql',
  host: 'localhost',
  // TypeScript akan error jika ada property yang salah
};
```

## License

MIT
