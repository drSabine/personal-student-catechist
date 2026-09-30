import { redirect } from "next/navigation";
import { lessons } from "@/content/lessons";

/** No landing page: go straight to the newest lesson. */
export default function Home() {
  redirect(`/lessons/${lessons[lessons.length - 1].id}`);
}
