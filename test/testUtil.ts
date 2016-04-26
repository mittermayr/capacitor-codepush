/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../typings/node.d.ts" />

"use strict";

import child_process = require("child_process");
import os = require("os");
import path = require("path");
import Q = require("q");

export class TestUtil {
    public static ANDROID_PLATFORM_OPTION_NAME: string = "--android";
    public static IOS_PLATFORM_OPTION_NAME: string = "--ios";
    public static SHOULD_USE_WKWEBVIEW: string = "--use-wkwebview";
    public static TEST_RUN_DIRECTORY: string = "--test-directory";
    public static TEST_UPDATES_DIRECTORY: string = "--updates-directory";
    public static CORE_TESTS_ONLY: string = "--core";
    public static PULL_FROM_NPM: string = "--npm";
    
    public static IOSServerUrl = "http://127.0.0.1:3000";
    public static AndroidServerUrl = "http://10.0.2.2:3000";
    
    public static templatePath = path.join(__dirname, "../../test/template");
    public static thisPluginPath = path.join(__dirname, "../..");
    private static defaultTestRunDirectory = path.join(os.tmpdir(), "cordova-plugin-code-push", "test-run");
    private static defaultUpdatesDirectory = path.join(os.tmpdir(), "cordova-plugin-code-push", "updates");
    
    /**
     * Reads the directory in which the test project is.
     */
    public static readTestRunDirectory(): string {
        var commandLineOption = TestUtil.readMochaCommandLineOption(TestUtil.TEST_RUN_DIRECTORY);
        var testRunDirectory = commandLineOption ? commandLineOption : TestUtil.defaultTestRunDirectory;
        console.log("testRunDirectory = " + testRunDirectory);
        return testRunDirectory;
    }
    
    /**
     * Reads the directory in which the test project for updates is.
     */
    public static readTestUpdatesDirectory(): string {
        var commandLineOption = TestUtil.readMochaCommandLineOption(TestUtil.TEST_UPDATES_DIRECTORY);
        var testUpdatesDirectory = commandLineOption ? commandLineOption : TestUtil.defaultUpdatesDirectory;
        console.log("testUpdatesDirectory = " + testUpdatesDirectory);
        return testUpdatesDirectory;
    }
    
    /**
     * Reads the path of the plugin (whether or not we should use the local copy or pull from npm)
     */
    public static readPluginPath(): string {
        var commandLineFlag = TestUtil.readMochaCommandLineFlag(TestUtil.PULL_FROM_NPM);
        var pluginPath = commandLineFlag ? "cordova-plugin-code-push" : TestUtil.thisPluginPath;
        console.log("pluginPath = " + pluginPath);
        return pluginPath;
    }
    
    /**
     * Reads whether or not only core tests should be run.
     */
    public static readCoreTestsOnly(): boolean {
        var coreTestsOnly = TestUtil.readMochaCommandLineFlag(TestUtil.CORE_TESTS_ONLY);
        if (coreTestsOnly) console.log("only core tests");
        return coreTestsOnly;
    }
    
    /**
     * Reads the test target platforms.
     */
    public static readTargetPlatforms(): string[] {
        var platforms: string[] = [];
        if (this.readMochaCommandLineFlag(TestUtil.ANDROID_PLATFORM_OPTION_NAME)) {
            console.log("Android");
            platforms.push("android");
        }
        if (this.readMochaCommandLineFlag(TestUtil.IOS_PLATFORM_OPTION_NAME)) {
            console.log("iOS");
            platforms.push("ios");
        }
        return platforms;
    }
    
    /**
     * Reads if we should use the WkWebView or the UIWebView or run tests for both.
     * 0 for UIWebView, 1 for WkWebView, 2 for both
     */
    public static readShouldUseWkWebView(): number {
        var shouldUseWkWebView = TestUtil.readMochaCommandLineOption(TestUtil.SHOULD_USE_WKWEBVIEW);
        switch (shouldUseWkWebView) {
            case "true":
                console.log("WkWebView");
                return 1;
            case "both":
                console.log("Both WkWebView and UIWebView");
                return 2;
            case "false":
            default:
                return 0;
        }
    }

	/**
	 * Reads command line options passed to mocha.
	 */
    private static readMochaCommandLineOption(optionName: string): string {
        var optionValue: string = undefined;

        for (var i = 0; i < process.argv.length; i++) {
            if (process.argv[i].indexOf(optionName) === 0) {
                if (i + 1 < process.argv.length) {
                    optionValue = process.argv[i + 1];
                }
                break;
            }
        }

        return optionValue;
    }

	/**
	 * Reads command line options passed to mocha.
	 */
    private static readMochaCommandLineFlag(optionName: string): boolean {
        for (var i = 0; i < process.argv.length; i++) {
            if (process.argv[i].indexOf(optionName) === 0) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Executes a child process returns its output as a string.
     */
    public static getProcessOutput(command: string, options?: child_process.IExecOptions, logOutput: boolean = false): Q.Promise<string> {
        var deferred = Q.defer<string>();
        var result = "";

        options = options || {};
        options.maxBuffer = 1024 * 500;

        if (logOutput) {
            console.log("Running command: " + command);
        }

        child_process.exec(command, options, (error: Error, stdout: Buffer, stderr: Buffer) => {

            result += stdout;

            if (logOutput) {
                stdout && console.log(stdout);
            }

            if (stderr) {
                console.error("" + stderr);
            }

            if (error) {
                console.error("" + error);
                deferred.reject(error);
            } else {
                deferred.resolve(result);
            }
        });

        return deferred.promise;
    }
}