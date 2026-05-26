import { AgentChat } from "@/components/agent/AgentChat";

export const metadata = {
  title: "Agent · Movie App",
  description: "Conversational movie discovery powered by Algolia Agent Studio.",
};

export default function AgentPage() {
  return <AgentChat />;
}
