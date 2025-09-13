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
				danger: 'hsl(var(--danger))',
				warning: 'hsl(var(--warning))',
				safe: 'hsl(var(--safe))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'wave': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-15px)' }
				},
				'ripple': {
					'0%': { 
						transform: 'scale(0)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(4)',
						opacity: '0'
					}
				},
				'drift': {
					'0%': { transform: 'translateX(0) translateY(0)' },
					'25%': { transform: 'translateX(5px) translateY(-10px)' },
					'50%': { transform: 'translateX(-5px) translateY(-5px)' },
					'75%': { transform: 'translateX(10px) translateY(-15px)' },
					'100%': { transform: 'translateX(0) translateY(0)' }
				},
				'bubble': {
					'0%': { 
						transform: 'translateY(100%) scale(0)',
						opacity: '0'
					},
					'50%': { 
						opacity: '1'
					},
					'100%': { 
						transform: 'translateY(-100vh) scale(1)',
						opacity: '0'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'stagger-in': {
					'0%': { 
						opacity: '0',
						transform: 'translateY(30px) scale(0.95)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'fade-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-fade': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'underline': {
					'0%': { transform: 'scaleX(0)' },
					'100%': { transform: 'scaleX(1)' }
				},
				'letter-reveal': {
					'0%': { opacity: '0.3' },
					'100%': { opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'wave': 'wave 4s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'ripple': 'ripple 0.6s ease-out',
				'drift': 'drift 8s ease-in-out infinite',
				'bubble': 'bubble 4s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'stagger-in': 'stagger-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
				'fade-up': 'fade-up 0.6s ease-out forwards',
				'scale-fade': 'scale-fade 0.5s ease-out forwards',
				'underline': 'underline 0.3s ease-out forwards',
				'letter-reveal': 'letter-reveal 0.4s ease-out forwards'
			},
			backgroundImage: {
				'gradient-ocean': 'var(--gradient-ocean)',
				'gradient-wave': 'var(--gradient-wave)',
				'gradient-seafoam': 'var(--gradient-seafoam)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-floating': 'var(--gradient-floating)',
				'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
			},
			boxShadow: {
				'ocean': 'var(--shadow-ocean)',
				'wave': 'var(--shadow-wave)',
				'float': 'var(--shadow-float)',
				'glow': 'var(--shadow-glow)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
