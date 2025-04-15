# `leader-tab`

An algorithm for selecting a leader from all the open tabs of a website. Uses the [Broadcast Channel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) API for synchronization.

```typescript
import { elector } from "leader-tab";

const tab = elector({
  onLeaderElected: () => {
    console.log("I am the leader");
  },
  onLeaderDemoted: () => {
    console.log("I got demoted");
  },
});

console.log("Current tab id", tab.getTabId());
console.log("Is current tab the leader", tab.isLeader());
console.log("Stop all synchronization work", tab.destroy());
```
