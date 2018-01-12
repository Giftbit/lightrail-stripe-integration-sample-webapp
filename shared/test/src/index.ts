import * as chai from "chai";
import * as childProcess from "child_process";
import * as lightrail from "lightrail-client";
import * as path from "path";
import * as superagent from "superagent";
import * as uuid from "uuid";
import {testEnvs} from "./testEnvs";

require("dotenv").config({path: path.join(__dirname, "..", "..", ".env")});
lightrail.configure({apiKey: process.env.LIGHTRAIL_API_KEY});
const HOST = "http://localhost:3000";
const DEBUG = true;

for (const testEnv of testEnvs) {
    describe(testEnv.name, () => {

        let cp: childProcess.ChildProcess;
        let cpExit: Promise<void>;

        it(`stands up a server on ${HOST}`, async () => {
            await superagent.get(HOST);
        });

        it("can simulate checkout on a user with no balance", async () => {
            await setBalance(0);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                });

            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, 0);
        });

        it("can simulate checkout on a user with less balance", async () => {
            await setBalance(10000);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                });

            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, -10000);
        });

        it("can simulate checkout on a user with more than enough balance", async () => {
            await setBalance(50000);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                });

            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, -37500);
        });

        async function setBalance(value: number): Promise<void> {
            const contact = await lightrail.contacts.getContactByAnyIdentifier({shopperId: process.env.SHOPPER_ID});
            if (!contact) {
                throw new Error(`could not find shopper with shopperId '${process.env.SHOPPER_ID}'`);
            }

            const cards = await lightrail.cards.getCards({contactId: contact.contactId, cardType: lightrail.model.Card.CardType.ACCOUNT_CARD, currency: "USD"});
            if (cards.cards.length !== 1) {
                throw new Error(`could not find account card for contactId '${contact.contactId}' currency USD`);
            }
            const card = cards.cards[0];

            const details = await lightrail.cards.getDetails(card);
            if (details.valueStores[0].value !== value) {
                await lightrail.cards.transactions.createTransaction(card, {
                    value: value - details.valueStores[0].value,
                    currency: "USD",
                    userSuppliedId: uuid.v4()
                });
            }
        }

        before(async function () {
            this.timeout(30000);
            const cwd = path.join(__dirname, "..", "..", "..", testEnv.name);
            cp = childProcess.exec(`${testEnv.cmd}`, {cwd}, (error) => {
                if (error && (error as any).signal !== 'SIGTERM') {
                    console.log(error);
                }
            });
            cpExit = new Promise((resolve) => {
                cp.on("exit", (code, signal) => {
                    if (DEBUG) {
                        console.log(`${testEnv.name} exited code=${code} signal=${signal}`);
                    }
                    resolve();
                });
            });
            await new Promise((resolve) => {
                cp.stdout.on("data", data => {
                    if (DEBUG) {
                        process.stdout.write(`${testEnv.name} stdout: ${data}`);
                    }
                    if (testEnv.initRegex.test(data as string)) {
                        resolve();
                    }
                });
                cp.stderr.on("data", data => {
                    if (DEBUG) {
                        process.stdout.write(`${testEnv.name} stderr: ${data}`);
                    }
                    if (testEnv.initRegex.test(data as string)) {
                        resolve();
                    }
                });
            });
        });

        after(async () => {
            cp.kill();
            await cpExit;

            cp = null;
            cpExit = null;
        });
    });
}
