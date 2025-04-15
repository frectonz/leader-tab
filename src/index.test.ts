import { expect, test } from "vitest";
import { elector } from ".";

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function onlyOneLeader(count: number) {
	const tabs = new Array(count).fill(null).map(() => elector());

	await sleep(1000);

	const oneLeader = tabs.filter((x) => x.isLeader()).length === 1;
	expect(oneLeader).toBe(true);

	return () => {
		tabs.forEach((tab) => tab.destroy());
	};
}

test("elects a single leader for 1 tab", async ({
	onTestFailed,
	onTestFinished,
}) => {
	const destroy = await onlyOneLeader(1);

	onTestFailed(() => destroy());
	onTestFinished(() => destroy());
});

test("elects a single leader for 2 tabs", async ({
	onTestFailed,
	onTestFinished,
}) => {
	const destroy = await onlyOneLeader(2);

	onTestFailed(() => destroy());
	onTestFinished(() => destroy());
});

test("elects a single leader for 10 tabs", async ({
	onTestFailed,
	onTestFinished,
}) => {
	const destroy = await onlyOneLeader(10);

	onTestFailed(() => destroy());
	onTestFinished(() => destroy());
});
