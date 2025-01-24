import os
from pathlib import Path
import shutil

def ensure_directory(path):
    """Create directory if it doesn't exist."""
    Path(path).mkdir(parents=True, exist_ok=True)

def build_website():
    # Setup paths
    web_root = Path(__file__).parent.parent
    dist_dir = web_root / 'dist'
    interactive_plots_dir = web_root.parent / 'interactive_plots'

    # Create fresh dist directory
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    ensure_directory(dist_dir)

    # Copy interactive plots
    plots_dist = dist_dir / 'plots'
    ensure_directory(plots_dist)
    for plot in interactive_plots_dir.glob('F*.html'):
        shutil.copy2(plot, plots_dist)

    # Copy and process main HTML
    with open(web_root / 'src/components/paper.html', 'r') as f:
        template = f.read()

    # Copy CSS
    shutil.copy2(web_root / 'src/styles/main.css', dist_dir)

    # Write final HTML
    with open(dist_dir / 'index.html', 'w') as f:
        f.write(template)

if __name__ == '__main__':
    build_website()
