import type { ComponentType } from "react";
import type { Lesson } from "../lesson/Lesson";
import type { Activity } from "./Activity";

export interface ActivityViewProps<TActivity extends Activity = Activity> {
  activity: TActivity;
  lesson: Lesson;
}

type AnyActivityView = ComponentType<ActivityViewProps>;

/** Maps an activity type to the component that shows it. Types register in src/features/index.ts. */
export class ActivityRegistry {
  private readonly views = new Map<string, AnyActivityView>();

  register<TActivity extends Activity>(
    type: string,
    view: ComponentType<ActivityViewProps<TActivity>>,
  ): void {
    // Registering the same type again replaces it (this happens on hot reload).
    // Safe: resolve() only hands this view activities of the same type.
    this.views.set(type, view as unknown as AnyActivityView);
  }

  resolve(activity: Activity): AnyActivityView {
    const view = this.views.get(activity.type);
    if (!view) {
      throw new Error(`No view registered for activity type "${activity.type}".`);
    }
    return view;
  }
}

export const activityRegistry = new ActivityRegistry();
