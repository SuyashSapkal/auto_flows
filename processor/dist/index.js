"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const TOPIC_NAME = "zap-events";
const prismaClient = new client_1.PrismaClient();
const kafkaClient = new kafkajs_1.Kafka({
    clientId: 'processor',
    brokers: ['localhost:9092']
});
function mainFunction() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = kafkaClient.producer();
        yield producer.connect();
        while (1) {
            // reads 10 rows from the ZapRunOutbox
            const pendingRows = yield prismaClient.zapRunOutbox.findMany({
                where: {},
                take: 10
            });
            console.log(pendingRows);
            // sends the 10 rows to the queue
            producer.send({
                topic: TOPIC_NAME,
                messages: pendingRows.map((r) => {
                    return {
                        value: JSON.stringify({
                            zapRunId: r.zapRunId,
                            stage: 0
                        })
                    };
                })
            });
            // deletes the 10 rows from the ZapRunOutbox table
            yield prismaClient.zapRunOutbox.deleteMany({
                where: {
                    id: {
                        in: pendingRows.map((x) => x.id)
                    }
                }
            });
            // wait for 3 seconds after processing 1 session
            yield new Promise(r => setTimeout(r, 3000));
        }
    });
}
mainFunction();
