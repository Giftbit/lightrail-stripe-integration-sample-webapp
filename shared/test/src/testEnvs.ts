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
     * Regex over stdout and stderror that confirms the web server is up.
     */
    initRegex: RegExp;
}

export const testEnvs: TestEnv[] = [
    {
        name: "node",
        cmd: "npm start",
        initRegex: /Lightrail demo running on http:\/\/localhost:3000/
    },
    {
        name: "ruby",
        cmd: "ruby lib/app.rb",
        initRegex: /WEBrick::HTTPServer#start/
    }
];
