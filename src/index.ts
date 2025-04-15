export type ElectorParams = {
	/**
	 * The name of the channel to use for the `BroadcastChannel`.
	 */
	channelName?: string;
	/**
	 * Interval for sending heartbeats
	 */
	heartbeatInterval?: number;
	/**
	 * Timeout for considering a tab dead if we have received no hearbeat.
	 */
	deathTimeout?: number;
};

export type ElectorCallbacks = {
	/**
	 * Function to be run when the current tab is elected the leader.
	 */
	onLeaderElected: () => void;
	/**
	 * Function to be run when the current tab is demoted from being the leader.
	 */
	onLeaderDemoted: () => void;
};

export type Elector = ReturnType<typeof elector>;

const defaultParams: Required<ElectorParams> = {
	channelName: "leader-election",
	heartbeatInterval: 50,
	deathTimeout: 500,
};

/**
 * Sets up elector selection mechanism.
 */
export function elector(
	{ onLeaderElected, onLeaderDemoted }: ElectorCallbacks = {
		onLeaderElected: () => {},
		onLeaderDemoted: () => {},
	},
	{
		channelName = defaultParams.channelName,
		heartbeatInterval = defaultParams.heartbeatInterval,
		deathTimeout = defaultParams.deathTimeout,
	}: ElectorParams = defaultParams,
) {
	const tabId = crypto.randomUUID();

	const channel = new BroadcastChannel(channelName);
	const knownTabs = new Map<string, number>();
	let isLeader = false;

	// Send heartbeat at regular intervals
	function heartbeat() {
		channel.postMessage({ type: "heartbeat", tabId });
		knownTabs.set(tabId, Date.now());
		electLeader();
	}

	// Clean up dead tabs
	function cleanup() {
		const now = Date.now();
		for (const [id, lastSeen] of knownTabs.entries()) {
			if (now - lastSeen > deathTimeout) {
				knownTabs.delete(id);
			}
		}
		electLeader();
	}

	// Elect a leader
	function electLeader() {
		const sorted = [...knownTabs.keys()].sort();
		const newLeader = sorted[0];
		const wasLeader = isLeader;
		isLeader = newLeader === tabId;

		if (isLeader && !wasLeader) {
			onLeaderElected();
		} else if (!isLeader && wasLeader) {
			onLeaderDemoted();
		}
	}

	function handleMessage(event: MessageEvent<{ type: string; tabId: string }>) {
		const msg = event.data;
		if (msg.type === "heartbeat") {
			knownTabs.set(msg.tabId, Date.now());
		} else if (msg.type === "goodbye") {
			knownTabs.delete(msg.tabId);
		} else if (msg.type === "new-leader") {
		}
	}

	// Listen for incoming messages
	channel.addEventListener("message", handleMessage);

	// function onTabClose() {
	// 	channel.postMessage({ type: "goodbye", tabId });
	// }

	// // Clean exit: say goodbye to other tabs
	// window.addEventListener("beforeunload", onTabClose);

	const heartbeatIntervalId = setInterval(heartbeat, heartbeatInterval);
	const cleanupIntervalId = setInterval(cleanup, heartbeatInterval);

	return Object.freeze({
		isLeader: () => isLeader,
		getTabId: () => tabId,
		destroy: () => {
			clearInterval(heartbeatIntervalId);
			clearInterval(cleanupIntervalId);
			// window.removeEventListener("beforeunload", onTabClose);
			channel.postMessage({ type: "goodbye", tabId });
			channel.removeEventListener("message", handleMessage);
		},
	});
}
