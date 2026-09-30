import { Observable } from "../Observable";

export interface ActivityInit {
  id: string;
  title: string;
  instructions: string;
}

/** One thing the class does in a lesson. Each kind extends this and keeps its rules here, away from React. */
export abstract class Activity<TSnapshot = unknown> extends Observable<TSnapshot> {
  /** Key used by the ActivityRegistry to find this activity's view. */
  abstract readonly type: string;

  readonly id: string;
  readonly title: string;
  readonly instructions: string;

  protected constructor(init: ActivityInit) {
    super();
    this.id = init.id;
    this.title = init.title;
    this.instructions = init.instructions;
  }

  abstract reset(): void;

  abstract isComplete(): boolean;
}
