"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.DatabaseService = exports.DATABASE_LOGS_TOKEN = exports.DATABASE_MAIN_TOKEN = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_1 = require("./database");
exports.DATABASE_MAIN_TOKEN = "DATABASE_MAIN";
exports.DATABASE_LOGS_TOKEN = "DATABASE_LOGS";
let DatabaseService = class DatabaseService {
    mainDb;
    logsDb;
    constructor(mainDb, logsDb) {
        this.mainDb = mainDb;
        this.logsDb = logsDb;
    }
    get main() {
        return this.mainDb;
    }
    get logs() {
        return this.logsDb;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(exports.DATABASE_MAIN_TOKEN)),
    __param(1, (0, common_1.Inject)(exports.DATABASE_LOGS_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely,
        kysely_1.Kysely])
], DatabaseService);
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static forRoot() {
        return {
            module: DatabaseModule_1,
            providers: [
                {
                    provide: exports.DATABASE_MAIN_TOKEN,
                    useFactory: () => (0, database_1.getDatabaseMain)(),
                },
                {
                    provide: exports.DATABASE_LOGS_TOKEN,
                    useFactory: () => (0, database_1.getDatabaseLogs)(),
                },
                DatabaseService,
            ],
            exports: [exports.DATABASE_MAIN_TOKEN, exports.DATABASE_LOGS_TOKEN, DatabaseService],
        };
    }
    static forFeature(databases) {
        const providers = databases.map((dbName) => {
            const token = dbName === "main" ? exports.DATABASE_MAIN_TOKEN : exports.DATABASE_LOGS_TOKEN;
            return {
                provide: token,
                useFactory: () => {
                    if (dbName === "main") {
                        return (0, database_1.getDatabaseMain)();
                    }
                    else {
                        return (0, database_1.getDatabaseLogs)();
                    }
                },
            };
        });
        return {
            module: DatabaseModule_1,
            providers,
            exports: providers.map((p) => p.provide),
        };
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], DatabaseModule);
