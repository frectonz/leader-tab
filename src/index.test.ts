import { expect, test } from "vitest";
import { elector } from ".";

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

test("test", async ({ onTestFailed, onTestFinished }) => {
	const ops: string[] = [];

	const { isLeader, destroy } = elector({
		onLeaderDemoted() {
			ops.push("demoted");
		},
		onLeaderElected() {
			ops.push("elected");
		},
	});

	await sleep(1000);

	expect(isLeader()).toBe(true);
	expect(ops).toEqual(["elected"]);


	onTestFailed(() => destroy());
	onTestFinished(() => destroy());
});
