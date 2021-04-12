import React from "react";
import { ViewInterfacesType } from "@web-desktop-environment/interfaces";
import { ViewsProvider } from "@react-fullstack/fullstack";
import { ViewsToServerComponents } from "@react-fullstack/fullstack/lib/Views";
import API from "@web-desktop-environment/server-api";
import Window from "./window";
import { App } from "../appManger";
import { LoggingManager } from "@web-desktop-environment/server-api/lib/frontend/managers/logging/loggingManager";

export interface AppBaseProps<Input, PropsForRunningAsChildApp> {
	input: Input;
	parentLogger: LoggingManager;
	propsForRunningAsChildApp?: PropsForRunningAsChildApp;
	propsForRunningAsSelfContainedApp?: {
		close(): void;
		appData: Omit<App<Input>, "App" | "defaultInput">;
	};
}

export interface AppBaseState {
	useDefaultWindow: boolean;
	defaultWindowTitle?: string;
}

abstract class AppBase<
	Input extends object,
	State extends object,
	PropsForRunningAsChildApp extends object = {}
> extends React.Component<
	AppBaseProps<Input, PropsForRunningAsChildApp>,
	State & AppBaseState
> {
	protected api = API;
	_logger: LoggingManager;
	abstract name: string;
	get logger() {
		if (!this._logger) {
			this._logger = this.props.parentLogger.mount(this.name);
		}
		return this._logger;
	}
	abstract renderApp: (
		views: ViewsToServerComponents<ViewInterfacesType>
	) => JSX.Element | JSX.Element[];
	render() {
		const { useDefaultWindow, defaultWindowTitle } = this.state;
		const { propsForRunningAsSelfContainedApp } = this.props;
		const { icon, name, window } =
			propsForRunningAsSelfContainedApp?.appData || {};
		const { close } = propsForRunningAsSelfContainedApp || {};
		return (
			<ViewsProvider<ViewInterfacesType>>
				{(views) => (
					<>
						{useDefaultWindow && propsForRunningAsSelfContainedApp ? (
							<Window
								icon={icon}
								name={name}
								title={defaultWindowTitle}
								windowProperties={window}
								close={close}
							>
								{this.renderApp(views)}
							</Window>
						) : (
							this.renderApp(views)
						)}
					</>
				)}
			</ViewsProvider>
		);
	}
}

export default AppBase;
