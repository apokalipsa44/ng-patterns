"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
function createSpec(tree) {
    return {
        readFile(path) {
            return __awaiter(this, void 0, void 0, function* () {
                const data = tree.read(path);
                if (!data) {
                    throw new schematics_1.SchematicsException('File not found.');
                }
                return core_1.virtualFs.fileBufferToString(data);
            });
        },
        writeFile(path, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return tree.overwrite(path, data);
            });
        },
        isDirectory(path) {
            return __awaiter(this, void 0, void 0, function* () {
                return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
            });
        },
        isFile(path) {
            return __awaiter(this, void 0, void 0, function* () {
                return tree.exists(path);
            });
        },
    };
}
function default_1(options) {
    return (tree) => __awaiter(this, void 0, void 0, function* () {
        const host = createSpec(tree);
        const { workspace } = yield core_1.workspaces.readWorkspace('/', host);
        if (!options.project) {
            // @ts-ignore
            options.project = workspace.extensions.defaultProject;
        }
        //@ts-ignore
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Invalid project name: ${options.project}`);
        }
        if (options.path === undefined) {
            options.path = `${project.root}/cypress/integration`;
        }
        const templateSource = schematics_1.apply(schematics_1.url('../files/__path__'), [
            schematics_1.applyTemplates({
                classify: core_1.strings.classify,
                dasherize: core_1.strings.dasherize,
                name: options.name,
            }),
            schematics_1.move(core_1.normalize(options.path)),
        ]);
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource),
        ]);
    });
}
exports.default = default_1;
//# sourceMappingURL=index.js.map