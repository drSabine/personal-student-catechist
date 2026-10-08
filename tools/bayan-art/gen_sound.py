"""Synthesizes the Build Our Bayan town loop and sound effects. Pure Python, writes WAV files.

The loop is a gentle chiptune in C major pentatonic over I-vi-IV-V, with birdsong.
Released under CC0 like the rest of the lesson's own art.
"""
import math, os, random, struct, sys, wave

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "lessons", "lesson-02", "sounds")
os.makedirs(OUT, exist_ok=True)
TAU = 2 * math.pi


def write(name, samples, rate, bits=16):
    peak = max(1e-9, max(abs(s) for s in samples))
    gain = 0.89 / peak
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(bits // 8)
        w.setframerate(rate)
        if bits == 8:
            w.writeframes(bytes(int(max(0, min(255, 128 + s * gain * 127))) for s in samples))
        else:
            w.writeframes(b"".join(struct.pack("<h", int(s * gain * 32767)) for s in samples))


def freq(note):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    n = names[note[0]]
    rest = note[1:]
    if rest.startswith("#"):
        n += 1
        rest = rest[1:]
    octave = int(rest)
    return 440.0 * 2 ** ((n + 12 * (octave + 1) - 69) / 12)


def square(phase, duty):
    return 1.0 if (phase % 1.0) < duty else -1.0


def triangle(phase):
    p = phase % 1.0
    return 4 * p - 1 if p < 0.5 else 3 - 4 * p


def env(t, length, attack=0.01, release=0.08):
    if t < attack:
        return t / attack
    if t > length - release:
        return max(0.0, (length - t) / release)
    return 1.0


# ---------------- town loop ----------------
def town_loop():
    rate = 16000
    bpm = 104
    eighth = 60 / bpm / 2
    bars = 8
    total = int(rate * eighth * 8 * bars)
    out = [0.0] * total

    def add_note(start_eighths, length_eighths, f, voice, vol):
        start = int(start_eighths * eighth * rate)
        length = length_eighths * eighth
        n = int(length * rate)
        for i in range(n):
            j = start + i
            if j >= total:
                break
            t = i / rate
            vib = 1 + 0.004 * math.sin(TAU * 5.5 * t) if voice == "lead" else 1
            ph = f * vib * t
            if voice == "lead":
                s = square(ph, 0.25) * env(t, length, 0.01, min(0.12, length / 2)) * math.exp(-t * 1.8)
            elif voice == "bass":
                s = triangle(ph) * env(t, length, 0.005, 0.05)
            elif voice == "arp":
                s = square(ph, 0.125) * env(t, length, 0.002, 0.04) * math.exp(-t * 6)
            out[j] += s * vol

    melody = [
        ["E5", None, "G5", None, "A5", "G5", "E5", None],
        ["C5", None, "E5", None, "D5", "C5", "A4", None],
        ["A4", None, "C5", None, "D5", None, "C5", "A4"],
        ["G4", None, "A4", None, "D5", None, None, None],
        ["E5", None, "G5", None, "A5", None, "C6", None],
        ["A5", "G5", "E5", None, "D5", None, "E5", None],
        ["D5", None, "C5", None, "A4", None, "G4", None],
        ["C5", None, None, None, None, None, None, None],
    ]
    chords = [
        ["C3", "C4", "E4", "G4"], ["A2", "A3", "C4", "E4"], ["F2", "F3", "A3", "C4"], ["G2", "G3", "B3", "D4"],
        ["C3", "C4", "E4", "G4"], ["A2", "A3", "C4", "E4"], ["F2", "F3", "A3", "C4"], ["C3", "C4", "E4", "G4"],
    ]
    for b in range(bars):
        notes = melody[b]
        for i, note in enumerate(notes):
            if note is None:
                continue
            length = 1
            while i + length < 8 and notes[i + length] is None:
                length += 1
            # The last note stops before the loop point so the join is clean.
            if b == bars - 1:
                length = min(length, 4)
            add_note(b * 8 + i, length * 0.95, freq(note), "lead", 0.30)
        root, *triad = chords[b]
        if b == 6:
            add_note(b * 8, 3.8, freq("F2"), "bass", 0.45)
            add_note(b * 8 + 4, 3.8, freq("G2"), "bass", 0.45)
        else:
            add_note(b * 8, 3.8, freq(root), "bass", 0.45)
            add_note(b * 8 + 4, 3.8, freq(root) * (1.5 if b % 2 else 1), "bass", 0.40)
        for k in range(8):
            add_note(b * 8 + k, 0.9, freq(triad[k % 3]), "arp", 0.10)

    # Soft percussion: a low thump on 1 and 3, a hushed shaker on the off-beats.
    rnd = random.Random(3)
    for b in range(bars):
        for k in range(8):
            start = int((b * 8 + k) * eighth * rate)
            if k in (0, 4):
                for i in range(int(0.12 * rate)):
                    t = i / rate
                    out[start + i] += math.sin(TAU * (90 - 300 * t) * t) * math.exp(-t * 28) * 0.35
            if k % 2 == 1:
                for i in range(int(0.05 * rate)):
                    t = i / rate
                    out[start + i] += (rnd.random() * 2 - 1) * math.exp(-t * 70) * 0.06

    # Birdsong: little chirps scattered through the loop.
    for _ in range(14):
        at = rnd.uniform(0.2, total / rate - 1.0)
        base = rnd.uniform(2600, 3800)
        for c in range(rnd.randint(2, 4)):
            start = int((at + c * 0.11) * rate)
            n = int(0.07 * rate)
            phase = 0.0
            for i in range(n):
                t = i / rate
                f = base * (1 + 0.35 * math.sin(math.pi * t / 0.07))
                phase += f / rate
                if start + i < total:
                    out[start + i] += math.sin(TAU * phase) * math.sin(math.pi * t / 0.07) * 0.07

    # Gentle low-pass so the square waves are warm, not buzzy.
    a = 0.55
    y = 0.0
    for i in range(total):
        y += a * (out[i] - y)
        out[i] = y
    write("town-loop.wav", out, rate, bits=8)


# ---------------- effects ----------------
RATE = 22050


def tone_seq(steps, voice="square", duty=0.5, vol=1.0, decay=8.0):
    out = []
    for f, length in steps:
        n = int(length * RATE)
        for i in range(n):
            t = i / RATE
            ph = f * t
            s = square(ph, duty) if voice == "square" else triangle(ph) if voice == "triangle" else math.sin(TAU * ph)
            out.append(s * env(t, length, 0.004, 0.03) * math.exp(-t * decay) * vol)
    return out


def blip():
    write("blip.wav", tone_seq([(1046, 0.035)], "square", 0.25, decay=20), RATE)


def pop():
    out = []
    n = int(0.09 * RATE)
    phase = 0.0
    for i in range(n):
        t = i / RATE
        phase += (500 + 1400 * t / 0.09) / RATE
        out.append(math.sin(TAU * phase) * math.exp(-t * 30))
    write("pop.wav", out, RATE)


def wrong():
    write("wrong.wav", tone_seq([(392, 0.14), (311, 0.26)], "triangle", decay=4), RATE)


def sparkle():
    steps = [(freq(n), 0.07) for n in ["C6", "E6", "G6", "C7"]]
    write("sparkle.wav", tone_seq(steps, "square", 0.25, vol=0.6, decay=10), RATE)


def hammer():
    rnd = random.Random(5)
    out = []
    for k in range(3):
        n = int(0.16 * RATE)
        prev = 0.0
        for i in range(n):
            t = i / RATE
            noise = rnd.random() * 2 - 1
            prev += 0.35 * (noise - prev)
            knock = math.sin(TAU * (180 - 200 * t) * t) * math.exp(-t * 40)
            out.append((prev * 0.7 + knock) * math.exp(-t * 35))
        out.extend([0.0] * int(0.06 * RATE))
    write("hammer.wav", out, RATE)


def rise():
    rnd = random.Random(9)
    out = []
    n = int(0.9 * RATE)
    prev = 0.0
    phase = 0.0
    for i in range(n):
        t = i / RATE
        cut = 0.05 + 0.4 * (t / 0.9)
        prev += cut * ((rnd.random() * 2 - 1) - prev)
        phase += (220 + 440 * (t / 0.9)) / RATE
        shimmer = square(phase, 0.5) * 0.15
        out.append((prev + shimmer) * math.sin(math.pi * t / 0.9))
    write("rise.wav", out, RATE)


def cheer():
    rnd = random.Random(11)
    out = [0.0] * int(1.2 * RATE)
    for k in range(10):
        start = int(rnd.uniform(0, 0.8) * RATE)
        for i in range(int(0.04 * RATE)):
            t = i / RATE
            if start + i < len(out):
                out[start + i] += (rnd.random() * 2 - 1) * math.exp(-t * 90) * 0.6
    for j, n in enumerate(["G5", "C6", "E6", "G6"]):
        start = int(j * 0.09 * RATE)
        for i in range(int(0.3 * RATE)):
            t = i / RATE
            if start + i < len(out):
                out[start + i] += square(freq(n) * t, 0.25) * math.exp(-t * 7) * 0.35
    write("cheer.wav", out, RATE)


town_loop()
for make in (blip, pop, wrong, sparkle, hammer, rise, cheer):
    make()
