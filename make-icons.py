"""Create the typographic PWA app icon, not a source-data asset."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).parent / 'dist'
font_path = Path('C:/Windows/Fonts/segoeuib.ttf')
for filename, size in [('icon-192.png', 192), ('icon-512.png', 512), ('icon-maskable.png', 512)]:
    scale = 3
    canvas = Image.new('RGB', (size*scale, size*scale), '#172432')
    draw = ImageDraw.Draw(canvas)
    margin = int(size*scale*.21)
    draw.rounded_rectangle((margin, margin, size*scale-margin, size*scale-margin), radius=int(size*scale*.12), fill='#ffcf30')
    font = ImageFont.truetype(str(font_path), int(size*scale*.45))
    box = draw.textbbox((0, 0), 'P', font=font)
    x = (size*scale-(box[2]-box[0]))/2-box[0]
    y = (size*scale-(box[3]-box[1]))/2-box[1]
    draw.text((x, y), 'P', font=font, fill='#172432')
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(root / filename)
