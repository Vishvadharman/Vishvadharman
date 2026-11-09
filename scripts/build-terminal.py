"""Render the original profile terminal loop with Pillow.

Run: python scripts/build-terminal.py
"""
import math
import os
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / "assets"
BG = "#0a0f16"
EDGE = "#2b3b48"
PANEL = "#0d1620"
GRID = "#213342"
MUTED = "#8da4b5"
WHITE = "#dceaf3"
CYAN = "#86dcf6"
MINT = "#91efc8"
VIOLET = "#c0afff"
AMBER = "#ffd291"
CHARS = "01.:+=#@"
FRAME_MS = 60
SCENES = (
    (3000, "./field-console", "SYSTEM BOOT", CYAN, (
        ("boot", "initialize demo shell"), ("load", "document AI / vehicle AI"),
        ("load", "portable agent memory"), ("ok", "console online"),
    )),
    (4420, "inspect --deviation", "DOCUMENT DIFF", CYAN, (
        ("open", "reference + draft"), ("diff", "flag changed wording"),
        ("link", "trace each flag to source"), ("ok", "ready for review"),
    )),
    (4840, "simulate --v2x", "VEHICLE NETWORK", VIOLET, (
        ("run", "simulate traffic in SUMO"), ("test", "inject poisoned updates"),
        ("check", "compare model responses"), ("log", "record the test run"),
    )),
    (4360, "mount --brainvault", "MEMORY TRANSFER", MINT, (
        ("open", "encrypted USB memory"), ("read", "load saved context"),
        ("move", "resume on another machine"), ("ok", "agent context restored"),
    )),
    (4700, "whoami", "ENGINEER PROFILE", CYAN, (
        ("name", "Vishvadharman Saminathan"), ("work", "AI engineering / research"),
        ("base", "Chennai, India"), ("exit", "session complete"),
    )),
)
TOTAL = sum(s[0] for s in SCENES)


@lru_cache
def font(size, bold=False):
    windows = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    candidates = [windows / ("consolab.ttf" if bold else "consola.ttf"),
                  "DejaVuSansMono-Bold.ttf" if bold else "DejaVuSansMono.ttf"]
    for candidate in candidates:
        try:
            return ImageFont.truetype(str(candidate), size)
        except OSError:
            continue
    raise RuntimeError("Install Consolas or DejaVu Sans Mono.")


def line(draw, pos, label, size, color, bold=False, anchor="lt"):
    draw.text(pos, label, font=font(size, bold), fill=color, anchor=anchor)


def diagram(draw, panel, scene, t, accent):
    """Draw the active terminal program on a fixed character grid."""
    x0, y0, x1, y1 = panel
    cols, rows = 29, 12
    step_x = (x1 - x0 - 28) / cols
    step_y = (y1 - y0 - 74) / rows
    size = min(24, int(step_x * 1.63), int(step_y * 1.17))
    cells = {}

    def put(x, y, value, color=accent):
        for i, c in enumerate(value):
            if c != " " and 0 <= x+i < cols and 0 <= y < rows:
                cells[(x+i, y)] = (c, color)

    def wire(points, color=GRID):
        for i, (x, y) in enumerate(points):
            put(x, y, "." if i % 2 == 0 else "-", color)

    def packet(points, speed=11, phase=0):
        pos = (int(t * speed) + phase) % len(points)
        for offset, c, color in [(-2, ".", GRID), (-1, "+", accent), (0, "*", WHITE)]:
            px, py = points[(pos + offset) % len(points)]
            put(px, py, c, color)

    if scene in (0, 4):
        sweep = int(t * 13) % 35 - 5
        for y in range(12):
            for x in range(29):
                near = abs(x - (5+y*.78)) < 2.65 or abs(x - (23-y*.78)) < 2.65
                if near and 0 < y < 11:
                    wave = abs(x - sweep + y*.28)
                    value = CHARS[(x*7 + y*11 + (int(t*9) if wave < 3 else 0)) % len(CHARS)]
                    put(x, y, value, WHITE if wave < 1.25 else accent if wave < 4 else "#3f7488")
                elif (y*5 + x*7) % 29 == 4:
                    put(x, y, ".", GRID)
        put(0, 0, "[-", MUTED)
        put(27, 0, "-]", MUTED)
        put(0, 11, "[-", MUTED)
        put(27, 11, "-]", MUTED)
    elif scene == 1:
        row = min(9, 3 + int(max(0, t - .4) * 2) % 7)
        for left, label in ((1, "REF"), (17, "DRAFT")):
            put(left, 0, "+---------+", "#527e91")
            put(left + 1, 1, label, MUTED)
            for y in range(1, 11):
                put(left, y, "|", "#527e91")
                put(left+10, y, "|", "#527e91")
            for y in range(3, 10):
                n = 4 + (y*7 % 5)
                if left == 17 and y == row:
                    put(left+1, y, "+" + "="*(n-1), MINT)
                elif left == 1 and y == row:
                    put(left+1, y, "-" + "="*(n-1), AMBER)
                else:
                    put(left+1, y, "-"*n, "#416274")
            put(left, 11, "+---------+", "#527e91")
        put(12, row, "-->", WHITE)
        if int(t * 4) % 2:
            put(13, row, "=", MINT)
    elif scene == 2:
        upper = [(x, 3) for x in range(4, 25)]
        lower = [(x, 8) for x in range(4, 25)]
        branch = [(x, 3) for x in range(4, 14)] + [(13, y) for y in range(4, 8)] + [(x, 8) for x in range(13, 25)]
        for route in [upper, lower, branch]:
            wire(route, "#48617b")
        packet(upper, 12)
        packet(lower[::-1], 10, 6)
        packet(branch, 14, 5)
        for x, y, tag in [(0, 3, "A"), (25, 3, "B"), (0, 8, "C"), (25, 8, "D")]:
            put(x, y, "["+tag+"]", accent)
        for y in [5, 6]:
            put(13, y, "|", MUTED)
        vehicle = 3 + int(t*6) % 18
        incoming = 20 - int(t*5) % 18
        put(vehicle, 0, "/==\\", accent)
        put(vehicle-1, 1, "o----o", WHITE)
        put(incoming-1, 11, "o----o", accent)
        put(17, 5, "( ))" if int(t*4) % 2 else "(( )", "#7698a9")
    else:
        for y, row in enumerate((
            "        +-----------+",
            "     ---| +-------+ |---",
            "     ---| |   __  | |---",
            "     ---| |  /  \\ | |---",
            "     ---| |  |##| | |---",
            "     ---| |  +--+ | |---",
            "     ---| +-------+ |---",
            "        +-----------+",
        ), start=1):
            put(0, y, row, accent if y in (1, 8) else "#629184")
        packet([(x, 1) for x in range(8, 21)] + [(20, y) for y in range(2, 9)] +
               [(x, 8) for x in range(19, 7, -1)] + [(8, y) for y in range(7, 1, -1)], 13)
        progress = min(20, int(t * 6))
        put(3, 10, "["+"="*progress+("."*(20-progress))+"]", MINT)
        bits = int(t * 9)
        for j in range(7):
            put(7+j*2, 11, str((bits+j*3) % 2), MINT if (bits+j*2) % 7 < 3 else "#6b9188")
    for (x, y), (c, color) in cells.items():
        if 0 < scene < 4 and t < .55 + (x + y) * .012:
            continue
        line(draw, (x0 + 14 + (x+.5)*step_x, y0 + 45 + (y+.5)*step_y),
             c, size, color, anchor="mm")


def render(ms, mobile=False):
    width, height = (540, 646) if mobile else (1060, 438)
    im = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(im)
    for index, (duration, command, label, accent, logs) in enumerate(SCENES):
        if ms < duration:
            break
        ms -= duration
    t = ms / 1000
    draw.rounded_rectangle((1, 1, width-2, height-2), 13, outline=EDGE, width=2)
    draw.line((1, 58, width-2, 58), fill=EDGE)
    draw.rectangle((21, 23, 28, 31), fill=accent)
    line(draw, (40, 20), "VISHVA / FIELD CONSOLE", 20, WHITE, True)
    line(draw, (width-21, 22), "DEMO MODE", 15, MUTED, anchor="rt")
    x = 24 if mobile else 27
    text_size = 24 if mobile else 25
    line(draw, (x, 79), f"SESSION {index+1:02} / {len(SCENES):02}", 16, accent, True)
    prompt = "vishva> "
    py = 115
    char_width = font(text_size, True).getlength("X")
    line(draw, (x, py), prompt, text_size, accent, True)
    prompt_x = x + len(prompt)*char_width
    typed = max(0, min(len(command), int((t-.16)*26)))
    line(draw, (prompt_x, py), command[:typed], text_size, WHITE, True)
    log_y = 159
    for i, (kind, message) in enumerate(logs):
        start = .88 + .37*i
        if t < start:
            break
        line(draw, (x, log_y+i*33), f"[{kind:<5}]", 19, accent, True)
        line(draw, (x+103, log_y+i*33), message, 22, WHITE)
    if typed < len(command):
        caret_x = prompt_x + typed*char_width
        caret_y = py
    elif t >= 2.37:
        caret_x = x
        caret_y = 299
    else:
        caret_x = caret_y = None
    if caret_x is not None and (typed < len(command) or int(t*3) % 2 == 0):
        draw.rectangle((caret_x, caret_y, caret_x+char_width-2, caret_y+19), fill=accent)
    panel = (22, 327, width-23, 586) if mobile else (567, 76, width-23, 376)
    draw.rounded_rectangle(panel, 9, fill=PANEL, outline=EDGE)
    a,b,c,d = panel
    draw.line((a+1, b+34, c-1, b+34), fill=EDGE)
    line(draw, (a+12, b+10), label, 16, accent, True)
    line(draw, (c-12, b+11), "ASCII", 14, MUTED, anchor="rt")
    diagram(draw, panel, index, t, accent)
    base_y = height - 47
    draw.line((1, base_y, width-2, base_y), fill=EDGE)
    line(draw, (x, base_y+15), "LOOP PLAYBACK", 15, MUTED, True)
    right = width-24
    step = 27 if mobile else 44
    for j, (_, _, _, color, _) in enumerate(SCENES):
        left = right-(len(SCENES)-j)*step
        draw.rounded_rectangle((left, base_y+19, left+step-5, base_y+23), 2, fill=GRID)
        fill = 1 if j < index else ms/duration if j == index else 0
        if fill:
            draw.rounded_rectangle((left, base_y+19, left+int((step-5)*fill), base_y+23), 2, fill=color)
    return im


def export(mobile):
    suffix = "-mobile" if mobile else ""
    samples = [render(sum(s[0] for s in SCENES[:i])+offset, mobile)
               for i in range(len(SCENES)) for offset in (1200, 2700)]
    palette_board = Image.new("RGB", (samples[0].width, samples[0].height*len(samples)))
    for i, sample in enumerate(samples):
        palette_board.paste(sample, (0, i*sample.height))
    palette = palette_board.quantize(colors=128)
    frames = [render(ms, mobile).quantize(palette=palette, dither=Image.Dither.NONE)
              for ms in range(0, TOTAL, FRAME_MS)]
    gif = OUTPUT / f"field-console{suffix}.gif"
    frames[0].save(gif, save_all=True, append_images=frames[1:], duration=FRAME_MS,
                   loop=0, disposal=1, optimize=True)
    still = render(sum(s[0] for s in SCENES[:-1])+2640, mobile)
    still.save(OUTPUT / f"field-console{suffix}-still.png", optimize=True)
    print(f"{gif.name}: {gif.stat().st_size:,} bytes, {len(frames)} source frames")


if __name__ == "__main__":
    for is_mobile in (False, True):
        export(is_mobile)
