import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events";

const prismaClient = new PrismaClient();

const kafkaClient = new Kafka({
    clientId: 'processor',
    brokers: ['localhost:9092']
})

async function mainFunction(){
    const producer = kafkaClient.producer();
    await producer.connect()

    while(1){
        // reads 10 rows from the ZapRunOutbox
        const pendingRows = await prismaClient.zapRunOutbox.findMany({
            where: {},
            take: 10
        });

        console.log(pendingRows);
        
        // sends the 10 rows to the queue
        producer.send({
            topic: TOPIC_NAME,
            messages: pendingRows.map((r: { zapRunId: String; }) =>{
                return {
                    value: JSON.stringify({
                        zapRunId: r.zapRunId, 
                        stage: 0
                    })
                }
            })
        })

        // deletes the 10 rows from the ZapRunOutbox table
        await prismaClient.zapRunOutbox.deleteMany({
            where:{
                id: {
                    in: pendingRows.map((x: { id: any }) => x.id)
                }
            }
        })

        // wait for 3 seconds after processing 1 session
        await new Promise(r=>setTimeout(r, 3000));
    }
}

mainFunction();