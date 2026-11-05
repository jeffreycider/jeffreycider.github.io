"""Run render.cjs first; retain original artwork, timing and measured plot animation."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[2]
plates=Path('/tmp/qwilfish-equilibrium')
out=root/'v72/qwilfish'; out.mkdir(parents=True,exist_ok=True)
def run(args): subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],check=True)
codec=['-an','-c:v','libx264','-crf','17','-preset','fast','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart']
run(['-ss','1.6','-i',str(root/'v35/qwilfish/step-10.mp4'),'-i',str(plates/'pointer.png'),'-i',str(plates/'callout.png'),'-i',str(plates/'equilibrium-bottom.png'),'-filter_complex_threads','1','-filter_complex','[0:v][1:v]overlay=0:0[a];[a][2:v]overlay=1140:452[b];[b][3:v]overlay=16:990[v]','-map','[v]','-t','2.4',*codec,str(out/'equilibrium.mp4')])
run(['-i',str(root/'v36/qwilfish/step-11.mp4'),'-i',str(plates/'root-contact-bottom.png'),'-filter_complex_threads','1','-filter_complex','[0:v][1:v]overlay=16:990[v]','-map','[v]','-t','3.4',*codec,str(out/'root-contact.mp4')])
for name in ['equilibrium','root-contact']:
 run(['-i',str(out/f'{name}.mp4'),'-frames:v','1',str(out/f'{name}-poster.webp')])
