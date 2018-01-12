import * as childProcess from "child_process";
import * as path from "path";
import * as superagent from "superagent";
import {testEnvs} from "./testEnvs";

const HOST = "http://localhost:3000";
const DEBUG = false;

for (const testEnv of testEnvs) {
    describe(testEnv.name, () => {

        let cp: childProcess.ChildProcess;
        let cpExit: Promise<void>;

        it(`stands up a server on ${HOST}`, async () => {
            await superagent.get(HOST);
        });

        before(async function () {
            this.timeout(30000);
            const cwd = path.join(__dirname, "..", "..", "..", testEnv.name);
            cp = childProcess.exec(`${testEnv.cmd}`, {cwd}, (error, stdout, stderr) => {
                if (error && (error as any).signal !== 'SIGTERM') {
                    console.log(error);
                }
            });
            cpExit = new Promise((resolve, reject) => {
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
