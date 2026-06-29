export const fonts: Record<string, string> = {
    times: '"Times", "Times New Roman", "Georgia", serif;',
    verdana: '"Verdana", "Helvetica", "Arial", sans-serif;',
    lucida: '"Lucida Console", "Courier New", monospace;',
    gills: '"Gill Sans Extrabold", sans-serif;',
    goudy: '"Goudy Bookletter 1911", sans-serif;',
    cursive: 'cursive;',
    fantasy: 'fantasy;',
    math: 'math;',
    fangsong: 'fangsong;',
    serif: 'serif;',
    sans_serif: 'sans-serif;',
    monospace: 'monospace;',
}

export const font = (font: string) => {
    return fonts[font] ?? fonts.times
}