import { ChildProcess } from "child_process";
import ManagerBase from "./managerBase";

abstract class APIBase {
  private managers = new Map<string, ManagerBase<any>>();
  private childProcess = new Set<ChildProcess>();
  protected registerManager<Manager extends ManagerBase<any>>(
    manager: Manager
  ) {
    manager.managerInternalEmitter.on(
      "callFunction",
      ({ id, name, parameters }) => {
        process.on("message", (message) => {
          if (
            message &&
            message.type === "api_super_response" &&
            message.id === id
          ) {
            manager.managerInternalEmitter.call("resolveFunction", {
              id,
              name,
              value: message.value,
            });
          }
        });
        if (process.send) {
          process.send({
            type: "api_super_request",
            id,
            managerName: manager.name,
            functionName: name,
            parameters,
          });
        } else {
          throw new Error(
            `manager(${manager.name}) is trying to call super function(${name}) but running from root process`
          );
        }
      }
    );
    manager.managerInternalEmitter.on("callEvent", ({ name, value }) => {
      this.childProcess.forEach((cp) => {
        cp.send({
          type: "api_event_call",
          managerName: manager.name,
          eventName: name,
          value,
        });
      });
    });
    process.on("message", (message) => {
      if (message && message.type === "api_event_call") {
        const { managerName, value, eventName } = message;
        if (managerName === manager.name) {
          manager.call(eventName, value);
        }
      }
    });
    this.managers.set(manager.name, manager);
    return manager;
  }
  public addChildProcess(cp: ChildProcess) {
    let isAlive = true;
    cp.on("message", (message) => {
      if (message) {
        if (message.type === "api_super_request") {
          const { id, managerName, functionName, parameters } = message;
          const targetManager = this.managers.get(managerName);
          if (!targetManager) {
            throw new Error(
              `child process is trying to access unknown manager(${managerName})`
            );
          }
          targetManager.functionHandlers[functionName](...parameters).then(
            (value) => {
              if (isAlive) {
                cp.send({
                  type: "api_super_response",
                  id,
                  name: functionName,
                  value,
                });
              }
            }
          );
        }
      }
    });
    this.childProcess.add(cp);
    cp.on("exit", () => {
      isAlive = false;
      this.childProcess.delete(cp);
    });
  }
}

export default APIBase;
