import { activityRegistry } from "@/core/activity/ActivityRegistry";
import { BayanActivity } from "./BayanActivity";
import { BayanView } from "./BayanView";

activityRegistry.register<BayanActivity>(BayanActivity.TYPE, BayanView);
