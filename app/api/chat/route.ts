import {chat,chatParamsFromRequest,toServerSentEventsResponse} from "@tanstack/ai";

import { openRouterText } from "@tanstack/ai-openrouter";

export async function POST(request: Request) {
  try {
    const { messages, threadId, runId } =
      await chatParamsFromRequest(request);

    const stream = chat({
      adapter: openRouterText("openrouter/auto"),
      messages,
      threadId,
      runId,
    });

    return toServerSentEventsResponse(stream);
  } catch (error: unknown) {
    console.error("CHAT_API_ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}