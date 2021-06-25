import mockModule from "mock-require";
import * as httpProxy from "@web-desktop-environment/http-proxy-fork";
mockModule("http-proxy", httpProxy);
import React from "react";
import { Render } from "@react-fullstack/render";
import { Server } from "@react-fullstack/fullstack-socket-server";
import { viewInterfaces } from "@web-desktop-environment/interfaces";
import Desktop from "@desktop/index";
import DesktopManager from "@managers/desktopManager";
import Logger from "@utils/logger";
import { AppProvider } from "@root/contexts";

const rootLogger = new Logger();

const desktopManager = new DesktopManager("desktop-manager", rootLogger);

export const startServer = async () => {
	await desktopManager.settingsManager.initialize();
	await desktopManager.downloadManager.initialize();
	const desktopPort = await desktopManager.portManager.getPort();

	desktopManager.portManager.startBridge(desktopPort);

	Render(
		<Server views={viewInterfaces} singleInstance port={desktopPort}>
			{() => (
				<AppProvider.Provider value={{ desktopManager, logger: rootLogger }}>
					<Desktop />
				</AppProvider.Provider>
			)}
		</Server>
	);
};
