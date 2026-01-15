// Default values
const DEFAULTS = {
    minSpeed: 0.25,
    maxSpeed: 4.0,
    speedStep: 0.25
};

// Saves options to chrome.storage
const saveOptions = () => {
    const minSpeed = parseFloat(document.getElementById('minSpeed').value);
    const maxSpeed = parseFloat(document.getElementById('maxSpeed').value);
    const speedStep = parseFloat(document.getElementById('speedStep').value);

    // Validation
    if (minSpeed >= maxSpeed) {
        showStatus('Error: Min speed must be less than Max speed.', true);
        return;
    }
    if (speedStep <= 0) {
        showStatus('Error: Step must be positive.', true);
        return;
    }

    chrome.storage.sync.set(
        { minSpeed, maxSpeed, speedStep },
        () => {
            showStatus('Options saved.');
        }
    );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        DEFAULTS,
        (items) => {
            document.getElementById('minSpeed').value = items.minSpeed;
            document.getElementById('maxSpeed').value = items.maxSpeed;
            document.getElementById('speedStep').value = items.speedStep;
        }
    );
};

const showStatus = (message, isError = false) => {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.color = isError ? '#ef4444' : '#22c55e';
    status.classList.add('visible');
    setTimeout(() => {
        status.classList.remove('visible');
    }, 2000);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveOptions();
});
