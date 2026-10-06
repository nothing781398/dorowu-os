# Dorowu OS Shell Configuration
[[ $- != *i* ]] && return

# Load developer path and PEP 668 helper
if [[ -f /etc/profile.d/dorowu-dev.sh ]]; then
    # shellcheck source=/dev/null
    source /etc/profile.d/dorowu-dev.sh
fi

# Clean modern prompt
PS1='\[\033[01;36m\]dorowu\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Aliases
alias ls='ls --color=auto'
alias ll='ls -lah --color=auto'
alias grep='grep --color=auto'
alias cat='bat --paging=never 2>/dev/null || cat'
alias py='python'
alias ai='ai-assistant'

echo -e "\033[01;36mDorowu OS 2026.10\033[00m - Terminal Ready."
echo -e "Type \033[01;33mai-assistant --help\033[00m for AI terminal assistance."
