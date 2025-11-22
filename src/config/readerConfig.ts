
export const readerConfig = {
    themes: {
        light: {
            name: 'Light Blue',
            bg: 'bg-blue-100', // Heavy Blue
            text: 'text-blue-950', // Dark Blue Text
            accent: '#2563eb', // Blue-600
            panelBg: 'bg-white/95',
            panelBorder: 'border-blue-200',
            glass: 'backdrop-blur-md bg-white/90 border-b border-blue-200 shadow-sm',
            ui: {
                hover: 'hover:bg-blue-200',
                active: 'bg-blue-300',
                border: 'border-blue-300',
                textMuted: 'text-blue-800',
                progressBar: 'bg-blue-600',
                input: 'bg-white border border-blue-300 focus:border-blue-600',
                ring: 'focus:ring-blue-600/20',
                glass: 'backdrop-blur-xl bg-white/95 border border-blue-300 shadow-lg',
                glassHover: 'hover:bg-blue-50',
                buttonGlass: 'bg-blue-200 border border-blue-300 shadow-sm hover:bg-blue-300 hover:border-blue-400 text-blue-950', // Solid
                transition: 'transition-all duration-200 ease-out'
            }
        },
        sepia: {
            name: 'Sepia',
            bg: 'bg-[#f4ecd8]', // Classic Sepia
            text: 'text-[#433422]', // Darker warm brown
            accent: '#d97706', // Amber-600
            panelBg: 'bg-[#f4ecd8]/95',
            panelBorder: 'border-[#e6dbb9]',
            glass: 'backdrop-blur-md bg-[#f4ecd8]/95 border-b border-[#e6dbb9] shadow-sm',
            ui: {
                hover: 'hover:bg-[#5b4636]/10',
                active: 'bg-[#5b4636]/20',
                border: 'border-[#d8cfa9]',
                textMuted: 'text-[#5b4636]',
                progressBar: 'bg-[#d97706]',
                input: 'bg-[#fdf6e3] border border-[#e6dbb9] focus:border-[#d97706]',
                ring: 'focus:ring-[#d97706]/20',
                glass: 'backdrop-blur-xl bg-[#fdf6e3]/95 border border-[#e6dbb9] shadow-lg',
                glassHover: 'hover:bg-[#fcf5e4]',
                buttonGlass: 'bg-[#e6dbb9] border border-[#c4bb97] shadow-sm hover:bg-[#c4bb97] text-[#433422]', // Solid
                transition: 'transition-all duration-200 ease-out'
            }
        },
        dark: {
            name: 'Dark',
            bg: 'bg-[#1e293b]', // Slate-800
            text: 'text-[#cbd5e1]', // Slate-300
            accent: '#818cf8', // Indigo-400
            panelBg: 'bg-[#1e293b]/95',
            panelBorder: 'border-slate-700',
            glass: 'backdrop-blur-md bg-[#1e293b]/80 border-b border-slate-700/50 shadow-md',
            ui: {
                hover: 'hover:bg-white/5',
                active: 'bg-white/10',
                border: 'border-slate-700',
                textMuted: 'text-slate-500',
                progressBar: 'bg-[#818cf8]',
                input: 'bg-[#0f172a] border border-slate-700 focus:border-[#818cf8]',
                ring: 'focus:ring-[#818cf8]/20',
                glass: 'backdrop-blur-xl bg-[#0f172a]/90 border border-slate-700 shadow-xl',
                glassHover: 'hover:bg-[#1e293b]',
                buttonGlass: 'bg-slate-700/80 backdrop-blur-md border border-slate-600 shadow-md hover:bg-slate-600 text-slate-100', // Lighter
                transition: 'transition-all duration-200 ease-out'
            }
        },
        forest: {
            name: 'Forest',
            bg: 'bg-[#1a2e26]', // Deep Green
            text: 'text-[#d1fae5]', // Emerald-100
            accent: '#34d399', // Emerald-400
            panelBg: 'bg-[#1a2e26]/95',
            panelBorder: 'border-[#2d4a3e]',
            glass: 'backdrop-blur-md bg-[#1a2e26]/80 border-b border-[#2d4a3e]/50 shadow-md',
            ui: {
                hover: 'hover:bg-white/5',
                active: 'bg-white/10',
                border: 'border-[#2d4a3e]',
                textMuted: 'text-[#6ee7b7]/50',
                progressBar: 'bg-[#34d399]',
                input: 'bg-[#11211b] border border-[#2d4a3e] focus:border-[#34d399]',
                ring: 'focus:ring-[#34d399]/20',
                glass: 'backdrop-blur-xl bg-[#11211b]/90 border border-[#2d4a3e] shadow-xl',
                glassHover: 'hover:bg-[#1a2e26]',
                buttonGlass: 'bg-[#2d4a3e]/80 backdrop-blur-md border border-[#34d399]/30 shadow-md hover:bg-[#2d4a3e] text-emerald-100', // Lighter
                transition: 'transition-all duration-200 ease-out'
            }
        },
        nebula: {
            name: 'Nebula',
            bg: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950',
            text: 'text-purple-100',
            accent: '#d8b4fe', // Purple-300
            panelBg: 'bg-purple-950/40',
            panelBorder: 'border-purple-500/20',
            glass: 'backdrop-blur-md bg-purple-950/30 border-b border-purple-500/20 shadow-lg',
            ui: {
                hover: 'hover:bg-white/10',
                active: 'bg-white/20',
                border: 'border-purple-500/30',
                textMuted: 'text-purple-300/60',
                progressBar: 'bg-fuchsia-500',
                input: 'bg-purple-950/50 border border-purple-500/30 focus:border-fuchsia-500',
                ring: 'focus:ring-fuchsia-500/30',
                glass: 'backdrop-blur-xl bg-purple-950/60 border border-purple-500/20 shadow-xl',
                glassHover: 'hover:bg-purple-900/60',
                buttonGlass: 'bg-purple-800/60 backdrop-blur-md border border-purple-500/40 shadow-lg hover:bg-purple-700/60 text-purple-100', // Lighter
                transition: 'transition-all duration-200 ease-out'
            }
        }
    },
    musicTracks: [
        { label: 'Ethereal Dream', value: '/music/track1.mp3' },
        { label: 'Deep Focus', value: '/music/track2.mp3' },
        { label: 'Ambient Rain', value: '/music/track3.mp3' },
        { label: 'Cosmic Journey', value: '/music/track4.mp3' },
        { label: 'Piano Reflections', value: '/music/track5.mp3' },
        { label: 'Nature Sounds', value: '/music/track6.mp3' },
    ]
};

export type ReaderTheme = keyof typeof readerConfig.themes;
