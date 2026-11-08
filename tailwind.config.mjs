import design from "./tailwind.design.config.js";
export default { ...design, content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"], theme: { ...design.theme, extend: { ...design.theme.extend, opacity: { 15: ".15" } } } };
