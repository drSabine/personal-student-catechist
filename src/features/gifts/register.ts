import { activityRegistry } from "@/core/activity/ActivityRegistry";
import { GiftsActivity } from "./GiftsActivity";
import { GiftsView } from "./GiftsView";

activityRegistry.register<GiftsActivity>(GiftsActivity.TYPE, GiftsView);
