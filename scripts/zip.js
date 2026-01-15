const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const RELEASES_DIR = path.join(ROOT_DIR, 'releases');

const BROWSERS = ['chrome', 'firefox', 'safari'];

async function zip() {
    await fs.remove(RELEASES_DIR);
    await fs.ensureDir(RELEASES_DIR);

    const manifest = await fs.readJson(path.join(ROOT_DIR, 'src', 'manifest.json'));
    const version = manifest.version;

    console.log(`Creating releases for v${version}...`);

    for (const browser of BROWSERS) {
        if (browser === 'safari') {
            console.log('[safari] Skipping zip for Safari (use Xcode to build)');
            continue;
        }

        const sourceDir = path.join(DIST_DIR, browser);
        if (!fs.existsSync(sourceDir)) {
            console.warn(`[${browser}] Build directory not found. Run 'npm run build' first.`);
            continue;
        }

        const zipName = `video-control-shortcuts-${browser}-v${version}.zip`;
        const output = fs.createWriteStream(path.join(RELEASES_DIR, zipName));
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function () {
            console.log(`[${browser}] Created ${zipName} (${archive.pointer()} bytes)`);
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        await archive.finalize();
    }
}

zip().catch(console.error);
