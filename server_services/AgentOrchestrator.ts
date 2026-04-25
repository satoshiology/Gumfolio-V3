import OpenMolt, { ToolDefinition } from 'openmolt';
import { ServerActionRegistry } from './ServerActionRegistry';

export function createServerAgent(accessToken: string, integrations: Record<string, boolean>, model: string = 'google:gemini-2.0-flash') {
  const om = new OpenMolt({
    llmProviders: {
      google: { apiKey: process.env.GEMINI_API_KEY! },
    },
  });

  const tools: ToolDefinition[] = Array.from(ServerActionRegistry.entries())
    .filter(([id]) => integrations[id] !== false) // Only include if not explicitly disabled
    .map(([id, action]) => ({
      handle: id,
      name: id,
      description: action.description,
      parameters: action.parameters,
      execute: async (args: any) => {
        const startTime = Date.now();
        console.log(`[AgentOrchestrator] Executing tool ${id} with args:`, JSON.stringify(args));
        try {
          const result = await action.execute(accessToken, ...Object.values(args));
          console.log(`[AgentOrchestrator] Tool ${id} execution succeeded. Duration: ${Date.now() - startTime}ms`);
          return result;
        } catch (error: any) {
          console.error(`[AgentOrchestrator] Tool ${id} execution failed. Duration: ${Date.now() - startTime}ms`, error.message);
          throw error;
        }
      },
    }));

  const agent = om.createAgent({
    name: 'GumroadAgent',
    model: model || 'google:gemini-2.0-flash',
    instructions: `You are the Gumfolio AI Strategist. You have full administrative access to the user's Gumroad account via your tools.
    WHEN THE USER ASKS YOU TO PERFORM ACTIONS LIKE REFUNDING, ENABLING, DISABLING, ROTATING, OR INCREMENTING LICENSE USAGE, YOU MUST USE THE PROVIDED TOOLS. DO NOT ASK THE USER TO LOG IN MANUALLY.
    You are an autonomous agent capable of executing business actions on behalf of the user.

    CRITICAL RESPONSE GUIDELINES:
    1. Your responses MUST be extremely concise.
    2. Limit all responses to 2-3 short sentences maximum.
    3. Be direct, clear, and easy to understand. Do not use filler text or verbose explanations.`,
    tools: tools,
  } as any);

  return agent;
}
