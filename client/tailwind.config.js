/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "Noto Sans", "sans-serif"],
			}
		}
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				civiclight: {
					...require("daisyui/src/theming/themes")["[data-theme=corporate]"],
					primary: "#2563eb",
					"primary-content": "#ffffff",
					secondary: "#0ea5e9",
					accent: "#22c55e",
					neutral: "#2b3440",
					"base-100": "#ffffff",
					"base-200": "#f3f4f6",
					"base-300": "#e5e7eb",
					info: "#38bdf8",
					success: "#16a34a",
					warning: "#f59e0b",
					error: "#ef4444"
				}
			},
			{
				civicdark: {
					...require("daisyui/src/theming/themes")["[data-theme=business]"],
					primary: "#60a5fa",
					"primary-content": "#0b1220",
					secondary: "#22d3ee",
					accent: "#34d399",
					neutral: "#1f2937",
					"base-100": "#0b1220",
					"base-200": "#111827",
					"base-300": "#1f2937",
					info: "#38bdf8",
					success: "#22c55e",
					warning: "#fbbf24",
					error: "#f87171"
				}
			},
			
		]
	}
};
