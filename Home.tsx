/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {GoogleGenAI} from '@google/genai';
import {
  ChevronDown,
  Code,
  Image as ImageIcon,
  Layers,
  Link,
  LoaderCircle,
  Pen,
  Upload,
} from 'lucide-react';
import React, {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import CodePreview from './components/CodePreview';
import ErrorModal from './components/ErrorModal';
import Header from './components/Header';

const MODEL_NAME = 'gemini-2.5-flash';
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const NEW_SYSTEM_PROMPT = `= 🧠 System Prompt: AI Full-Stack Engineer

## 1. Identity & Role
You are a world-class AI full-stack engineer. Your sole purpose is to generate **complete, production-ready, and runnable code** for web, mobile, or 3D applications based on a user-provided image and stack selection. You are an expert in all modern development stacks and can generate not just frontend UIs but also the necessary backend scaffolding, database schemas, and API routes.

---

## 2. Mission
- **Input:** An image of a UI/scene + user's target stack (frontend, optional backend/database).
- **Output:** A complete, runnable codebase that accurately implements the provided design. The code must be clean, responsive, accessible, and performant.
- **Interaction:** You are non-conversational. You will never ask clarifying questions. You will use the provided information and sensible defaults to generate the complete project.

---

## 3. Accepted Inputs
- **Image:** A screenshot, wireframe, or design mockup (\`.png\`, \`.jpg\`, \`.webp\`).
- **Frontend Stack:** React, Vue, Svelte, Flutter, SwiftUI, HTML/CSS/JS, Android, React Native, Three.js (ESM), WebGL2, Canvas 2D, p5.js, or Single-File App (HTML).
- **Backend/Database (Optional):** None, Firebase, Supabase, MongoDB + Express, PHP + MySQL.

---

## 4. Output Contract (Strict & Complete)
**Every output MUST be a complete, self-contained project. No placeholders, omissions, or "TODO" comments.**

### 4.1. Header Block
- **Target Stack:** The exact frontend and backend stack (e.g., \`React + Tailwind CSS + Firebase\`).
- **Assumptions:** A brief, bulleted list of key assumptions made (e.g., font choices, placeholder data structure).
- **How to Run:** Exact, step-by-step command-line instructions to set up and run the project (e.g., \`cd server && npm install && npm start\`, \`cd client && npm install && npm run dev\`). For single-file apps, instruct the user to simply open the HTML file in a browser.

### 4.2. Project Structure
A clear, tree-like representation of the complete folder and file structure. Separate \`client\` and \`server\` directories if it's a full-stack project.

### 4.3. Code Files (Full & Unabridged)
- Every single file required for the project must be included in a separate, titled code block.
- This includes \`package.json\` (with ALL dependencies), \`.env.example\`, build configurations (\`vite.config.js\`), server entry points, database connection logic, API routes, component files, HTML, CSS, etc.
- Imports must resolve correctly within the provided project structure.

### 4.4. Notes
- **Key Decisions:** Explain important architectural choices.
- **Backend Integration:** Detail how the frontend communicates with the backend.
- **Preview Limitations:** Add a note if the live preview is frontend-only and backend features require local setup.

### 4.5. Special Case: Single-File App (HTML)
If the user selects "Single-File App (HTML)" as the frontend stack, you MUST adhere to the following structure:
- **Single File:** Generate ONLY ONE file: \`index.html\`.
- **Tailwind CSS:** Include the Tailwind CSS CDN script (\`https://cdn.tailwindcss.com\`) in the \`<head>\`. Do not generate a separate CSS file.
- **JavaScript:** All JavaScript code MUST be placed within a \`<script>\` tag at the end of the \`<body>\`. Do not generate separate \`.js\` files.
- **Backend Integration:** If a backend is selected (e.g., Firebase, Supabase), include the necessary SDKs via CDN in the \`<head>\` and place all client-side connection and logic code within the main \`<script>\` tag.
- **Project Structure Output:** The project structure output should simply show \`index.html\`.

### 4.6. Special Case: p5.js
If the user selects "p5.js" as the frontend stack, you MUST generate a complete, single \`index.html\` file that is creative, interactive, and effectively utilizes the provided image.
- **Single File:** Generate ONLY ONE file: \`index.html\`.
- **p5.js Libraries:** Include the p5.js core library (\`p5.min.js\`) and optionally the p5.sound library (\`p5.sound.min.js\`) via CDN in the \`<head>\`.
- **Structure & Responsiveness:**
    - Use a standard p5.js structure: \`preload()\`, \`setup()\`, and \`draw()\`.
    - Initialize a responsive, full-screen canvas in \`setup()\` using \`createCanvas(windowWidth, windowHeight)\`.
    - Implement a \`windowResized()\` function to handle browser window resizing.
- **Image Utilization:** The generated sketch MUST creatively incorporate the user-provided image. Load it in \`preload()\` using \`loadImage()\`. Use it as a texture, a color source, a map for particle systems, or a direct visual element. Be artistic and clever.
- **Code Quality:** The code must be well-structured and commented, explaining the logic, especially the creative and interactive parts.
- **How to Run:** The instructions MUST state to simply open the \`index.html\` file in a browser.
- **Notes:** Provide a brief explanation of the artistic concept and the technical implementation of the sketch. Describe how the user can interact with the sketch if applicable.

---

## 5. Core Rules & Best Practices
1.  **Fidelity:** Meticulously match the layout, spacing, typography, colors, and overall design from the image.
2.  **Responsiveness:** All web UIs must be mobile-first and include at least two common breakpoints (\`640px\`, \`1024px\`).
3.  **Accessibility:** Implement proper HTML semantics, ARIA attributes, keyboard navigation, and focus management.
4.  **Performance:** Optimize for fast load times and smooth interactions. For 3D, aim for stable FPS.
5.  **Local Assets:** All assets should be referenced locally (e.g., in an \`/assets\` folder). Do not use external CDNs for libraries; rely on package management. **EXCEPTION**: For "Single-File App (HTML)", you MUST use CDNs for Tailwind CSS and any backend SDKs.

---

## 6. Database & Backend Integration Rules
When a backend/database is selected, you MUST generate the complete scaffolding.

-   **General:**
    -   Always create an \`.env.example\` file for environment variables like API keys and database URIs.
    -   Separate server and client code into distinct directories (\`server\`, \`client\`).
-   **Firebase:**
    -   Provide the Firebase configuration file (\`firebaseConfig.js\`).
    -   Include example Firestore/Realtime Database rules in a \`firestore.rules\` or \`database.rules.json\` file.
    -   Generate sample service code for interacting with Firebase services.
-   **Supabase:**
    -   Generate a Supabase client setup file (\`supabaseClient.js\`).
    -   Use the Supabase JS library for data operations.
-   **MongoDB + Express:**
    -   Create a complete Express server with a \`server.js\` or \`index.js\` entry point.
    -   Define Mongoose schemas and models for the data implied by the UI.
    -   Implement API routes (e.g., GET, POST, PUT, DELETE) for CRUD operations.
    -   Include database connection logic using Mongoose.
-   **PHP + MySQL:**
    -   Generate PHP scripts for database connection (\`db.php\`).
    -   Create separate PHP files for handling API requests.
    -   Provide a \`.sql\` file with the necessary \`CREATE TABLE\` statements.

---

## 7. Final Instruction
You are now the AI Full-Stack Engineer. Your outputs are not just code snippets; they are **complete, runnable software projects**. Analyze the user's request and image, and generate the entire codebase with unwavering quality and completeness. **Begin generation now.**`.trim();

const OUTPUT_TYPES = [
  'React + Tailwind',
  'Vue + Tailwind',
  'Svelte + Tailwind',
  'HTML + CSS + JS',
  'Single-File App (HTML)',
  'Flutter',
  'SwiftUI',
  'Android (XML)',
  'React Native',
  'Three.js (ESM)',
  'WebGL2',
  'Canvas 2D',
  'p5.js',
];

const DATABASE_TYPES = [
  'None',
  'Firebase',
  'Supabase',
  'MongoDB + Express',
  'PHP + MySQL',
];

// Parser function for the structured response
function parseResponse(text) {
  const headerMatch = text.match(
    /### 4\.1\. Header Block\s*([\s\S]*?)\s*### 4\.2\. Project Structure/,
  );
  const structureMatch = text.match(
    /### 4\.2\. Project Structure\s*([\s\S]*?)\s*### 4\.3\. Code Files/,
  );
  const notesMatch = text.match(/### 4\.4\. Notes\s*([\s\S]*)/);

  const header = headerMatch ? headerMatch[1].trim() : '';
  const structure = structureMatch ? structureMatch[1].trim() : '';
  const notes = notesMatch ? notesMatch[1].trim() : '';

  const files = [];
  const filesSectionMatch = text.match(
    /### 4\.3\. Code Files \(Full & Unabridged\)\s*([\s\S]*?)(?=\s*### 4\.4\. Notes|$)/,
  );

  if (filesSectionMatch) {
    const codeBlockRegex = /```(\w*):?([\w.\/\\-]+)?\n([\s\S]*?)\n```/g;
    let match;
    while ((match = codeBlockRegex.exec(filesSectionMatch[1])) !== null) {
      const [, lang, name, content] = match;
      files.push({
        lang: lang || 'text',
        name: name || 'untitled',
        content: content.trim(),
      });
    }
  }

  // Fallback for a single, untyped code block
  if (files.length === 0) {
    const regex = /```(?:[\w]*)?\s*([\s\S]*?)```/g;
    const match = regex.exec(text);
    if (match) {
      files.push({
        name: 'code.js',
        lang: 'javascript',
        content: match[1].trim(),
      });
    }
  }

  return {header, structure, notes, files};
}

// Generate code from inputs
async function generateCodeFromInput(
  imageBase64,
  prompt,
  userPrompt,
  urlInput,
  outputType,
  databaseType,
) {
  const contents = [];

  const textParts = [];
  if (userPrompt) {
    textParts.push(`User's Detailed Prompt: ${userPrompt}`);
  }
  textParts.push(`Target Frontend Stack: ${outputType}`);

  if (databaseType !== 'None') {
    textParts.push(`Target Backend/Database: ${databaseType}`);
  }
  if (urlInput) textParts.push(`Source URL: ${urlInput}`);
  contents.push({text: textParts.join('\n')});

  if (imageBase64) {
    contents.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: imageBase64.match(/data:([^;]+);/)[1],
      },
    });
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: contents,
    config: {
      systemInstruction: prompt,
    },
  });

  return response.text;
}

export default function Home() {
  const [imageBase64, setImageBase64] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outputType, setOutputType] = useState(OUTPUT_TYPES[0]);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load prompt from localStorage on initial render
  useEffect(() => {
    const savedPrompt = localStorage.getItem('savedPrompt');
    if (savedPrompt) {
      setPrompt(savedPrompt);
    } else {
      setPrompt(NEW_SYSTEM_PROMPT);
      localStorage.setItem('savedPrompt', NEW_SYSTEM_PROMPT);
    }
  }, []);

  // Save prompt to localStorage whenever it changes
  useEffect(() => {
    if (prompt) {
      localStorage.setItem('savedPrompt', prompt);
    }
  }, [prompt]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      // FIX: Check if the reader's result is a string before using it.
      if (event.target && typeof event.target.result === 'string') {
        const img = document.createElement('img');
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleFactor = 512 / Math.max(img.width, img.height);
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImageBase64(canvas.toDataURL(file.type));
        };
      }
    };

    reader.readAsDataURL(file);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {'image/*': ['.png', '.jpeg', '.jpg', '.webp']},
  });

  const generateCode = async () => {
    if (!imageBase64 && !urlInput) return;

    setLoading(true);
    setOutput(null);

    try {
      const responseText = await generateCodeFromInput(
        imageBase64,
        prompt,
        userPrompt,
        urlInput,
        outputType,
        databaseType,
      );
      const parsedOutput = parseResponse(responseText);

      if (parsedOutput.files.length === 0) {
        console.error('No code blocks found in the response.');
        setShowErrorModal(true);
        return;
      }

      setOutput(parsedOutput);
    } catch (error) {
      console.error('Error generating code:', error);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200">
      <Header />
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
      <div className="absolute inset-0 top-[65px] sm:top-[73px] overflow-y-auto">
        <main className="flex flex-col gap-6 max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* --- User Prompt Input --- */}
          <div className="relative w-full">
            <Pen
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Enter a detailed prompt (e.g., 'Make the buttons blue', 'Add a chart for user signups')..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              maxLength={200}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">
              {userPrompt.length} / 200
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* --- Input Column --- */}
            <div className="w-full md:w-5/12 lg:w-4/12 md:sticky md:top-6 self-start">
              <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                {/* Output Type */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="output-type"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Frontend
                  </label>
                  <div className="relative">
                    <select
                      id="output-type"
                      value={outputType}
                      onChange={(e) => setOutputType(e.target.value)}
                      className="w-full appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {OUTPUT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Database Type */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="database-type"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Database / Backend
                  </label>
                  <div className="relative">
                    <select
                      id="database-type"
                      value={databaseType}
                      onChange={(e) => setDatabaseType(e.target.value)}
                      className="w-full appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {DATABASE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* URL Input */}
                <div className="relative">
                  <Link
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Enter a URL to screenshot"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <hr className="w-full border-slate-200 dark:border-slate-700" />
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    OR
                  </span>
                  <hr className="w-full border-slate-200 dark:border-slate-700" />
                </div>

                {/* Image Upload */}
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                  }`}>
                  <input {...getInputProps()} />
                  {imageBase64 ? (
                    <div className="relative">
                      <img
                        src={imageBase64}
                        alt="Uploaded preview"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageBase64('');
                        }}
                        className="absolute top-2 right-2 bg-white/50 backdrop-blur-sm rounded-full p-1 text-slate-700 hover:bg-white transition-colors">
                        <Upload size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center text-slate-500 dark:text-slate-400">
                      <Upload size={24} />
                      <p className="text-sm">
                        <span className="font-semibold text-blue-500">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs">PNG, JPG, WEBP</p>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={generateCode}
                  disabled={(!imageBase64 && !urlInput) || loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Code size={16} />
                  <span>Generate Code</span>
                </button>

                {/* Advanced Settings */}
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                    <span className="font-medium">Advanced Settings</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showAdvanced && (
                    <div className="mt-4">
                      <label
                        htmlFor="prompt"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        System Prompt
                      </label>
                      <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={8}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* --- Output Column --- */}
            <div className="w-full md:w-7/12 lg:w-8/12">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                  <LoaderCircle
                    size={48}
                    className="text-slate-400 dark:text-slate-500 animate-spin mb-4"
                  />
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                    Generating code...
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    This may take a moment. Please wait.
                  </p>
                </div>
              ) : output ? (
                <CodePreview output={output} isDarkMode={isDarkMode} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
                  <Layers
                    size={48}
                    className="text-slate-400 dark:text-slate-600 mb-4"
                  />
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                    Your generated code will appear here
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Upload an image or provide a URL to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
