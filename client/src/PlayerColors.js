

const bckgrnd_class = ["red",       "blue",         "green",        "orange", "purple",     "pink"]
const css_colors =    ["Crimson",   "RoyalBlue",   "ForestGreen",  "Orange", "DarkOrchid", "HotPink"]

export function GetColorBackgroundClass(index)
{
    return "bckgrnd-" + bckgrnd_class[index];
}

export function GetCSSColor(index)
{
    return css_colors[index];
}

export const COLOR_CNT = bckgrnd_class.length;
