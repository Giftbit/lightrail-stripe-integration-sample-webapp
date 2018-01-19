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
        name: "dotnet",
        cmd: "dotnet run",
        initRegex: /Now listening on: http:\/\/(127\.0\.0\.1|localhost):3000/
    },
    // {
    //     name: "node",
    //     cmd: "npm start",
    //     initRegex: /Lightrail demo running on http:\/\/localhost:3000/
    // },{
    //     name: "php",
    //     cmd: "docker-compose up",
    //     initRegex: /Apache.* configured -- resuming normal operations/
    // },
    // {
    //     name: "ruby",
    //     cmd: "ruby lib/app.rb",
    //     initRegex: /WEBrick::HTTPServer#start/
    // }
];
