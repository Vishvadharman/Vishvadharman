"""Render the original profile terminal loop with Pillow.

Run: python scripts/build-terminal.py
"""
import os
from collections import deque
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / "assets"
DISPLAY_FONT = Path(__file__).with_name("fonts") / "SpaceGrotesk.ttf"
BG = "#10131f"
EDGE = "#34384f"
PANEL = "#151a2b"
GRID = "#283044"
MUTED = "#a9b4ce"
WHITE = "#f6f1ff"
CYAN = "#83ddff"
MINT = "#83edbb"
VIOLET = "#d6b8ff"
AMBER = "#ffd689"
CORAL = "#ffaf9d"
PORTRAIT_GRID = Path(__file__).with_name("portrait-tone-grid.png")
FRAME_MS = 60
SCENES = (
    (5400, "./field-console", "SYSTEM BOOT", CORAL, (
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
    (9600, "whoami", "ENGINEER PROFILE", AMBER, (
        ("name", "Vishvadharman Saminathan"), ("work", "AI engineering / research"),
        ("base", "Chennai, India"), ("exit", "session complete"),
    )),
)
TOTAL = sum(s[0] for s in SCENES)


@lru_cache
def font(size, bold=False, mono=True):
    if not mono:
        face = ImageFont.truetype(str(DISPLAY_FONT), size)
        face.set_variation_by_axes([700 if bold else 450])
        return face
    windows = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    candidates = [windows / "CascadiaMono.ttf", windows / ("consolab.ttf" if bold else "consola.ttf"),
                  "DejaVuSansMono-Bold.ttf" if bold else "DejaVuSansMono.ttf"]
    for candidate in candidates:
        try:
            face = ImageFont.truetype(str(candidate), size)
            if candidate == windows / "CascadiaMono.ttf":
                face.set_variation_by_axes([650 if bold else 450])
            return face
        except OSError:
            continue
    raise RuntimeError("Install Consolas or DejaVu Sans Mono.")


def line(draw, pos, label, size, color, bold=False, anchor="lt", mono=True):
    draw.text(pos, label, font=font(size, bold, mono), fill=color, anchor=anchor)


@lru_cache
def tint(base, accent, strength):
    return tuple(round(a + (b - a) * strength)
                 for a, b in zip(ImageColor.getrgb(base), ImageColor.getrgb(accent)))


@lru_cache
def portrait_grid():
    """Read the low-resolution color samples used to paint binary glyphs."""
    with Image.open(PORTRAIT_GRID) as image:
        samples = image.convert("RGB")
    width, height = samples.size
    edges = deque((x, y) for y in range(height) for x in range(width)
                  if x in (0, width - 1) or y in (0, height - 1))
    background = set()
    while edges:
        x, y = edges.popleft()
        if (x, y) in background or not (0 <= x < width and 0 <= y < height):
            continue
        r, g, b = samples.getpixel((x, y))
        if min(r, g, b) < 223 or max(r, g, b) - min(r, g, b) > 24:
            continue
        background.add((x, y))
        edges.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    underlay = Image.new("RGBA", samples.size)
    for y in range(height):
        for x in range(width):
            if (x, y) not in background:
                r, g, b = samples.getpixel((x, y))
                underlay.putpixel((x, y), (round(18 + r * .73), round(21 + g * .70),
                                             round(32 + b * .67), 255))

    cell = 4
    cols, rows = width // cell, height // cell
    glyph_samples = samples.resize((cols, rows), Image.Resampling.BOX)
    pixels = [[] for _ in range(rows)]
    for y in range(rows):
        for x in range(cols):
            subject_pixels = sum((x * cell + dx, y * cell + dy) not in background
                                 for dx in range(cell) for dy in range(cell))
            if subject_pixels < cell * cell / 2:
                continue
            r, g, b = glyph_samples.getpixel((x, y))
            color = (min(255, round(44 + r * .78)),
                     min(255, round(48 + g * .75)),
                     min(255, round(65 + b * .71)))
            digit = str(((x * 13) ^ (y * 29) ^ (x * y * 7) ^ ((x + y) >> 2)) & 1)
            pixels[y].append((x, digit, color))
    return underlay, cols, rows, pixels


@lru_cache
def portrait_layer(width, height):
    underlay, cols, rows, pixels = portrait_grid()
    step_y = (height - 52) / rows
    step_x = step_y * .82 * rows / cols
    size = max(1, int(min(step_x / .6, step_y * 1.17)))
    left = (width - cols * step_x) / 2
    top = 43
    art = Image.new("RGBA", (width, height))
    art.paste(underlay.resize((round(cols * step_x), round(rows * step_y)), Image.Resampling.BICUBIC),
              (round(left), top))
    draw = ImageDraw.Draw(art)
    for y, cells in enumerate(pixels):
        for x, digit, color in cells:
            point = (left + (x + .5) * step_x, top + (y + .5) * step_y)
            line(draw, point, digit, size, color, anchor="mm")
    return art, left, top, step_x, step_y, size


def draw_portrait(image, draw, panel, t, accent):
    x0, y0, x1, y1 = panel
    art, left, top, step_x, step_y, size = portrait_layer(x1 - x0, y1 - y0)
    image.paste(art, (x0, y0), art)
    _, cols, rows, pixels = portrait_grid()
    # Each pass highlights a few rows so the face stays visible between scans.
    scan = (t * 8) % (rows + 7) - 3
    for y in range(max(0, int(scan) - 1), min(rows, int(scan) + 3)):
        strength = max(0, .25 * (1 - abs(y - scan) / 2))
        for x, digit, color in pixels[y]:
            glow = tuple(round(channel + (255 - channel) * strength) for channel in color)
            point = (x0 + left + (x + .5) * step_x, y0 + top + (y + .5) * step_y)
            line(draw, point, digit, size, glow, anchor="mm")

    frame_color = tint(PANEL, accent, .46)
    inner_left = round(x0 + left - 18)
    inner_right = round(x0 + left + cols * step_x + 18)
    for x, direction in ((inner_left, 1), (inner_right, -1)):
        draw.line([(x, y0 + 61), (x, y0 + 48), (x + 13 * direction, y0 + 48)], fill=frame_color)
        draw.line([(x, y1 - 23), (x, y1 - 10), (x + 13 * direction, y1 - 10)], fill=frame_color)

    side_color = tint(PANEL, accent, .22)
    for row in range(6):
        bits = format((row * 11 + 5) % 32, "05b")
        if row == int(t * 2) % 6:
            bits = format((row * 11 + int(t * 8)) % 32, "05b")
        y = y0 + 60 + row * (y1 - y0 - 82) / 6
        line(draw, (x0 + 18, y), bits, 10, side_color)
        line(draw, (x1 - 18, y), bits[::-1], 10, side_color, anchor="rt")


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

    if scene == 1:
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
    border = tint(EDGE, accent, .27)
    draw.rounded_rectangle((1, 1, width-2, height-2), 13, fill=tint(BG, accent, .025), outline=border, width=2)
    draw.line((2, 58, width-3, 58), fill=border)
    draw.rounded_rectangle((22, 16, 94, 43), 6, fill=tint(BG, accent, .18))
    line(draw, (58, 30), "VISHVA", 15, accent, True, anchor="mm", mono=False)
    line(draw, (109, 17), "Field Console", 27, WHITE, True, mono=False)
    line(draw, (width-23, 24), "Demo mode", 17, MUTED, anchor="rt", mono=False)
    x = 24 if mobile else 27
    text_size = 24 if mobile else 25
    line(draw, (x, 79), f"Session {index+1:02} / {len(SCENES):02}", 18, accent, True, mono=False)
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
        row_y = log_y + i * 33
        draw.rounded_rectangle((x, row_y-3, x+76, row_y+21), 5, fill=tint(BG, accent, .14))
        line(draw, (x+38, row_y+9), kind.upper(), 14, accent, True, anchor="mm", mono=False)
        line(draw, (x+92, row_y), message, 23, WHITE, mono=False)
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
    draw.rounded_rectangle(panel, 9, fill=tint(PANEL, accent, .06), outline=border)
    a, b, c, _ = panel
    draw.line((a+1, b+34, c-1, b+34), fill=border)
    line(draw, (a+12, b+9), label, 17, accent, True, mono=False)
    has_portrait = index == 0 or index == len(SCENES) - 1
    line(draw, (c-12, b+10), "BINARY" if has_portrait else "ASCII", 15, MUTED, anchor="rt", mono=False)
    if has_portrait:
        draw_portrait(im, draw, panel, t, accent)
    else:
        diagram(draw, panel, index, t, accent)
    base_y = height - 47
    draw.line((2, base_y, width-3, base_y), fill=border)
    line(draw, (x, base_y+15), "Loop playback", 16, MUTED, True, mono=False)
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
    palette = palette_board.quantize(colors=192)
    frames = [render(ms, mobile).quantize(palette=palette, dither=Image.Dither.NONE)
              for ms in range(0, TOTAL, FRAME_MS)]
    gif = OUTPUT / f"binary-console{suffix}.gif"
    frames[0].save(gif, save_all=True, append_images=frames[1:], duration=FRAME_MS,
                   loop=0, disposal=1, optimize=True)
    still = render(sum(s[0] for s in SCENES[:-1])+2640, mobile)
    still.save(OUTPUT / f"binary-console{suffix}-still.png", optimize=True)
    print(f"{gif.name}: {gif.stat().st_size:,} bytes, {len(frames)} source frames")


if __name__ == "__main__":
    for is_mobile in (False, True):
        export(is_mobile)
