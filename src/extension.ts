'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

let taskProvider: vscode.Disposable | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    function onConfigurationChanged() {
        if (taskProvider) {
            taskProvider.dispose();
            taskProvider = undefined;
        } else if (!taskProvider) {
            taskProvider = vscode.workspace.registerTaskProvider('cake', {
                provideTasks: async () => {
                    return await getCakeScriptsAsTasks();
                },
                resolveTask(_task: vscode.Task): vscode.Task | undefined {
                    return undefined;
                }
            });
        }
    }

    vscode.workspace.onDidChangeConfiguration(onConfigurationChanged);
    onConfigurationChanged();
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (taskProvider) {
        taskProvider.dispose();
    }
}

interface CakeTaskDefinition extends vscode.TaskDefinition {
    script: string;
    file?: string;
}

async function getCakeScriptsAsTasks(): Promise<vscode.Task[]> {
    let workspaceRoot = vscode.workspace.rootPath;
    let emptyTasks: vscode.Task[] = [];

    if (!workspaceRoot) {
        return emptyTasks;
    }

    try {
        let files = await vscode.workspace.findFiles('**/*.cake');
        if (files.length === 0) {
            return emptyTasks;
        }
        const result: vscode.Task[] = [];
        result.push(new vscode.Task({type: 'cake', script: 'NuGet-Restore'} as CakeTaskDefinition, 'Nuget-Restore', 'cake', new vscode.ShellExecution('npm install'), []));
        return result;
    } catch (e) {
        return [];
    }
};
