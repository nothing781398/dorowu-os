# Dorowu OS Developer Environment Setup
export NPM_CONFIG_PREFIX="${HOME}/.npm-global"
export PATH="${HOME}/.npm-global/bin:${HOME}/.local/bin:${PATH}"

# PEP 668 Virtual Environment Helper
dorowu-venv() {
    local venv_name="${1:-.venv}"
    if [[ ! -d "${venv_name}" ]]; then
        echo "[+] Creating Python virtual environment in ${venv_name}..."
        python -m venv "${venv_name}"
    fi
    echo "[+] Activating ${venv_name}..."
    # shellcheck source=/dev/null
    source "${venv_name}/bin/activate"
}
