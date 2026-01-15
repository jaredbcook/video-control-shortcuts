const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const BROWSERS = ['chrome', 'firefox', 'safari'];

async function build() {
    console.log('Building for:', BROWSERS.join(', '));

    // Clean dist directory
    await fs.remove(DIST_DIR);
    await fs.ensureDir(DIST_DIR);

    for (const browser of BROWSERS) {
        const browserDist = path.join(DIST_DIR, browser);
        await fs.ensureDir(browserDist);

        console.log(`[${browser}] Copying files...`);
        await fs.copy(SRC_DIR, browserDist);

        // Firefox specific adjustments
        if (browser === 'firefox') {
            await adjustManifestForFirefox(browserDist);
        }
    }

    console.log('Build complete!');
}

async function adjustManifestForFirefox(distPath) {
    const manifestPath = path.join(distPath, 'manifest.json');
    const manifest = await fs.readJson(manifestPath);

    // Firefox requires specific ID for some APIs to work or for signing
    // We can add it here if the user provides one, or just ensure compatibility
    // For now, we'll just ensure background service workers are compatible if we had them
    // (Manifest V3 is supported in Firefox)

    // Example: Add browser_specific_settings if needed
    // manifest.browser_specific_settings = {
    //     gecko: {
    //         id: "addon@example.com",
    //         strict_min_version: "109.0"
    //     }
    // };

    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    console.log('[firefox] Manifest adjusted');
}

build().catch(console.error);
