
function toggleDarkMode () {
    const root = document.documentElement;
    const theme = document.getElementById('theme-toggle');
    const isDark = root.getAttribute('data-theme') === 'dark'
    const newTheme = isDark? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);
    theme.classList.toggle('is-dark', newTheme === 'dark');
    theme.setAttribute('aria-pressed', newTheme === 'dark');
    theme.setAttribute('aria-label', newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

}

document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
