"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseConfig = exports.getDatabaseLogs = exports.getDatabaseMain = exports.getDatabase = void 0;
// Main exports
__exportStar(require("./database"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./config"), exports);
__exportStar(require("./migrations"), exports);
__exportStar(require("./nestjs-module"), exports);
// Database instances
var database_1 = require("./database");
Object.defineProperty(exports, "getDatabase", { enumerable: true, get: function () { return database_1.getDatabase; } });
Object.defineProperty(exports, "getDatabaseMain", { enumerable: true, get: function () { return database_1.getDatabaseMain; } });
Object.defineProperty(exports, "getDatabaseLogs", { enumerable: true, get: function () { return database_1.getDatabaseLogs; } });
// Configuration
var config_1 = require("./config");
Object.defineProperty(exports, "createDatabaseConfig", { enumerable: true, get: function () { return config_1.createDatabaseConfig; } });
