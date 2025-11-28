import {
  Module,
  DynamicModule,
  Global,
  Injectable,
  Inject,
} from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseMain, DatabaseLogs } from "./types";
import { getDatabaseMain, getDatabaseLogs, getDatabase } from "./database";

export const DATABASE_MAIN_TOKEN = "DATABASE_MAIN";
export const DATABASE_LOGS_TOKEN = "DATABASE_LOGS";

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE_MAIN_TOKEN)
    private readonly mainDb: Kysely<DatabaseMain>,
    @Inject(DATABASE_LOGS_TOKEN)
    private readonly logsDb: Kysely<DatabaseLogs>
  ) {}

  get main(): Kysely<DatabaseMain> {
    return this.mainDb;
  }

  get logs(): Kysely<DatabaseLogs> {
    return this.logsDb;
  }
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_MAIN_TOKEN,
          useFactory: (): Kysely<DatabaseMain> => getDatabaseMain(),
        },
        {
          provide: DATABASE_LOGS_TOKEN,
          useFactory: (): Kysely<DatabaseLogs> => getDatabaseLogs(),
        },
        DatabaseService,
      ],
      exports: [DATABASE_MAIN_TOKEN, DATABASE_LOGS_TOKEN, DatabaseService],
    };
  }

  static forFeature(databases: ("main" | "logs")[]): DynamicModule {
    const providers = databases.map((dbName) => {
      const token =
        dbName === "main" ? DATABASE_MAIN_TOKEN : DATABASE_LOGS_TOKEN;
      return {
        provide: token,
        useFactory: () => {
          if (dbName === "main") {
            return getDatabaseMain();
          } else {
            return getDatabaseLogs();
          }
        },
      };
    });

    return {
      module: DatabaseModule,
      providers,
      exports: providers.map((p) => p.provide),
    };
  }
}
