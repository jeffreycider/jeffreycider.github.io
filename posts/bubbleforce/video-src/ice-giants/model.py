"""Deterministic schematic Sun–Neptune trajectories; no historical astrometry."""
import json
from pathlib import Path
import numpy as np
from scipy.integrate import solve_ivp
ROOT=Path(__file__).parent
R=1.55
MASS=.05  # amplified for legibility; real Neptune/Sun is about 5.15e-5
PHASE=.65
TIMES=np.linspace(0,2.2,265)
def neptune(t):
    a=PHASE+t/R**1.5
    return R*np.array([np.cos(a),np.sin(a)])
def acceleration(t,x,mass):
    N=neptune(t); d=N-x
    return -x/np.linalg.norm(x)**3+mass*(d/np.linalg.norm(d)**3-N/R**3)
def trajectory(state,mass,rtol=1e-10):
    def ode(t,s): return np.r_[s[2:],acceleration(t,s[:2],mass)]
    sol=solve_ivp(ode,[0,TIMES[-1]],state,t_eval=TIMES,rtol=rtol,atol=rtol*.01)
    assert sol.success and sol.y.shape[1]==len(TIMES)
    return sol.y.T
initial=np.array([1.,0.,0.,1.])
truth=trajectory(initial,MASS)
base=trajectory(initial,0)
assert np.max(np.abs(base[:,:2]-np.c_[np.cos(TIMES),np.sin(TIMES)]))<1e-8
assert np.max(np.abs(truth-trajectory(initial,MASS,1e-12)))<1e-7
families=[]
for radius in np.linspace(.62,1.4,9):
 for angle in [-1.5,-.95,-.4,.15,.7]:
    state=np.array([radius*np.cos(angle),radius*np.sin(angle),-np.sin(angle)/np.sqrt(radius),np.cos(angle)/np.sqrt(radius)])
    families.append([trajectory(state,0)[:,:2],trajectory(state,MASS)[:,:2]])
def rounded(x):return np.round(x,6).tolist()
data=dict(time=rounded(TIMES),neptune=rounded(np.array([neptune(t) for t in TIMES])),truth=rounded(truth[:,:2]),base=rounded(base[:,:2]),families=[[rounded(a),rounded(b)] for a,b in families],mass=MASS,radius=R)
(ROOT/'paths.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
print('Verified circular no-Neptune solution and tolerance convergence; final separation',np.linalg.norm(truth[-1,:2]-base[-1,:2]))
