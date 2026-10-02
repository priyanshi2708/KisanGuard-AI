/**
 * KisanGuard AI — Central Tool Registry
 * 
 * Manages tool registration, tool declaration schemas for LLM tool selection,
 * security authorization checks, input validation, execution routing, and safe logging.
 */

import { weatherTool } from './weatherTool.js';
import { cropVisionTool } from './cropVisionTool.js';
import { agriculturalKnowledgeTool } from './agriculturalKnowledgeTool.js';
import { marketPriceTool } from './marketPriceTool.js';
import { governmentSchemeTool } from './governmentSchemeTool.js';
import { cropRecommendationTool } from './cropRecommendationTool.js';
import { cropRiskTool } from './cropRiskTool.js';

export const jsonTool = {
  name: 'json',
  description: 'Submit the final JSON structured response to the user.',
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      text: { type: 'string' },
      bulletPoints: { type: 'array', items: { type: 'string' } },
      actionSteps: { type: 'array', items: { type: 'string' } },
      suggestions: { type: 'array', items: { type: 'string' } }
    }
  },
  execute: async (params) => ({ success: true, data: params })
};

export const jsonResponseTool = {
  name: 'json_response',
  description: 'Submit the final JSON structured response to the user.',
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      text: { type: 'string' },
      bulletPoints: { type: 'array', items: { type: 'string' } },
      actionSteps: { type: 'array', items: { type: 'string' } },
      suggestions: { type: 'array', items: { type: 'string' } }
    }
  },
  execute: async (params) => ({ success: true, data: params })
};

// Central Registry of Authorized Tools
const registeredTools = new Map([
  [weatherTool.name, weatherTool],
  [cropVisionTool.name, cropVisionTool],
  [agriculturalKnowledgeTool.name, agriculturalKnowledgeTool],
  [marketPriceTool.name, marketPriceTool],
  [governmentSchemeTool.name, governmentSchemeTool],
  [cropRecommendationTool.name, cropRecommendationTool],
  [cropRiskTool.name, cropRiskTool],
  [jsonTool.name, jsonTool],
  [jsonResponseTool.name, jsonResponseTool]
]);





/**
 * Returns array of all registered tool objects
 */
export function getRegisteredTools() {
  return Array.from(registeredTools.values());
}

/**
 * Returns OpenAI/Groq compliant tool declarations for LLM function calling
 */
export function getToolDeclarations() {
  return Array.from(registeredTools.values()).map(tool => {
    const schema = JSON.parse(JSON.stringify(tool.inputSchema || { type: 'object', properties: {} }));
    if (schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key];
        if (prop.type && typeof prop.type === 'string') {
          prop.type = [prop.type, 'null'];
        }
      }
    }
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: schema
      }
    };
  });
}

/**
 * Security lookup: Retrieves tool ONLY if it exists in the central registry.
 * Returns null for any unauthorized tool name.
 */
export function getTool(name) {
  if (!name || typeof name !== 'string') return null;
  return registeredTools.get(name.trim()) || null;
}

/**
 * Validates tool parameters against tool's inputSchema
 */
export function validateToolInputs(tool, params = {}) {
  if (!tool || !tool.inputSchema) return { valid: true };

  const properties = tool.inputSchema.properties || {};
  const required = tool.inputSchema.required || [];

  // Check required parameters
  for (const reqParam of required) {
    if (params[reqParam] === undefined || params[reqParam] === null) {
      return {
        valid: false,
        error: `Missing required parameter "${reqParam}" for tool "${tool.name}".`
      };
    }
  }

  // Check numeric parameter range bounds
  if (typeof params.latitude === 'number' && (params.latitude < -90 || params.latitude > 90)) {
    return { valid: false, error: 'Latitude must be between -90 and 90.' };
  }
  if (typeof params.longitude === 'number' && (params.longitude < -180 || params.longitude > 180)) {
    return { valid: false, error: 'Longitude must be between -180 and 180.' };
  }

  return { valid: true };
}

/**
 * Safe Tool Execution Engine
 * - Enforces Security (only registered tools allowed)
 * - Performs Input Validation
 * - Logs progress in dev mode without exposing API keys, base64 images, or PII
 * - Catches runtime exceptions and returns structured output
 */
export async function executeTool(name, params = {}, options = {}) {
  console.log(`[AI] Tool requested: ${name}`);

  // 1. SECURITY CHECK — Registered tool authorization
  const tool = getTool(name);
  if (!tool) {
    console.warn(`[Security] Rejected unauthorized tool request: "${name}"`);
    return {
      success: false,
      errorType: 'UNAUTHORIZED_TOOL',
      error: `Tool "${name}" is not registered in KisanGuard Tool Registry.`
    };
  }

  // 2. INPUT VALIDATION
  const valResult = validateToolInputs(tool, params);
  if (!valResult.valid) {
    console.warn(`[Tool] Input validation failed for ${name}: ${valResult.error}`);
    return {
      success: false,
      errorType: 'INVALID_TOOL_INPUT',
      error: valResult.error
    };
  }

  // 3. LOGGING (SAFE DEVELOPMENT LOGGING)
  console.log(`[Tool] Executing ${tool.name}...`);

  // 4. EXECUTION
  try {
    const fullParams = { ...params, ...options };
    const result = await tool.execute(fullParams);

    if (result && result.success) {
      console.log(`[Tool] ${tool.name} executed successfully.`);
      return result;
    } else {
      console.warn(`[Tool] ${tool.name} returned error status: ${result?.errorType || 'UNKNOWN_ERROR'}`);
      return result || {
        success: false,
        errorType: 'TOOL_EXECUTION_FAILED',
        error: `Tool ${tool.name} failed during execution.`
      };
    }
  } catch (err) {
    console.error(`[Tool] Exception executing ${tool.name}:`, err.message);
    return {
      success: false,
      errorType: 'TOOL_EXCEPTION',
      error: `Internal error in tool ${tool.name}: ${err.message}`
    };
  }
}

/**
 * Helper to register a new tool (for future extensibility like marketTool, schemeTool, etc.)
 */
export function registerTool(tool) {
  if (!tool || !tool.name || typeof tool.execute !== 'function') {
    throw new Error('Invalid tool interface. Tool must have a name, description, inputSchema, and execute() function.');
  }
  registeredTools.set(tool.name, tool);
  console.log(`[ToolRegistry] Successfully registered new tool: ${tool.name}`);
}

export const toolRegistry = {
  getRegisteredTools,
  getToolDeclarations,
  getTool,
  validateToolInputs,
  executeTool,
  registerTool
};

export default toolRegistry;

