export interface TestEnv {
    /**
     * The name of the test environment which is also the project dir name.
     */
    name: string;

    /**
     * Command to start the web server.
     */
    cmd: string;

    /**
     * stdout string that indicates the server is up.
     */
    startComplete: RegExp;
}

export const testEnvs: TestEnv[] = [
    {
        name: "node",
        cmd: "npm start",
        startComplete: /Lightrail demo running on http:\/\/localhost:3000/
    },
    {
        name: "ruby",
        cmd: "ruby lib/app.rb",
        startComplete: /WEBrick::HTTPServer#start/
    }
];

// }
//
// export const testEnvs: TestEnv[] = [
//     {
//         name: "node",
//         cmd: "npm",
//         args: ["start"],
//         startComplete: /Lightrail demo running on http:\/\/localhost:3000/
//     },
//     {
//         name: "ruby",
//         cmd: "ruby",
//         args: ["lib/app.rb"],
//         startComplete: /WEBrick::HTTPServer#start/
//     }
// ];
