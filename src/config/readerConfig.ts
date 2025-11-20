
export const readerConfig = {
    themes: {
        light: {
            name: 'Light',
            bg: 'bg-[#f0f8ff]',
            text: 'text-slate-900',
            accent: 'blue',
            panelBg: 'bg-[#f0f8ff]/95',
            panelBorder: 'border-blue-200',
        },
        sepia: {
            name: 'Sepia',
            bg: 'bg-[#f4ecd8]',
            text: 'text-[#5b4636]',
            accent: 'amber',
            panelBg: 'bg-[#f4ecd8]/90',
            panelBorder: 'border-[#e6dbbf]',
        },
        dark: {
            name: 'Dark',
            bg: 'bg-slate-950',
            text: 'text-slate-200',
            accent: 'indigo',
            panelBg: 'bg-slate-900/90',
            panelBorder: 'border-slate-800',
        },
        midnight: {
            name: 'Midnight',
            bg: 'bg-black',
            text: 'text-gray-400',
            accent: 'violet',
            panelBg: 'bg-zinc-900/90',
            panelBorder: 'border-zinc-800',
        },
        forest: {
            name: 'Forest',
            bg: 'bg-emerald-950',
            text: 'text-emerald-100',
            accent: 'emerald',
            panelBg: 'bg-emerald-900/90',
            panelBorder: 'border-emerald-800',
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
