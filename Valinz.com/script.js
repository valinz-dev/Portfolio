const terminalBody = document.getElementById("terminal-body");
const inputLine = document.getElementById("input-line");

const commands = {
    "!welcome": `Welcome to my website!

Valinz Anders — Legal IT Professional, Cybersecurity Student, Ethical Hacking hobbyist, Grease-Monkey.

Here you can find my scripts and projects, my CV/Credentials, customer PCs, and hobby jobs like my custom — personally built — 446whp FOST!

Use !about, !cv, !fost, or !portfolio to explore sections.`,
    "!about": "Navigating to About Me section...\n(Placeholder)",
    "!cv": "Navigating to CV section...\n(Placeholder)",
    "!fost": "Navigating to Focus ST Build section...\n(Placeholder)",
    "!portfolio": "Navigating to Projects section...\n(Placeholder)"
};

function appendLine(text) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    terminalBody.insertBefore(line, inputLine.parentElement);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

inputLine.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const cmd = inputLine.textContent.trim();
        if (commands[cmd]) {
            appendLine(`~/valinz.com$ ${cmd}`);
            appendLine(commands[cmd]);
            
            // Scroll to section if exists
            if (cmd === "!about") window.location.href = "#about";
            if (cmd === "!cv") window.location.href = "#cv";
            if (cmd === "!fost") window.location.href = "#focus";
            if (cmd === "!portfolio") window.location.href = "#projects";
        } else {
            appendLine(`~/valinz.com$ ${cmd}`);
            appendLine(`Command not recognized: ${cmd}`);
        }
        inputLine.textContent = "";
    }
});
