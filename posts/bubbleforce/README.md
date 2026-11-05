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

- Favicon: [Colorful Bubble Floating Against Black Background](https://www.creativefabrica.com/prod/colorful-bubble-floating-against-black-background-cartoons-b3T8UGega/) from Creative Fabrica, selected by the author. Source image: `assets/favicon-pink-cyan-source.jpg`. The original artwork is unchanged; `favicon.svg` clips away the preview checkerboard outside the bubble and tightly frames it. `favicon.png` is the 64px fallback. The source page lists a royalty-free worldwide commercial license; third-party artwork retains its applicable rights.
