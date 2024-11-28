/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				'host-grotesk': ['Host Grotesk', 'sans-serif'],
			},
		},
	},
	plugins: [],
	darkMode: ['selector', '[data-mode="dark"]'],
};
