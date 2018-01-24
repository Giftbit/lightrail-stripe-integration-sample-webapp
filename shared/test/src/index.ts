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
const DEBUG = false;

for (const testEnv of testEnvs) {
    describe(testEnv.name, () => {

        it(`stands up a server on ${HOST}`, async () => {
            const res = await superagent.get(HOST);
            chai.assert.equal(res.status, 200, `res=${res.text}`);
            chai.assert.isAtLeast(res.text.length, 1, "has content");
        });

        for (const path of ["/redeem", "/checkout", "/buyCards", "/manageAccount"]) {
            it(`renders ${path}`, async () => {
                const res = await superagent.get(`${HOST}${path}`);
                chai.assert.equal(res.status, 200, `res=${res.text}`);
                chai.assert.isAtLeast(res.text.length, 1, "has content");
            });
        }

        it("can simulate checkout on a user with no balance", async () => {
            await setBalance(0);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `res=${res.text}`);
            chai.assert(res.header["content-type"] && /^application\/json/.test(res.header["content-type"]), `content type is JSON: ${res.header["content-type"]}`);
            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, 0, `body=${JSON.stringify(res.body)}`);
        });

        it("can simulate checkout on a user with under balance", async () => {
            await setBalance(10000);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `res=${res.text}`);
            chai.assert(res.header["content-type"] && /^application\/json/.test(res.header["content-type"]), `content type is JSON: ${res.header["content-type"]}`);
            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, -10000, `body=${JSON.stringify(res.body)}`);
        });

        it("can simulate checkout on a user with exact balance", async () => {
            await setBalance(37500);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `res=${res.text}`);
            chai.assert(res.header["content-type"] && /^application\/json/.test(res.header["content-type"]), `content type is JSON: ${res.header["content-type"]}`);
            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, -37500, `body=${JSON.stringify(res.body)}`);
        });

        it("can simulate checkout on a user with over balance", async () => {
            await setBalance(50000);
            const res = await superagent.post(`${HOST}/rest/simulate`)
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    amount: 37500
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `res=${res.text}`);
            chai.assert(res.header["content-type"] && /^application\/json/.test(res.header["content-type"]), `content type is JSON: ${res.header["content-type"]}`);
            chai.assert.isObject(res.body);
            chai.assert.equal(res.body.value, -37500, `body=${JSON.stringify(res.body)}`);
        });

        it("can checkout a user with no balance", async () => {
            await setBalance(0);
            const res = await superagent.post(`${HOST}/rest/charge`)
                .type("form")
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    orderTotal: 37500,
                    "lightrail-amount": 0,
                    source: "tok_visa"
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `body=${JSON.stringify(res.body)}`);
            chai.assert(res.header["content-type"] && /^text\/html/.test(res.header["content-type"]), `content type is HTML: ${res.header["content-type"]}`);
        });

        it("can checkout a user with under balance", async () => {
            await setBalance(10000);
            const res = await superagent.post(`${HOST}/rest/charge`)
                .type("form")
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    orderTotal: 37500,
                    "lightrail-amount": 10000,
                    source: "tok_visa"
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `body=${JSON.stringify(res.body)}`);
            chai.assert(res.header["content-type"] && /^text\/html/.test(res.header["content-type"]), `content type is HTML: ${res.header["content-type"]}`);
        });

        it("can checkout a user with exact balance", async () => {
            await setBalance(37500);
            const res = await superagent.post(`${HOST}/rest/charge`)
                .type("form")
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    orderTotal: 37500,
                    "lightrail-amount": 37500,
                    source: null
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `body=${JSON.stringify(res.body)}`);
            chai.assert(res.header["content-type"] && /^text\/html/.test(res.header["content-type"]), `content type is HTML: ${res.header["content-type"]}`);
        });

        it("can checkout a user with over balance", async () => {
            await setBalance(50000);
            const res = await superagent.post(`${HOST}/rest/charge`)
                .type("form")
                .send({
                    shopperId: process.env.SHOPPER_ID,
                    currency: "USD",
                    orderTotal: 37500,
                    "lightrail-amount": 37500,
                    source: null
                })
                .ok(() => true);

            chai.assert.equal(res.status, 200, `body=${JSON.stringify(res.body)}`);
            chai.assert(res.header["content-type"] && /^text\/html/.test(res.header["content-type"]), `content type is HTML: ${res.header["content-type"]}`);
        });

        it("can create and credit an account", async () => {
            const shopperId = `sample-webapp-unittest-${uuid.v4()}`;
            const createRes = await superagent.post(`${HOST}/rest/createAccount`)
                .send({shopperId})
                .ok(() => true);

            chai.assert.equal(createRes.status, 200, `createRes=${createRes.text}`);
            chai.assert(createRes.header["content-type"] && /^text\/plain/.test(createRes.header["content-type"]), `content type is text: ${createRes.header["content-type"]}`);

            const contact = await lightrail.contacts.getContactByAnyIdentifier({shopperId});
            chai.assert.isObject(contact, "contact created");
            chai.assert.equal(contact.userSuppliedId, shopperId, "with new shopperId");

            const cardsRes = await lightrail.cards.getCards({contactId: contact.contactId, cardType: lightrail.model.Card.CardType.ACCOUNT_CARD, currency: "USD"});
            chai.assert.lengthOf(cardsRes.cards, 1, "has one card");
            chai.assert.equal(cardsRes.cards[0].contactId, contact.contactId, "has the right contactId");
            chai.assert.equal(cardsRes.cards[0].cardType, lightrail.model.Card.CardType.ACCOUNT_CARD, "is an account card");

            const creditRes = await superagent.post(`${HOST}/rest/creditAccount`)
                .send({
                    shopperId,
                    value: 500
                });

            chai.assert.equal(creditRes.status, 200, `creditRes=${creditRes.text}`);
            chai.assert(creditRes.header["content-type"] && /^text\/plain/.test(creditRes.header["content-type"]), `content type is text: ${creditRes.header["content-type"]}`);

            const details = await lightrail.cards.getDetails(cardsRes.cards[0]);
            chai.assert.isObject(details, "got card details");
            chai.assert.lengthOf(details.valueStores, 1, "has 1 value store");
            chai.assert.equal(details.valueStores[0].value, 500, "value store holds 500");
        });

        /**
         * Set the balance on the account of the .env SHOPPER_ID.
         */
        async function setBalance(value: number): Promise<void> {
            const contact = await lightrail.contacts.getContactByAnyIdentifier({shopperId: process.env.SHOPPER_ID});
            if (!contact) {
                throw new Error(`could not find shopper with shopperId '${process.env.SHOPPER_ID}'`);
            }

            const cardsRes = await lightrail.cards.getCards({contactId: contact.contactId, cardType: lightrail.model.Card.CardType.ACCOUNT_CARD, currency: "USD"});
            if (cardsRes.cards.length !== 1) {
                throw new Error(`could not find account card for contactId '${contact.contactId}' currency USD`);
            }
            const card = cardsRes.cards[0];

            const details = await lightrail.cards.getDetails(card);
            if (details.valueStores[0].value !== value) {
                await lightrail.cards.transactions.createTransaction(card, {
                    value: value - details.valueStores[0].value,
                    currency: "USD",
                    userSuppliedId: uuid.v4()
                });
            }
        }
        
        let cp: childProcess.ChildProcess;
        let cpExit: Promise<void>;

        before(async function () {
            this.timeout(30000);
            const cwd = path.join(__dirname, "..", "..", "..", testEnv.name);
            cp = childProcess.exec(`${testEnv.cmd}`, {cwd}, (error) => {
                if (error && (error as any).signal !== 'SIGTERM' && (error as any).signal !== 'SIGKILL') {
                    console.log(error);
                }
            });
            cpExit = new Promise((resolve) => {
                cp.on("exit", (code, signal) => {
                    DEBUG && console.log(`${testEnv.name} exited code=${code} signal=${signal}`);
                    resolve();
                });
            });
            await new Promise((resolve) => {
                cp.stdout.on("data", data => {
                    DEBUG && process.stdout.write(`${testEnv.name} stdout: ${data}`);
                    if (testEnv.initRegex.test(data as string)) {
                        resolve();
                    }
                });
                cp.stderr.on("data", data => {
                    DEBUG && process.stdout.write(`${testEnv.name} stderr: ${data}`);
                    if (testEnv.initRegex.test(data as string)) {
                        resolve();
                    }
                });
            });
        });

        after(async function () {
            this.timeout(30000);
            cp.kill("SIGTERM");

            console.log(Promise.all, Promise.race, Promise);
            await Promise.race([cpExit, new Promise(resolve => setTimeout(resolve, 10000))]);

            if (cp && !cp.killed) {
                console.error(`${testEnv.name} did not exit nicely after 10 seconds; hard killing`);
                cp.kill("SIGKILL");
                await cpExit;
            }

            cp = null;
            cpExit = null;
        });
    });
}
