import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3000;
const client = new PrismaClient()

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    try{
        const userId = req.params.userId;
        const zapId = req.params.zapId;
    
        const body = req.body;
        let txn = await client.$transaction(async tx => {
            const run = await tx.zapRun.create({
                data: {
                    zapId: zapId,
                    metadata: body
                }
            });
    
            let zapOutbox = await tx.zapRunOutbox.create({
                data: {
                    zapRunId: run.id
                }
            });
        });
    
        res.json({
            msg: "webhook received"
        });
    }catch(e){
        console.log(e);
    }

});

app.listen(PORT, () => {
    console.log("Prisma backend started on port 3000")
})