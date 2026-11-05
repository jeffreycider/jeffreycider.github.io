"""Append the reassurance menu without re-encoding any existing animation frame.
Run render.cjs first. The input is pinned so rerunning cannot append twice.
"""
from pathlib import Path
import json,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[2]
REL='v36/qwilfish/kernel-polynomial.mp4'
BASE='f4902ad363907d9ef9c9248a87b92d04e3a2c3d8'
def run(*args):subprocess.run(args,check=True)
with tempfile.TemporaryDirectory(prefix='qwilfish-ending-') as tmp:
 p=Path(tmp);src=p/'original.mp4'
 src.write_bytes(subprocess.check_output(['git','show',f'{BASE}:{REL}'],cwd=ROOT))
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',str(src)]))['streams'][0]
 count=int(info['nb_frames'])
 run('ffmpeg','-v','error','-y','-i',str(src),'-vf',f'select=eq(n\\,{count-1})','-frames:v','1',str(p/'last.png'))
 run('ffmpeg','-v','error','-y','-loop','1','-framerate','60','-i',str(p/'last.png'),'-i','/tmp/qwilfish-slide3-ending-menu.png','-filter_complex','[0:v][1:v]overlay=16:984,format=yuv420p','-filter_complex_threads','1','-t','2.5','-an','-c:v','libx264','-profile:v','high','-level:v','4.2','-crf','17','-preset','fast','-threads','2','-video_track_timescale','15360',str(p/'ending.mp4'))
 (p/'concat.txt').write_text(f"file '{src}'\nfile '{p/'ending.mp4'}'\n")
 run('ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(p/'concat.txt'),'-c','copy','-movflags','+faststart',str(ROOT/REL))
 def digest(path):return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-frames:v',str(count),'-f','hash','-hash','sha256','-'])
 assert digest(src)==digest(ROOT/REL),'Existing animation frames changed'
 print(f'Preserved all {count} original frames; appended 150 menu frames.')
