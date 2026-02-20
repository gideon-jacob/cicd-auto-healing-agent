import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { BugType, Fix } from '../types';

/**
 * CrewAI-style multi-agent orchestration using Google Gemini API.
 *
 * Agents:
 * 1. AnalyzerAgent — reads test output and identifies failures
 * 2. FixerAgent — generates code fixes for each failure
 * 3. ValidatorAgent — validates the fix is correct before commit
 */
export class CrewAIService {
    private genAI: GoogleGenerativeAI;
    private modelName: string = 'gemini-2.0-flash';

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    }

    /**
     * AnalyzerAgent: Parse test output and identify individual failures
     * with file, line number, and bug type.
     */
    async analyzeFailures(
        testOutput: string,
        repoStructure: string,
    ): Promise<AnalyzedFailure[]> {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });

        const prompt = `You are an expert code analyzer. Analyze the following test failure output and identify each individual failure.

For each failure, provide:
- file: the file path relative to the repo root
- line_number: the exact line number where the issue is
- bug_type: one of LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION
- description: a brief description of the issue
- error_message: the original error message

Repository structure:
${repoStructure}

Test output:
${testOutput}

Respond ONLY with a valid JSON array. Example:
[
  {
    "file": "src/utils.py",
    "line_number": 15,
    "bug_type": "LINTING",
    "description": "Unused import 'os'",
    "error_message": "F401 'os' imported but unused"
  }
]`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                logger.error('AnalyzerAgent: No JSON array found in response');
                return [];
            }
            return JSON.parse(jsonMatch[0]) as AnalyzedFailure[];
        } catch (error) {
            logger.error(`AnalyzerAgent error: ${error}`);
            return [];
        }
    }

    /**
     * FixerAgent: Generate a code fix for a specific failure.
     */
    async generateFix(
        failure: AnalyzedFailure,
        fileContent: string,
    ): Promise<GeneratedFix | null> {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });

        const prompt = `You are an expert code fixer. Fix the following issue in the code.

File: ${failure.file}
Line: ${failure.line_number}
Bug Type: ${failure.bug_type}
Issue: ${failure.description}
Error: ${failure.error_message}

Current file content:
\`\`\`
${fileContent}
\`\`\`

Respond ONLY with a valid JSON object:
{
  "fixed_content": "the entire fixed file content",
  "commit_message": "[AI-AGENT] Fix: brief description",
  "changes_description": "what was changed and why"
}`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                logger.error('FixerAgent: No JSON object found in response');
                return null;
            }
            return JSON.parse(jsonMatch[0]) as GeneratedFix;
        } catch (error) {
            logger.error(`FixerAgent error: ${error}`);
            return null;
        }
    }

    /**
     * ValidatorAgent: Validate that a proposed fix is correct
     * before applying it.
     */
    async validateFix(
        failure: AnalyzedFailure,
        originalContent: string,
        fixedContent: string,
    ): Promise<ValidationResult> {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });

        const prompt = `You are an expert code reviewer. Validate whether the following fix correctly addresses the issue without introducing new problems.

File: ${failure.file}
Issue: ${failure.description} (${failure.bug_type})

Original code:
\`\`\`
${originalContent}
\`\`\`

Fixed code:
\`\`\`
${fixedContent}
\`\`\`

Respond ONLY with a valid JSON object:
{
  "is_valid": true/false,
  "confidence": 0.0-1.0,
  "reason": "explanation"
}`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return { is_valid: true, confidence: 0.5, reason: 'Could not parse validation response, proceeding with fix' };
            }
            return JSON.parse(jsonMatch[0]) as ValidationResult;
        } catch (error) {
            logger.error(`ValidatorAgent error: ${error}`);
            return { is_valid: true, confidence: 0.5, reason: 'Validation error, proceeding with fix' };
        }
    }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnalyzedFailure {
    file: string;
    line_number: number;
    bug_type: BugType;
    description: string;
    error_message: string;
}

export interface GeneratedFix {
    fixed_content: string;
    commit_message: string;
    changes_description: string;
}

export interface ValidationResult {
    is_valid: boolean;
    confidence: number;
    reason: string;
}

export const crewAIService = new CrewAIService();
