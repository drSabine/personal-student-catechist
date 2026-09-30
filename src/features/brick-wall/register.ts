import { activityRegistry } from "@/core/activity/ActivityRegistry";
import { BrickWallActivity } from "./BrickWallActivity";
import { BrickWallView } from "./BrickWallView";

activityRegistry.register<BrickWallActivity>(BrickWallActivity.TYPE, BrickWallView);
