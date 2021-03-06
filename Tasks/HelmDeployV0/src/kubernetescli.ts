import tl = require('azure-pipelines-task-lib/task');
import fs = require("fs");
import * as tr from "azure-pipelines-task-lib/toolrunner";
import basecommand from "./basecommand"

export default class kubernetescli extends basecommand {

    private kubeconfigPath: string;

    constructor(kubeconfigPath: string) {
        super(true);
        this.kubeconfigPath = kubeconfigPath;
    }
    public getTool(): string {
        return "kubectl";
    }

    public login(): void {
        process.env["KUBECONFIG"] = this.kubeconfigPath;
    }

    public logout(): void {
        if (this.kubeconfigPath != null && fs.existsSync(this.kubeconfigPath)) {
            delete process.env["KUBECONFIG"];
            fs.unlinkSync(this.kubeconfigPath);
        }
    }

    public setKubeConfigEnvVariable() {
        if (this.kubeconfigPath && fs.existsSync(this.kubeconfigPath)) {
            tl.setVariable("KUBECONFIG", this.kubeconfigPath);
        }
        else {
            tl.error(tl.loc('KubernetesServiceConnectionNotFound'));
            throw new Error(tl.loc('KubernetesServiceConnectionNotFound'));
        }
    }

    public unsetKubeConfigEnvVariable() {
        var kubeConfigPath = tl.getVariable("KUBECONFIG");
        if (kubeConfigPath) {
            tl.setVariable("KUBECONFIG", "");
        }
    }

    public getAllPods(): tr.IExecSyncResult {
        var command = this.createCommand();
        command.arg('get');
        command.arg('pods');
        command.arg(['-o', 'json']);
        return this.execCommandSync(command);
    }

    public getClusterInfo(): tr.IExecSyncResult {
        const command = this.createCommand();
        command.arg('cluster-info');
        return this.execCommandSync(command);
    }
}