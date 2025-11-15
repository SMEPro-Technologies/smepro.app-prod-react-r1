import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, SmeConfig, VaultItem, SubscriptionPlan, SuggestedSme, WorkshopData, AiPlatform, FunctionName, ChatSession, functionNames, SmeHelperContext, FocusType, DynamicCapability, WorkbenchAsset, AspectRatio } from '../types';
import { configService } from './configService';
import { generateId } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. AI features will be mocked.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || 'placeholder' });

const functionDescriptions: Record<FunctionName, string> = {
    generateCode: 'You can generate code snippets from natural language descriptions.',
    selfCheck: 'You must review your own responses for accuracy and clarity before finalizing them.',
    runTerminal: 'You can simulate running terminal commands and provide the expected output in a markdown block.',
    automateBrowser: 'You can describe the steps to automate browser actions using a framework like Puppeteer or Selenium.',
    latestModels: 'You are powered by the latest and most capable AI models.',
    apiKeyOptional: 'The user does not need to provide their own API keys to use your capabilities.',
    aiImaging: 'You can process image-related requests. This includes creating new images from text descriptions, or enhancing existing images for specific social media platforms (e.g., "make this a TikTok profile pic"). When a platform is mentioned, you should use your knowledge of optimal image dimensions and styles for that platform. If the user asks you to perform an action for a platform and you have not been told they are authenticated, you MUST ask them to authenticate first before proceeding. For example: "To prepare this image for Instagram, I need to connect to your account. Please [Authenticate with Instagram] to continue."'
};

const buildSystemPrompt = (smeConfigs: SmeConfig[], accountType: SubscriptionPlan, session: ChatSession, isWorkshop: boolean = false, isBuilder: boolean = false): string => {
    const { enabledFunctions, dynamicCapabilities, focus } = session;
    const isSolo = accountType.startsWith('solo');
    const segmentTerm = isSolo ? 'objective' : 'operating segment';

    const getSmeDescription = (smeConfig: SmeConfig, isSoloPlan: boolean) => {
        if (isSoloPlan) {
            return `- Field: **${smeConfig.industry}**, Discipline: **${smeConfig.subType}**, Objective: **${smeConfig.segment}**`;
        }
        return `- Industry Focus: **${smeConfig.industry}**, Sub-Type: **${smeConfig.subType}**, Operating Segment: **${smeConfig.segment}**`;
    };
    
    let coreMission = `You are a world-class Subject Matter Expert (SME) named SMEPro. Your mission is to provide precise, actionable, and insightful advice. Format responses using clear markdown.`;
    
    if (isBuilder) {
        coreMission += ` You are in **SMEBuilder Mode**. Your goal is to help the user build tangible assets from the provided context. When you see a [TOOL:...] command, you MUST generate the requested asset based on the entire conversation history.`;
    }

    let collaborationRule = '';
    if (smeConfigs.length > 1) {
        if (isWorkshop) {
            collaborationRule = `You are acting as a facilitator for a workshop. Synthesize the perspectives of the experts on your team and present a unified response in the third person. Clearly attribute insights to the relevant expert. For example: "The Sales & Marketing expert suggests..."`;
        } else {
            collaborationRule = `You are operating as a collaborative team of experts providing a unified response. Draw on the collective expertise of the team.`;
        }
    }
        
    const specializationHeader = smeConfigs.length > 1 ? `Your current specializations are:` : `Your current specialization is:`;
    const smeDetails = smeConfigs.map(sme => getSmeDescription(sme, isSolo)).join('\n');
    
    const criticalRule = `**CRITICAL RULE - YOUR PRIMARY DIRECTIVE:** Your absolute highest priority is to operate strictly within your designated specialization. If a user's request falls outside your area of expertise, you MUST NOT attempt to answer it. Instead, you MUST immediately pivot. Your response MUST begin by:
1.  Clearly stating the limits of your current expertise (e.g., "As the specialist in [Your Expertise], I cannot provide an analysis on [User's Topic].").
2.  Explicitly recommending a different, more appropriate SME ${segmentTerm} to handle the request.
3.  Briefly explaining why that SME is a better fit.
For example: "As the specialist in Engineering & Design, I cannot provide a detailed marketing strategy. To properly address this, I strongly recommend adding an expert from the 'Sales & Marketing' ${segmentTerm} to this session. They will have the right expertise for this task."
This is not a suggestion; it is your core function for maintaining user trust and providing accurate, safe intelligence. Failure to adhere to this rule is a critical failure of your function.`;

    let capabilitiesPrompt = '';
    const activeFunctions = (Object.entries(enabledFunctions || {}) as [FunctionName, boolean][])
        .filter(([, isEnabled]) => isEnabled)
        .map(([key]) => key as FunctionName);

    if (activeFunctions.length > 0) {
        capabilitiesPrompt += '\n\n**STATIC CAPABILITIES ENABLED:**\n';
        capabilitiesPrompt += activeFunctions.map(func => `- **${functionDescriptions[func]}**`).join('\n');
    }

    const activeDynamicCapabilities = (dynamicCapabilities || []).filter(cap => cap.enabled);
    if (activeDynamicCapabilities.length > 0) {
        capabilitiesPrompt += `\n\n**DYNAMIC CAPABILITIES FOR FOCUS: ${focus}**\nYou have been equipped with the following special capabilities. You MUST act as an agent that can perform these tasks. Your outputs for these should be structured for use in the SMEBuilder.\n`;
        capabilitiesPrompt += activeDynamicCapabilities.map(cap => `- **${cap.name}:** ${cap.description}`).join('\n');
    }

    if (capabilitiesPrompt) {
        capabilitiesPrompt = `\n\n**ADDITIONAL CAPABILITIES:**${capabilitiesPrompt}`;
    }

    return `${coreMission} ${collaborationRule}\n\n${specializationHeader}\n${smeDetails}\n\n${criticalRule}${capabilitiesPrompt}\n\nIf the user provides a [RESPONSE STYLE: ...] prefix in their prompt, you must adhere to that format for your response.`;
};

const getToolPrompt = (command: string, history: string, smeConfigs: SmeConfig[]): string => {
    const primarySme = smeConfigs[0];
    const persona = `As an expert in **${primarySme.segment}** for the **${primarySme.industry}** industry, with a focus on **${primarySme.subType}**, your task is to generate a professional, structured asset based on the entire conversation context provided below.`;
    
    const base = `${persona}\n\nCONVERSATION HISTORY:\n---\n${history}\n---\n\n`;

    switch (command) {
        case '[TOOL:GENERATE_README]':
            return base + "TASK: Generate a comprehensive README.md file for a new project based on this discussion. Include sections for Project Title, Description, Features, Tech Stack, and Getting Started.";
        case '[TOOL:DRAFT_TECH_REQS]':
            return base + "TASK: Draft a technical requirements document. Include sections for User Stories, Data Models, and recommended Technology Stack, tailored to the project's context.";
        case '[TOOL:CREATE_SOCIAL_POST]':
            return base + "TASK: Create a promotional social media post (suitable for LinkedIn or X) to announce this project or concept. Include relevant hashtags and a call-to-action.";
        case '[TOOL:OUTLINE_PROJECT_PLAN]':
            return base + "TASK: Outline a high-level project plan. Include key phases (e.g., Discovery, Design, Development, Deployment), major milestones for each phase, and estimated timelines.";
        case '[TOOL:DRAFT_EMAIL]':
            return base + "TASK: Draft a professional marketing email based on the conversation. The email should have a clear subject line, a compelling body, and a call-to-action.";
        case '[TOOL:GENERATE_USER_STORIES]':
            return base + "TASK: Generate a set of Agile user stories based on the features discussed. Each story should follow the format: 'As a [user type], I want [an action] so that [a benefit]' and include acceptance criteria.";
        case '[TOOL:OUTLINE_BLOG_POST]':
            return base + "TASK: Outline a blog post based on the conversation. Include a catchy title, an introduction, several main section headings with bullet points, and a conclusion.";
        case '[TOOL:CREATE_SWOT]':
            return base + "TASK: Create a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on the project or concept discussed. Present it in a clear, structured format.";
        case '[TOOL:DRAFT_PITCH_DECK]':
            return base + "TASK: Generate a 10-slide pitch deck outline based on the conversation. Include slides for Problem, Solution, Market Size, Product, Business Model, Go-to-Market Strategy, Team, Competition, Financial Projections, and The Ask.";
        case '[TOOL:CREATE_API_DOCS]':
            return base + "TASK: Generate a draft for API documentation in Markdown format based on the technical discussion. Include sections for Authentication, Endpoints, Request/Response examples, and Error Codes.";
        case '[TOOL:GENERATE_TEST_CASES]':
            return base + "TASK: Generate a set of test cases for the features discussed. Format them in a table with columns for Test Case ID, Description, Steps to Reproduce, Expected Result, and Actual Result.";
        case '[TOOL:WRITE_PRESS_RELEASE]':
            return base + "TASK: Write a professional press release announcing the project or a key milestone from the conversation. Include a headline, dateline, introduction, body paragraphs with quotes, and boilerplate company info.";
        default:
            return history; // Fallback to just the history if the tool is unknown
    }
}

const smeHelperContextPrompts: Record<SmeHelperContext, string> = {
    APP_HOME: "The user is on the main landing page. Briefly explain the purpose of SMEPro as a collaborative AI workspace and guide them to the 'Get Started' button.",
    APP_FEATURES: "The user is viewing the Features page. Briefly explain the core tool suite (Vault, Analyzer, Builder, Workbench) and how they work together to turn ideas into outcomes.",
    APP_HOW_IT_WORKS: "The user is on the 'How It Works' page. Summarize the 4 main steps: Select, Converse, Save, and Analyze.",
    APP_PLANS: "The user is looking at the subscription plans. Explain the difference between Base Plans (Solo/Business) and Level Up Packages, highlighting that Level Ups add collaborative features like Workshop Mode.",
    APP_SAFE_AI: "The user is on the SAFE AI page. Explain that this page demonstrates how SMEPro prevents harmful content and protects data, and encourage them to try the interactive simulator.",
    SME_SELECTOR: "The user is on the SME configuration screen. Explain the importance of selecting a narrow specialization and how the three dropdowns work together to create a focused AI expert.",
    CHAT_WINDOW: "The user is in a chat session. Briefly explain the main components: the chat history in the center, the input box at the bottom, the SME panel on the right, and the header controls like Vault and Workshop mode.",
    CHAT_INPUT: "The user is about to type in the chat box. Explain how to ask effective questions, use the Response Style selector (wand icon) to change the AI's tone, and mention that the AI might suggest new SMEs in the right panel based on the conversation.",
    CHAT_HEADER: "The user is interacting with the chat header. Explain that this area shows the active SME(s) and provides quick access to tools like Workshop Mode, Session History, the Vault, and Profile settings.",
    SME_PANEL: "The user is interacting with the right-hand SME Panel. Explain that this panel shows the currently active experts and will dynamically suggest new, relevant experts to add to the conversation as it evolves.",
    VAULT: "The user has the Vault open. Explain that the Vault is for storing key insights from sessions. Describe the two main panes: the item list on the left and the Analysis Workbench on the right.",
    VAULT_ITEMS: "The user is interacting with the item list in the Vault. Explain how to select multiple items to prepare them for analysis in the Workbench on the right.",
    VAULT_ANALYZER: "The user is interacting with the Vault's Analysis Workbench. Explain how to select an analysis mode (like 'Concept Review'), run the analysis to synthesize new ideas, and then use the 'Continue in SMEBuilder' button to turn the analysis into an actionable plan.",
    DASHBOARD: "The user is viewing their Dashboard. Explain that they can toggle between viewing their Usage & Quotas and the AI Safety configuration.",
    DASHBOARD_USAGE: "The user is viewing the Usage & Quotas tab. Explain that this screen shows their current plan and how much of their monthly allowance for storage and AI actions they have used.",
    DASHBOARD_SAFETY: "The user is viewing the AI Safety tab. Explain that this is where they can configure keyword monitoring and see a log of any flagged prompts (a feature for advanced plans).",
    SME_WORKBENCH: "The user is in the SME Workbench. Explain that this is a specialized environment for building tangible assets using advanced AI tools. Guide them to select a tool from the left panel, provide the necessary inputs (like prompts or images), and then use the 'Generate' button to create an asset. Mention that they can also chat with the Workbench Assistant for guidance.",
    // FIX: Added missing SmeHelperContext prompts to satisfy the type definition.
    APP_CONTACT: "The user is on the contact page. Explain the different ways to get in touch for support, sales, or general feedback, and highlight the 'Share Your App Idea' feature.",
    APP_PRIVACY: "The user is viewing the Privacy Policy. Briefly summarize SMEPro's commitment to data privacy, especially that user data is not used for model training.",
    APP_TERMS: "The user is viewing the Terms of Service. Briefly explain that this document governs their use of the application and outlines their rights and responsibilities.",
    APP_ACCEPTABLE_USE: "The user is on the Acceptable Use & SAFE AI page. Explain that this policy details prohibited activities and how the SAFE AI system works to maintain a secure environment."
};


export const geminiService = {
  generateChatResponse: async (session: ChatSession): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        console.warn("Using placeholder API key. AI response is mocked.");
        const primarySme = session.smeConfigs[0];
        return new Promise(resolve => setTimeout(() => resolve(`This is a mock response because no API key is set. As an expert in **${primarySme.segment}**, I would normally provide a detailed answer here about: *${session.messages[session.messages.length - 1].content}*`), 1000));
    }

    try {
        const isWorkshopMode = session.messages.some(m => m.role === 'system' && m.content.includes('WORKSHOP MODE ACTIVATED'));
        const isBuilderSession = session.messages.some(m => m.role === 'system' && m.content.includes('SMEBuilder Session Initiated'));
        
        const lastUserMessage = session.messages[session.messages.length - 1];
        const isToolCommand = lastUserMessage.role === 'user' && lastUserMessage.content.startsWith('[TOOL:');
        
        let contents;
        if (isToolCommand) {
             const command = lastUserMessage.content.match(/\[TOOL:\w+\]/)?.[0] || '';
             const conversationHistory = session.messages.map(m => `${m.senderName || m.role}: ${m.content}`).join('\n');
             contents = getToolPrompt(command, conversationHistory, session.smeConfigs);
        } else {
            contents = session.messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role as 'user' | 'model',
                    parts: m.parts || [{ text: m.content }]
                }));
        }


        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: contents,
            config: {
                systemInstruction: buildSystemPrompt(session.smeConfigs, session.accountType, session, isWorkshopMode, isBuilderSession),
            }
        });
        
        const responseText = response.text;
        
        if (isToolCommand) {
            return `<!-- BUILDER_OUTPUT -->\n\n${responseText}`;
        }

        return responseText;
    } catch (error) {
      console.error("Error generating response from Gemini API:", error);
      return "I'm sorry, but I encountered an error while processing your request. Please check the console for details and ensure your API key is configured correctly.";
    }
  },

  executeStepAction: async (action: string, context: string, smeConfig: SmeConfig, history: ChatMessage[], options?: any): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`This is a mock response for the action: **${action}**.`);
    }

    const conversationContext = history.slice(-6).map(m => `${m.senderName || m.role}: ${m.content}`).join('\n\n');

    let prompt = `As a world-class expert in **${smeConfig.segment} (${smeConfig.subType})**, perform the following task based on the provided context.

**Task:** ${action}

**Context from the current step/prompt:**
---
${context}
---

**Recent Conversation History for additional context:**
---
${conversationContext}
---

Provide a concise, professional, and actionable response. Format using markdown.`;

    if (action.toLowerCase().includes('code') && options) {
        prompt = `As a senior software architect specializing in **${smeConfig.segment} (${smeConfig.subType})**, generate a production-ready code snippet for the following task.

**Task:** ${action}
**Language:** ${options.lang}
**Cloud Platform/Framework:** ${options.platform}

**Context from the current step/prompt:**
---
${context}
---

**Recent Conversation History for additional context:**
---
${conversationContext}
---

**CRITICAL INSTRUCTIONS:**
1.  Generate high-quality, near production-ready code.
2.  Where user-specific values are required (like project IDs, API keys, service account names, database connection strings, etc.), you MUST use double curly brace placeholders with descriptive names. For example: \`'{{GCP_PROJECT_ID}}'\` or \`'{{DATABASE_CONNECTION_URL}}'\`.
3.  Add concise comments explaining each major part of the code logic.
4.  Wrap the entire code block in a single markdown code fence.
`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error executing step action with Gemini API:", error);
        return `I'm sorry, but I encountered an error while trying to perform the action: "${action}". Please try again.`;
    }
  },

  getDynamicStepActions: async (smeConfig: SmeConfig, stepContent: string, history: ChatMessage[]): Promise<string[]> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        // Return a static list for mock environment
        return ['Create Technical Requirements', 'Generate Code', 'Estimate Costs'];
    }

    try {
        const conversationContext = history.slice(-6).map(m => `${m.senderName || m.role}: ${m.content}`).join('\n');
        
        const prompt = `You are an expert assistant that suggests contextual tools.
Based on the user's role, the current task, and the conversation history, suggest 2-4 short, actionable tool names.

**User's Role:** ${smeConfig.segment} in ${smeConfig.industry} (${smeConfig.subType})
**Current Task/Step:** "${stepContent}"
**Conversation Context:**
---
${conversationContext}
---

**Instructions:**
- The tool names should be concise command-like phrases (e.g., "Generate Code Snippet", "Draft Marketing Email", "Outline Project Plan").
- Do NOT suggest more than 4 tools.
- ONLY respond with a JSON object that matches the specified schema.

Analyze the context and provide the most relevant actions now.`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        actions: {
                            type: Type.ARRAY,
                            description: "A list of 2-4 recommended action strings.",
                            items: {
                                type: Type.STRING,
                                description: "A concise action name."
                            }
                        }
                    },
                    required: ['actions']
                }
            }
        });

        const parsedJson = JSON.parse(response.text);
        if (parsedJson.actions && Array.isArray(parsedJson.actions)) {
            return parsedJson.actions.slice(0, 4); // Ensure max 4 actions
        }
        return [];

    } catch (error) {
        console.error("Error getting dynamic step actions:", error);
        return []; // Return empty on error
    }
  },
  
  analyzeVaultItems: async (items: VaultItem[], promptTemplate: string, responseFormat: string): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        console.warn("Using placeholder API key. Analysis response is mocked.");
        return new Promise(resolve => setTimeout(() => resolve(`This is a mock analysis. I would normally synthesize these items into a cohesive **${responseFormat}** based on your request to **${promptTemplate}**`), 1000));
    }
    try {
      let finalPrompt = `As a strategic analyst, your task is to analyze the following knowledge items from a user's vault.
Objective: ${promptTemplate}.
Required Output Format: You must structure your response as a "${responseFormat}".`;

      if (promptTemplate.startsWith("Concept Review:")) {
          finalPrompt = `As a master strategist, conduct a "Concept Review" of the following knowledge items. Your goal is to synthesize disparate ideas into a cohesive, actionable concept. Identify core themes, map relationships between items, and formulate a high-level strategic direction. The output should be structured as a "Project Brief" to serve as a foundational document for a new initiative.`
      }

      const prompt = `${finalPrompt}

Here are the vault items:
${items.map(item => `---
### ${item.title} (Category: ${item.category})
${item.content}
---`).join('\n\n')}

Analyze this information now, adhering strictly to the objective and output format.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error("Error analyzing vault items with Gemini API:", error);
      return "I'm sorry, but I encountered an error during the analysis. Please try again later.";
    }
  },

  suggestRelatedSmes: async (currentConfigs: SmeConfig[], history: ChatMessage[], accountType: SubscriptionPlan): Promise<SuggestedSme[]> => {
    if (currentConfigs.length === 0 || history.length < 2) {
        return [];
    }
    if (!API_KEY || API_KEY === 'placeholder') {
        return []; 
    }
    
    try {
        const schema = await configService.fetchSmeConfigSchema(accountType);
        const isSolo = accountType.startsWith('solo');
        const segmentKey = isSolo ? 'objective' : 'operatingSegment';
        const segmentType = isSolo ? 'objectives' : 'operating segments';

        // FIX: Dynamically extract all possible values for the segment/objective from the schema's 'allOf' rules.
        let allSegments: string[] = [];
        if (schema?.allOf) {
            for (const rule of schema.allOf) {
                if (rule.then?.properties?.[segmentKey]?.enum) {
                    allSegments.push(...rule.then.properties[segmentKey].enum);
                }
            }
            allSegments = [...new Set(allSegments)]; // Make unique
        }
        
        if (allSegments.length === 0) {
            console.error(`Could not extract any ${segmentType} from schema for key "${segmentKey}". The SME suggestion feature will be disabled for this session.`);
            return [];
        }

        const activeSegments = currentConfigs.map(c => c.segment);
        const availableSegments = allSegments.filter(s => !activeSegments.includes(s));
        
        if (availableSegments.length === 0) return [];

        const conversationContext = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');

        const prompt = `You are an expert strategist analyzing a conversation to recommend new team members.

**Current Team of Experts:**
- ${activeSegments.join('\n- ')}

**Recent Conversation Context:**
---
${conversationContext}
---

**Your Task:**
Based on the conversation, the user's needs seem to be evolving. Identify up to 3 '${segmentType}' from the provided list that are **NOT** on the current team but would add the most value right now. For each suggestion, you MUST provide a concise but clear justification explaining *why* their expertise is suddenly relevant based on the conversation. Your analysis is critical.

Respond ONLY with a JSON object that matches the specified schema. Do not fail to provide suggestions if the context hints at a need for new expertise.`;


        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: `A list of 2-3 recommended SME ${segmentType}.`,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    segment: {
                                        type: Type.STRING,
                                        enum: availableSegments,
                                        description: `The recommended SME ${segmentType}.`
                                    },
                                    reason: {
                                        type: Type.STRING,
                                        description: "A brief justification for why this SME is recommended based on the conversation."
                                    }
                                },
                                required: ['segment', 'reason']
                            }
                        }
                    },
                    required: ['suggestions']
                }
            }
        });

        const parsedJson = JSON.parse(response.text);
        
        if (!parsedJson.suggestions) return [];

        const suggestedSmes: SuggestedSme[] = parsedJson.suggestions.map((s: any) => ({
            config: {
                industry: currentConfigs[0].industry,
                subType: currentConfigs[0].subType,
                segment: s.segment,
            },
            reason: s.reason,
        }));
        
        return suggestedSmes;

    } catch (error) {
        console.error("Error getting dynamic SME suggestions:", error);
        return [];
    }
  },

  generateSmeIntroduction: async (newSme: SmeConfig, history: ChatMessage[]): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`Hello, I am the new SME specializing in **${newSme.segment}**. I have reviewed the conversation and am ready to assist.`);
    }

    try {
        const prompt = `You are a new Subject Matter Expert joining an ongoing conversation. Your specialization is: Industry: ${newSme.industry}, Sub-Type: ${newSme.subType}, Segment: ${newSme.segment}.
Based on the last few messages of the conversation provided below, generate a brief, professional, and context-aware introductory message (2-3 sentences).
Your introduction should acknowledge the current topic and state how you can contribute. Start with "Hello, I've joined the session."

CONVERSATION HISTORY:
${history.slice(-4).map(m => `${m.senderName || m.role}: ${m.content}`).join('\n')}

Generate the introductory message now:`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating SME introduction:", error);
        return `Hello, I've joined the session as an expert in ${newSme.segment}. I'm ready to contribute.`;
    }
  },

  getDeeperInsight: async (selectedText: string, fullContext: string): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`This is a mock insight. I would normally elaborate on **${selectedText}** based on the provided context.`);
    }

    try {
        const prompt = `A user has requested a deeper insight on the term "${selectedText}".
Based on the full context of the message below, please provide a concise and clear elaboration on this specific term.
Explain what it is, why it's relevant to the conversation, and any important nuances.

FULL MESSAGE CONTEXT:
---
${fullContext}
---

Provide the deeper insight on "${selectedText}" now:`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating deeper insight:", error);
        return `I am unable to provide further insight on "${selectedText}" at this moment.`;
    }
  },

  getWorkshopGuidanceAndSmes: async (workshopData: Pick<WorkshopData, 'objective' | 'backstory'>, primarySmeConfig: SmeConfig): Promise<{ guidance: string; smes: SuggestedSme[] }> => {
    if (!API_KEY || API_KEY === 'placeholder' || (!workshopData.objective && !workshopData.backstory)) {
        return { guidance: "Start typing your objective or backstory to get AI-powered suggestions.", smes: [] };
    }
    
    try {
        const schema = await configService.fetchSmeConfigSchema('business');
        const allSegments = schema.properties.operatingSegment.enum as string[];

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: `As an expert facilitator, analyze the following workshop plan. Provide (1) concise, actionable guidance to improve its focus and clarity, and (2) recommend 2-3 additional SME 'operating segments' that would be valuable participants.
            
Workshop Objective: "${workshopData.objective}"
Workshop Backstory: "${workshopData.backstory}"

Respond ONLY with a JSON object that matches the specified schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        guidance: {
                            type: Type.STRING,
                            description: "Actionable, constructive feedback on how to improve the workshop objective and backstory."
                        },
                        smes: {
                            type: Type.ARRAY,
                            description: "A list of 2-3 recommended SME segments based on the workshop context.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    segment: {
                                        type: Type.STRING,
                                        enum: allSegments,
                                        description: "The recommended SME operating segment."
                                    },
                                    reason: {
                                        type: Type.STRING,
                                        description: "A brief justification for why this SME is recommended."
                                    }
                                },
                                required: ['segment', 'reason']
                            }
                        }
                    },
                    required: ['guidance', 'smes']
                }
            }
        });

        const parsedJson = JSON.parse(response.text);

        const suggestedSmes: SuggestedSme[] = parsedJson.smes.map((sme: any) => ({
            config: {
                industry: primarySmeConfig.industry,
                subType: primarySmeConfig.subType,
                segment: sme.segment,
            },
            reason: sme.reason,
        }));
        
        return {
            guidance: parsedJson.guidance,
            smes: suggestedSmes,
        };

    } catch (error) {
        console.error("Error getting workshop guidance:", error);
        return { guidance: "An error occurred while getting AI suggestions. Please try again.", smes: [] };
    }
  },

  generateCompetitiveAnalysis: async (competitors: AiPlatform[]): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
      return Promise.resolve("This is a mock competitive analysis. In a real scenario, I would compare SMEPro against the selected platforms.");
    }
    try {
      const prompt = `
        As an unbiased AI market analyst, create a detailed competitive analysis.
        Compare the following AI platforms against SMEPro.

        **SMEPro's Core Value Proposition:**
        SMEPro is not just a single AI, but a "Collaborative AI Operating System." Its strength lies in its "Yellow Brick Road" logic, which means it provides a structured, multi-expert (SME) workflow. Users select specialized AIs, collaborate with them in focused "Workshop" sessions, and use an integrated suite of tools (Vault, Analyzer, Builder, Workbench) to turn conversations into tangible, actionable outcomes. Its key differentiator is moving beyond simple Q&A to a goal-oriented, collaborative creation process.

        **Competitors to Analyze:**
        ${competitors.map(c => `- **${c.name}:** Their claim to fame is "${c.claimToFame}".`).join('\n')}

        **Your Task:**
        Provide a side-by-side comparison in a markdown table. Columns should be: "Platform", "Primary Use Case", "Key Strength", and "How SMEPro Differs".
        After the table, write a "Key Takeaways" summary. This summary should highlight where each platform excels and for which type of user or task SMEPro would be the superior choice, emphasizing its unique collaborative and workflow-oriented approach. Maintain an unbiased, professional tone.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error generating competitive analysis:", error);
      return "I'm sorry, but I encountered an error while generating the analysis. Please try again.";
    }
  },
  
  suggestCapabilities: async (messages: ChatMessage[]): Promise<FunctionName[]> => {
    if (!API_KEY || API_KEY === 'placeholder' || messages.length < 2) {
      return [];
    }

    try {
        const conversationContext = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
        const capabilitiesList = Object.entries(functionDescriptions).map(([key, desc]) => `- ${key}: ${desc}`).join('\n');

        const prompt = `You are an intelligent assistant that helps configure an AI agent.
Based on the recent conversation, which of the following capabilities would be most useful to enable?

Available Capabilities:
${capabilitiesList}

Recent Conversation:
---
${conversationContext}
---

Your Task:
Analyze the conversation and identify 1-2 capabilities that are most relevant to the user's current task.

Respond ONLY with a JSON object containing a single key "suggestions" which is an array of strings. The strings must be one of the available capability names.
Example: { "suggestions": ["generateCode", "runTerminal"] }`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                description: 'A list of 1-2 recommended capability names.',
                items: {
                  type: Type.STRING,
                  enum: functionNames as unknown as string[],
                },
              },
            },
            required: ['suggestions'],
          },
        },
      });

      const parsedJson = JSON.parse(response.text);
      if (parsedJson.suggestions && Array.isArray(parsedJson.suggestions)) {
        return parsedJson.suggestions;
      }
      return [];
    } catch (error) {
      console.error('Error suggesting capabilities:', error);
      return [];
    }
  },

  getSmeHelperGuidance: async (context: SmeHelperContext | null): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`This is a mock response for the context: **${context}**. In-app help would appear here.`);
    }
    if (!context) {
        return Promise.resolve("Welcome to the SMEPro Helper! As you navigate the app, I can provide contextual guidance. Just click the help button whenever you see it.");
    }

    try {
        const systemInstruction = "You are SMEHelper, an intelligent assistant embedded within the SMEPro application. Your sole purpose is to provide helpful, concise guidance on how to use the features of SMEPro. Your answers must be directly related to the user's current context within the app. Do not provide information outside of SMEPro's functionality. Use clear markdown for formatting, including lists and bold text to highlight key actions.";
        
        const userPrompt = smeHelperContextPrompts[context] || "Please provide a general overview of the SMEPro application.";

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: userPrompt,
            config: { systemInstruction },
        });

        return response.text;
    } catch (error) {
        console.error("Error getting SME Helper guidance:", error);
        return "I'm sorry, but I was unable to get help information for this topic. Please try again.";
    }
  },

  generateFocusCapabilities: async (focus: FocusType, history: ChatMessage[]): Promise<Omit<DynamicCapability, 'enabled'>[]> => {
    if (!API_KEY || API_KEY === 'placeholder') {
      return Promise.resolve([
        { id: generateId(), name: `Mock Capability for ${focus} 1`, description: `This is a mock description.` },
        { id: generateId(), name: `Mock Capability for ${focus} 2`, description: `This is another mock description.` },
      ]);
    }
    try {
      const conversationContext = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `You are a capability designer for an AI agent.
The user has set their session 'Focus' to "${focus}".
Based on this focus and the recent conversation context, generate a list of 3-5 tangible, end-result-oriented capabilities.
These capabilities will be presented to the user to enable. They should be powerful, SME-level skills.

Conversation Context:
---
${conversationContext}
---

Instructions:
- The 'name' should be a concise, action-oriented title (e.g., "Generate Viral Hook Scripts").
- The 'description' should be a one-sentence explanation of what the capability does.
- The output MUST be a JSON object matching the specified schema.

Generate the capabilities now.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              capabilities: {
                type: Type.ARRAY,
                description: 'A list of 3-5 generated capabilities.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'The name of the capability.' },
                    description: { type: Type.STRING, description: 'A brief description of the capability.' },
                  },
                  required: ['name', 'description'],
                },
              },
            },
            required: ['capabilities'],
          },
        },
      });
      const parsed = JSON.parse(response.text);
      return (parsed.capabilities || []).map((c: any) => ({ ...c, id: generateId() }));
    } catch (error) {
      console.error('Error generating focus capabilities:', error);
      return [];
    }
  },

  explainDynamicCapability: async (capability: DynamicCapability, focus: FocusType | undefined, history: ChatMessage[]): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`This is a mock explanation for enabling the capability "${capability.name}". It would normally be contextual to your conversation.`);
    }
    try {
        const conversationContext = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
        const prompt = `You are an AI assistant onboarding a user to a new capability.
The user wants to enable the capability: **"${capability.name}"**.
The user's session focus is: **"${focus}"**.
The recent conversation is:
---
${conversationContext}
---

Your task is to explain what this capability will allow the AI to do *specifically for them, right now*.
- Be specific and outcome-oriented.
- Relate the capability to their conversation and focus.
- Explain that the results will be structured for use in the "SMEBuilder".
- Keep it concise (2-3 sentences).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error explaining dynamic capability:', error);
        return `An error occurred while getting details for "${capability.name}".`;
    }
  },

  analyzeHighlightedText: async (text: string, context: string, analysisType: 'red' | 'blue' | 'green'): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`This is a mock analysis for the color ${analysisType} on the text: "${text}"`);
    }

    const prompts = {
        red: "You are a risk and priority analyst. Your task is to analyze the provided text snippet within its full context. Identify and explain potential concerns, uncertainties, causal factors, and high-priority elements. Focus on what could be a problem or needs immediate attention. Be concise and direct.",
        blue: "You are a data and insights analyst. Your task is to provide a deeper, more analytical insight into the provided text snippet, using the full context. Connect the snippet to broader trends, provide related data points or concepts, and explain its significance in a larger picture. Do not just repeat the information; add value and perspective.",
        green: "You are a growth and monetization strategist. Your task is to analyze the provided text snippet within its full context. Focus exclusively on how this idea or concept can be leveraged for financial gain, learning opportunities, or competitive advantage. Outline actionable steps or potential business models related to the snippet. Be creative and results-oriented."
    };

    const systemInstruction = prompts[analysisType];
    const userPrompt = `CONTEXT:\n---\n${context}\n---\n\nAnalyze the following specific text snippet from the context above:\n\nSNIPPET: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: { systemInstruction },
        });
        return response.text;
    } catch (error) {
        console.error(`Error analyzing highlighted text (${analysisType}):`, error);
        return `An error occurred while performing the ${analysisType} analysis. Please try again.`;
    }
  },
  // FIX: Added missing methods for SME Workbench
  getWorkbenchAssistantResponse: async (context: string, history: ChatMessage[]): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
      return Promise.resolve("This is a mock response from the Workbench Assistant.");
    }
    try {
      const systemInstruction = `You are a helpful assistant in the SME Workbench. The user is working with the following context from their Vault analysis:\n\nCONTEXT:\n---\n${context}\n---\n\nYour role is to help them use the advanced AI tools to build upon this context. Be concise and guide them towards using the tools on the left.`;

      const contents = history
        .map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.content }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: contents,
        config: { systemInstruction },
      });
      return response.text;
    } catch (error) {
      console.error("Error getting workbench assistant response:", error);
      return "I'm sorry, I encountered an error. Please try again.";
    }
  },
  generateComplexText: async (prompt: string): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
      return Promise.resolve(`This is a mock complex text response for: "${prompt}"`);
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 8192 }
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating complex text:", error);
      return "Failed to generate response due to an error.";
    }
  },
  generateTextWithSearch: async (prompt: string): Promise<string> => {
    if (!API_KEY || API_KEY === 'placeholder') {
        return Promise.resolve(`This is a mock search-grounded response for: "${prompt}"`);
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        let resultText = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
            const sources = groundingChunks
                .map((chunk: any) => chunk.web?.uri && `[${chunk.web.title || chunk.web.uri}](${chunk.web.uri})`)
                .filter(Boolean);
            if (sources.length > 0) {
                resultText += `\n\n**Sources:**\n- ${sources.join('\n- ')}`;
            }
        }
        return resultText;
    } catch (error) {
        console.error("Error generating text with search:", error);
        return "Failed to generate search-grounded response.";
    }
  },
  generateImageWithPrompt: async (prompt: string, aspectRatio: AspectRatio): Promise<WorkbenchAsset> => {
      if (!API_KEY || API_KEY === 'placeholder') {
          return Promise.resolve({
              id: generateId(),
              name: `Mock Image: ${prompt.substring(0, 20)}...`,
              type: 'image',
              content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
              createdAt: new Date().toISOString()
          });
      }
      try {
          const response = await ai.models.generateImages({
              model: 'imagen-4.0-generate-001',
              prompt: prompt,
              config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: aspectRatio,
              },
          });
          
          if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image) {
              console.error("Image generation failed or returned an empty response.", response);
              throw new Error("Image generation failed to produce an image.");
          }

          const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
          const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          return {
              id: generateId(),
              name: `Image: ${prompt.substring(0, 30)}...`,
              type: 'image',
              content: imageUrl,
              createdAt: new Date().toISOString()
          };
      } catch (error) {
          console.error("Error generating image:", error);
          throw new Error("Failed to generate image.");
      }
  },
  analyzeUploadedImage: async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
      if (!API_KEY || API_KEY === 'placeholder') {
          return Promise.resolve(`This is a mock analysis of the uploaded image for prompt: "${prompt}"`);
      }
      try {
          const imagePart = {
              inlineData: { mimeType, data: base64Image },
          };
          const textPart = { text: prompt };
          const response = await ai.models.generateContent({
              model: 'gemini-flash-lite-latest',
              contents: { parts: [imagePart, textPart] },
          });
          return response.text;
      } catch (error) {
          console.error("Error analyzing image:", error);
          return "Failed to analyze image due to an error.";
      }
  },
  editUploadedImage: async (prompt: string, base64Image: string, mimeType: string): Promise<WorkbenchAsset> => {
      if (!API_KEY || API_KEY === 'placeholder') {
          return Promise.resolve({
              id: generateId(),
              name: `Mock Edited Image: ${prompt.substring(0, 20)}...`,
              type: 'image',
              content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
              createdAt: new Date().toISOString()
          });
      }
      try {
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [
                      { inlineData: { data: base64Image, mimeType: mimeType } },
                      { text: prompt },
                  ],
              },
              config: {
                  responseModalities: [Modality.IMAGE],
              },
          });
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  const base64ImageBytes: string = part.inlineData.data;
                  const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                   return {
                      id: generateId(),
                      name: `Edited Image: ${prompt.substring(0, 20)}...`,
                      type: 'image',
                      content: imageUrl,
                      createdAt: new Date().toISOString()
                  };
              }
          }
          throw new Error("No image was returned from the edit operation.");
      } catch (error) {
          console.error("Error editing image:", error);
          throw new Error("Failed to edit image.");
      }
  },
  animateUploadedImage: async (prompt: string, base64Image: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<WorkbenchAsset> => {
      if (!API_KEY || API_KEY === 'placeholder') {
          return Promise.resolve({
              id: generateId(), name: `Mock Video: ${prompt.substring(0,20)}...`, type: 'video',
              content: '', // No mock video URL
              createdAt: new Date().toISOString()
          });
      }
      try {
          let operation = await ai.models.generateVideos({
              model: 'veo-3.1-fast-generate-preview',
              prompt: prompt,
              image: { imageBytes: base64Image, mimeType: mimeType },
              config: {
                  numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio,
              }
          });
          while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 10000));
              operation = await ai.operations.getVideosOperation({operation: operation});
          }
          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (!downloadLink) {
              throw new Error("Video generation failed, no download link found.");
          }
          const videoUrlWithKey = `${downloadLink}&key=${API_KEY}`;
          return {
              id: generateId(),
              name: `Video: ${prompt.substring(0, 30)}...`,
              type: 'video',
              content: videoUrlWithKey,
              createdAt: new Date().toISOString()
          };
      } catch (error) {
          console.error("Error animating image:", error);
          throw error;
      }
  },
};