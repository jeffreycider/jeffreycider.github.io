# bubbleforce

Read-only publication of the bubbleforce manuscript by Jeffrey Cheng and Jack Zheng.

Open `index.html` through a static web server, for example:

```sh
python3 -m http.server 8000
```

Equations, videos, slide navigation, and root-locus visualizations run locally from the included assets. There is no editor, draft database connection, or write endpoint. This is a publication snapshot; editing the authoring site does not automatically change this repository.

Snapshot provenance is recorded in `publication.json`. The same publication is included in the author's personal website at `posts/bubbleforce/`.

## Private commit previews

The separate owner-private preview is hosted at
https://bubbleforce-commit-preview.jeff-s-cheng.chatgpt.site/.
Ask the agent to **preview `<commit SHA or branch>`**. It exports that exact
commit and deploys it to the preview Site; the personal website is unchanged.
`/_preview.json` records which commit is currently displayed. Only the owner
can open this preview, using the same ChatGPT account.

To prepare a snapshot without publishing:

```sh
python tools/export-preview.py COMMIT_OR_BRANCH /absolute/path/to/preview/dist
```

The export does not switch branches or copy uncommitted changes. Sites
publication uses a separate hosting checkout; no hosting credentials are kept
in this repository. The preview URL displays the latest deployed snapshot.

## Third-party materials

- MathJax is distributed under Apache-2.0; see `vendor/mathjax/LICENSE`.
- The Uranus photograph is credited to NASA/JPL-Caltech: https://science.nasa.gov/photojournal/uranus-as-seen-by-nasas-voyager-2/.
- R. J. Hall's gravitational perturbation diagram is used under CC BY-SA 3.0: https://commons.wikimedia.org/wiki/File:Gravitational_perturbation.svg. Attribution and the license link are also displayed beside the figure.
- Third-party imagery and fonts retain their applicable rights; the repository's software license does not supersede those rights.

- Qwilfish favicon: Pokémon HOME menu icon ([Bulbagarden reference](https://archives.bulbagarden.net/wiki/File:Menu_HOME_0211.png)), sourced directly from [Pokémon HOME](https://resource.pokemon-home.com/battledata/img/pokei128/icon0211_f00_s0.png). Pokémon artwork belongs to its respective rights holders. `favicon.svg` tightly frames the unmodified, rounder menu pose on a light badge with a dark border; `favicon.png` is its 64px raster fallback.
