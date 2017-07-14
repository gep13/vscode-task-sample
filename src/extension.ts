'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

let taskProvider: vscode.Disposable | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cake-vscode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
    function onConfigurationChanged() {
        if (taskProvider) {
            taskProvider.dispose();
            taskProvider = undefined;
        } else if (!taskProvider) {
            taskProvider = vscode.workspace.registerTaskProvider('cake', {
                provideTasks: () => {
                    return getCakeScriptsAsTasks();
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

async function readFile(file: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.toString());
        });
    });
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

    vscode.workspace.findFiles('**/*.cake').then((files) => {
        if (files.length === 0) {
            return emptyTasks;
        }

        try {
            const result: vscode.Task[] = [];
            files.forEach(file => {
                const contents = fs.readFileSync(file.fsPath).toString();
                console.log(contents);
                const taskName = 'NuGet-Restore';
                const kind: CakeTaskDefinition = {
                    type: 'cake',
                    script: taskName
                };
                const task = new vscode.Task(kind, `run ${taskName}`, 'cake', new vscode.ShellExecution(`npm run ${taskName}`));
                task.group = vscode.TaskGroup.Build;
                console.log(task);
                result.push(task);
            });
            console.log(result);
            return Promise.resolve(result);
        } catch (e) {
            return Promise.resolve(emptyTasks);
        }
    });
};
