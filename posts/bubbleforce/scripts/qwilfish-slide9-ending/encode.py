"""Append one annotated frame to the original pulsing clip; preserve its 144 frames.
First run scripts/qwilfish-equilibrium/render.cjs for the callout and pointer plates.
"""
from pathlib import Path
import json,subprocess,tempfile
root=Path(__file__).resolve().parents[2]
src=root/'v28/qwilfish/step-09.mp4'
out=root/'v73/qwilfish/step-09.mp4';out.parent.mkdir(parents=True,exist_ok=True)
plates=Path('/tmp/qwilfish-equilibrium')
def run(*args):subprocess.run(['ffmpeg','-v','error','-y',*args],check=True)
count=int(json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',str(src)]))['streams'][0]['nb_frames'])
with tempfile.TemporaryDirectory(prefix='qwilfish-pulse-end-') as tmp:
 p=Path(tmp)
 run('-i',str(src),'-vf',f'select=eq(n\\,{count-1})','-frames:v','1',str(p/'last.png'))
 run('-loop','1','-framerate','60','-i',str(p/'last.png'),'-i',str(plates/'pointer.png'),'-i',str(plates/'callout.png'),'-filter_complex_threads','1','-filter_complex','[0:v][1:v]overlay=0:0[a];[a][2:v]overlay=340:522,format=yuv420p','-frames:v','1','-an','-c:v','libx264','-profile:v','high','-level:v','4.2','-crf','17','-preset','fast','-threads','2','-video_track_timescale','15360',str(p/'ending.mp4'))
 (p/'concat.txt').write_text(f"file '{src}'\nfile '{p/'ending.mp4'}'\n")
 run('-f','concat','-safe','0','-i',str(p/'concat.txt'),'-c','copy','-movflags','+faststart',str(out))
 def digest(path):return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-frames:v',str(count),'-f','hash','-hash','sha256','-'])
 assert digest(src)==digest(out),'Original animation changed'
 run('-i',str(out),'-frames:v','1',str(out.with_name('step-09-poster.webp')))
 run('-i',str(out),'-vf',f'select=eq(n\\,{count})','-frames:v','1','/tmp/slide9-annotated.png')
 print(f'Preserved {count} original frames and appended one annotated frame.')
