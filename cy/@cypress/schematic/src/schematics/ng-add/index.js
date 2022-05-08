"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeE2ELinting = exports.addCypressTsConfig = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const dependencies_1 = require("../utility/dependencies");
const utility_1 = require("../utility");
const path_1 = require("path");
const jsonFile_1 = require("../utility/jsonFile");
function default_1(_options) {
    return (tree, _context) => {
        _options = Object.assign(Object.assign({}, _options), { __version__: utility_1.getAngularVersion(tree) });
        return schematics_1.chain([
            updateDependencies(),
            addCypressFiles(),
            addCypressTestScriptsToPackageJson(),
            modifyAngularJson(_options),
        ])(tree, _context);
    };
}
exports.default = default_1;
function addPropertyToPackageJson(tree, path, value) {
    const json = new jsonFile_1.JSONFile(tree, '/package.json');
    json.modify(path, value);
}
function updateDependencies() {
    return (tree, context) => {
        context.logger.debug('Updating dependencies...');
        context.addTask(new tasks_1.NodePackageInstallTask());
        const addDependencies = rxjs_1.of('cypress').pipe(operators_1.concatMap((packageName) => utility_1.getLatestNodeVersion(packageName)), operators_1.map((packageFromRegistry) => {
            const { name, version } = packageFromRegistry;
            context.logger.debug(`Adding ${name}:${version} to ${dependencies_1.NodeDependencyType.Dev}`);
            dependencies_1.addPackageJsonDependency(tree, {
                type: dependencies_1.NodeDependencyType.Dev,
                name,
                version,
            });
            return tree;
        }));
        return addDependencies;
    };
}
function addCypressTestScriptsToPackageJson() {
    return (tree) => {
        addPropertyToPackageJson(tree, ['scripts'], {
            'e2e': 'ng e2e',
            'cypress:open': 'cypress open',
            'cypress:run': 'cypress run',
        });
    };
}
function addCypressFiles() {
    return (tree, context) => {
        context.logger.debug('Adding cypress files');
        const angularJsonValue = getAngularJsonValue(tree);
        const { projects } = angularJsonValue;
        return schematics_1.chain(Object.keys(projects).map((name) => {
            const project = projects[name];
            const projectPath = path_1.resolve(core_1.getSystemPath(core_1.normalize(project.root)));
            const workspacePath = path_1.resolve(core_1.getSystemPath(core_1.normalize('')));
            const relativeToWorkspace = path_1.relative(`${projectPath}/cypress`, workspacePath);
            const baseUrl = getBaseUrl(project);
            return schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [
                schematics_1.move(project.root),
                schematics_1.template(Object.assign(Object.assign({}, core_1.strings), { root: project.root ? `${project.root}/` : project.root, baseUrl,
                    relativeToWorkspace })),
            ]));
        }))(tree, context);
    };
}
function getBaseUrl(project) {
    var _a, _b, _c, _d;
    let options = { protocol: 'http', port: 4200, host: 'localhost' };
    if ((_b = (_a = project.architect) === null || _a === void 0 ? void 0 : _a.serve) === null || _b === void 0 ? void 0 : _b.options) {
        const projectOptions = (_d = (_c = project.architect) === null || _c === void 0 ? void 0 : _c.serve) === null || _d === void 0 ? void 0 : _d.options;
        options = Object.assign(Object.assign({}, options), projectOptions);
        options.protocol = projectOptions.ssl ? 'https' : 'http';
    }
    return `${options.protocol}://${options.host}:${options.port}`;
}
function addNewCypressCommands(tree, angularJsonVal, project, runJson, openJson, e2eJson, e2eUpdate) {
    const projectArchitectJson = angularJsonVal['projects'][project]['architect'];
    projectArchitectJson['cypress-run'] = runJson;
    projectArchitectJson['cypress-open'] = openJson;
    if (e2eUpdate || !projectArchitectJson['e2e']) {
        projectArchitectJson['e2e'] = e2eJson;
    }
    return tree.overwrite('./angular.json', JSON.stringify(angularJsonVal, null, 2));
}
function getAngularJsonValue(tree) {
    const angularJson = new jsonFile_1.JSONFile(tree, './angular.json');
    return angularJson.get([]);
}
function modifyAngularJson(options) {
    return (tree, context) => {
        if (tree.exists('./angular.json')) {
            const angularJsonVal = getAngularJsonValue(tree);
            const { projects } = angularJsonVal;
            if (!projects) {
                throw new schematics_1.SchematicsException('projects in angular.json is not defined');
            }
            Object.keys(projects).forEach((project) => {
                const builder = '@cypress/schematic:cypress';
                const runJson = {
                    builder,
                    options: {
                        devServerTarget: `${project}:serve`,
                    },
                    configurations: {
                        production: {
                            devServerTarget: `${project}:serve:production`,
                        },
                    },
                };
                const openJson = {
                    builder,
                    options: {
                        watch: true,
                        headless: false,
                    },
                };
                const e2eJson = {
                    builder,
                    options: {
                        devServerTarget: `${project}:serve`,
                        watch: true,
                        headless: false,
                    },
                    configurations: {
                        production: {
                            devServerTarget: `${project}:serve:production`,
                        },
                    },
                };
                const configFile = projects[project].root
                    ? `${projects[project].root}/cypress.json`
                    : null;
                if (configFile) {
                    Object.assign(runJson.options, { configFile });
                    Object.assign(openJson.options, { configFile });
                }
                if (options.e2eUpdate) {
                    context.logger.debug(`Replacing e2e command with cypress-run in angular.json`);
                    exports.removeE2ELinting(tree, angularJsonVal, project);
                }
                context.logger.debug(`Adding cypress/tsconfig.json to angular.json-tslint config`);
                exports.addCypressTsConfig(tree, angularJsonVal, project);
                context.logger.debug(`Adding cypress-run and cypress-open commands in angular.json`);
                addNewCypressCommands(tree, angularJsonVal, project, runJson, openJson, e2eJson, options.e2eUpdate);
            });
        }
        else {
            throw new schematics_1.SchematicsException('angular.json not found');
        }
        return tree;
    };
}
const addCypressTsConfig = (tree, angularJsonVal, projectName) => {
    var _a, _b, _c;
    const project = angularJsonVal.projects[projectName];
    let tsConfig = (_c = (_b = (_a = project === null || project === void 0 ? void 0 : project.architect) === null || _a === void 0 ? void 0 : _a.lint) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.tsConfig;
    if (tsConfig) {
        let prefix = '';
        if (project.root) {
            prefix = `${project.root}/`;
        }
        if (!Array.isArray(tsConfig)) {
            project.architect.lint.options.tsConfig = tsConfig = [tsConfig];
        }
        tsConfig.push(`${prefix}cypress/tsconfig.json`);
    }
    return tree.overwrite('./angular.json', JSON.stringify(angularJsonVal, null, 2));
};
exports.addCypressTsConfig = addCypressTsConfig;
const removeE2ELinting = (tree, angularJsonVal, project) => {
    var _a, _b, _c, _d, _e;
    const projectLintOptionsJson = (_c = (_b = (_a = angularJsonVal.projects[project]) === null || _a === void 0 ? void 0 : _a.architect) === null || _b === void 0 ? void 0 : _b.lint) === null || _c === void 0 ? void 0 : _c.options;
    if (projectLintOptionsJson) {
        let filteredTsConfigPaths;
        if (Array.isArray(projectLintOptionsJson['tsConfig'])) {
            filteredTsConfigPaths = (_d = projectLintOptionsJson === null || projectLintOptionsJson === void 0 ? void 0 : projectLintOptionsJson.tsConfig) === null || _d === void 0 ? void 0 : _d.filter((path) => {
                const pathIncludesE2e = path.includes('e2e');
                return !pathIncludesE2e && path;
            });
        }
        else {
            filteredTsConfigPaths = !((_e = projectLintOptionsJson === null || projectLintOptionsJson === void 0 ? void 0 : projectLintOptionsJson.tsConfig) === null || _e === void 0 ? void 0 : _e.includes('e2e'))
                ? projectLintOptionsJson === null || projectLintOptionsJson === void 0 ? void 0 : projectLintOptionsJson.tsConfig
                : '';
        }
        projectLintOptionsJson['tsConfig'] = filteredTsConfigPaths;
    }
    return tree.overwrite('./angular.json', JSON.stringify(angularJsonVal, null, 2));
};
exports.removeE2ELinting = removeE2ELinting;
//# sourceMappingURL=index.js.map