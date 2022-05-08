"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDevServer = void 0;
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const os = require("os");
const path_1 = require("path");
const cypress_1 = require("cypress");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function runCypress(options, context) {
    options.env = options.env || {};
    if (options.tsConfig) {
        options.env.tsConfig = path_1.join(context.workspaceRoot, options.tsConfig);
    }
    const projectName = context.target && context.target.project || '';
    const workspace = context.getProjectMetadata(projectName);
    return rxjs_1.from(workspace).pipe(operators_1.map(() => os.platform() === 'win32'), operators_1.map((isWin) => (!isWin ? core_1.normalize(context.workspaceRoot) : core_1.asWindowsPath(core_1.normalize(context.workspaceRoot)))), operators_1.map((workspaceRoot) => {
        return Object.assign(Object.assign({}, options), { projectPath: `${workspaceRoot}/cypress` });
    }), operators_1.switchMap((options) => {
        return (options.devServerTarget
            ? startDevServer(options.devServerTarget, options.watch, context)
            : rxjs_1.of(options.baseUrl)).pipe(operators_1.concatMap((baseUrl) => initCypress(Object.assign(Object.assign({}, options), { baseUrl }))), options.watch ? operators_1.tap(rxjs_1.noop) : operators_1.first(), operators_1.catchError((error) => {
            return rxjs_1.of({ success: false }).pipe(operators_1.tap(() => context.reportStatus(`Error: ${error.message}`)), operators_1.tap(() => context.logger.error(error.message)));
        }));
    }));
}
function initCypress(userOptions) {
    const projectFolderPath = path_1.dirname(userOptions.projectPath);
    const defaultOptions = {
        project: projectFolderPath,
        browser: 'electron',
        headless: true,
        record: false,
        spec: '',
    };
    const options = Object.assign(Object.assign(Object.assign({}, defaultOptions), userOptions), { 
        //@ts-ignore
        dev: process.env.CYPRESS_ENV === 'test' });
    if (userOptions.configFile === undefined) {
        options.config = {};
    }
    if (userOptions.baseUrl) {
        options.config = Object.assign(Object.assign({}, options.config), { baseUrl: userOptions.baseUrl });
    }
    const { watch, headless } = userOptions;
    return rxjs_1.from(watch === false || headless ? cypress_1.run(options) : cypress_1.open(options)).pipe(operators_1.map((result) => ({ success: !result.totalFailed && !result.failures })));
}
function startDevServer(devServerTarget, watch, context) {
    const overrides = {
        watch,
    };
    //@ts-ignore
    return architect_1.scheduleTargetAndForget(context, architect_1.targetFromTargetString(devServerTarget), overrides).pipe(
    //@ts-ignore
    operators_1.map((output) => {
        if (!output.success && !watch) {
            throw new Error('Could not compile application files');
        }
        return output.baseUrl;
    }));
}
exports.startDevServer = startDevServer;
exports.default = architect_1.createBuilder(runCypress);
//# sourceMappingURL=index.js.map