import { activityRegistry } from "@/core/activity/ActivityRegistry";
import { BayanihanActivity } from "./BayanihanActivity";
import { BayanihanView } from "./BayanihanView";

activityRegistry.register<BayanihanActivity>(BayanihanActivity.TYPE, BayanihanView);
