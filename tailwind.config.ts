import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced Gaming-specific color palette
				gaming: {
					primary: 'hsl(120 70% 50%)',
					secondary: 'hsl(120 60% 40%)',
					accent: 'hsl(120 80% 45%)',
					dark: 'hsl(140 20% 8%)',
					darker: 'hsl(140 25% 6%)',
					darkest: 'hsl(140 30% 4%)',
					light: 'hsl(120 20% 90%)',
					muted: 'hsl(120 10% 60%)',
					glow: 'hsl(120 70% 50% / 0.3)',
					neon: 'hsl(120 100% 60%)',
					cyber: 'hsl(160 80% 50%)',
					matrix: 'hsl(100 70% 45%)'
				},
				// Custom bright green color
				'bright-green': {
					DEFAULT: '#46ff00',
					50: '#eafff1',
					100: '#d4ffe3',
					200: '#aaffcc',
					300: '#7bffa6',
					400: '#46ff00', // Main color
					500: '#3de600',
					600: '#34cc00',
					700: '#2bb300',
					800: '#229900',
					900: '#1a8000'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'gaming': ['Orbitron', 'monospace'],
				'cyber': ['Rajdhani', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gaming-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 5px hsl(var(--primary) / 0.5)',
						transform: 'scale(1)'
					},
					'50%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.4)',
						transform: 'scale(1.02)'
					}
				},
				'gaming-glow': {
					'0%, 100%': {
						textShadow: '0 0 5px hsl(var(--primary) / 0.5)'
					},
					'50%': {
						textShadow: '0 0 10px hsl(var(--primary) / 0.8), 0 0 15px hsl(var(--primary) / 0.6)'
					}
				},
				'matrix-rain': {
					'0%': {
						transform: 'translateY(-100%)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'90%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(100vh)',
						opacity: '0'
					}
				},
				'cyber-scan': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'neon-flicker': {
					'0%, 100%': {
						opacity: '1',
						textShadow: '0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary))'
					},
					'50%': {
						opacity: '0.8',
						textShadow: '0 0 2px hsl(var(--primary)), 0 0 5px hsl(var(--primary))'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gaming-pulse': 'gaming-pulse 2s ease-in-out infinite',
				'gaming-glow': 'gaming-glow 2s ease-in-out infinite',
				'matrix-rain': 'matrix-rain 3s linear infinite',
				'cyber-scan': 'cyber-scan 2s ease-in-out infinite',
				'neon-flicker': 'neon-flicker 1.5s ease-in-out infinite alternate'
			},
			backgroundImage: {
				'gaming-gradient': 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary)))',
				'gaming-radial': 'radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent)',
				'cyber-grid': 'linear-gradient(rgba(120, 255, 120, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(120, 255, 120, 0.1) 1px, transparent 1px)',
				'neon-border': 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))'
			},
			boxShadow: {
				'gaming': '0 0 20px hsl(var(--primary) / 0.3)',
				'gaming-strong': '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.2)',
				'neon': '0 0 5px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 35px hsl(var(--primary))',
				'cyber': 'inset 0 0 20px hsl(var(--primary) / 0.1), 0 0 20px hsl(var(--primary) / 0.1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
