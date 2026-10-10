# Dorowu OS & AI Assistant — Privacy Policy

**Effective Date:** October 10, 2026  
**Last Updated:** October 10, 2026  
**Commitment:** Zero Operating System Telemetry, Complete User Data Ownership

Privacy is a fundamental human right. **Dorowu OS** and the **Dorowu OS AI Assistant** are designed from the ground up to respect your privacy, ensure complete data autonomy, and avoid intrusive data collection.

This Privacy Policy explains what information is processed, how it is handled, and how your data is protected when using Dorowu OS and the integrated AI Assistant.

---

## 1. Operating System Privacy: Zero Default Telemetry

1. **No System Telemetry:** Dorowu OS does **not** install hidden telemetry daemons, tracking spyware, activity monitors, keystroke loggers, or background analytics beacons.
2. **Local Processing:** Standard operating system tasks, desktop configurations, file management, and terminal workflows execute strictly on your local machine.
3. **No Advertising Identifiers:** Dorowu OS contains no targeted advertising frameworks or monetization trackers.

---

## 2. Information Handled by the AI Assistant

When you use the Dorowu OS AI Assistant desktop application, data is handled as follows:

### A. Chat Conversations & Prompts
- **What is processed:** The questions, code snippets, or system diagnostic messages you send to the AI Assistant.
- **Purpose:** Exclusively to generate conversational responses, provide Linux administration instructions, and assist with computing tasks.
- **Ephemeral Processing:** Chat queries sent to the backend AI API are processed ephemerally to generate replies. The Dorowu OS project does **not** sell, rent, or trade your chat history to advertisers or third-party data brokers.

### B. Local Session Storage
- **Browser & Desktop LocalStorage:** Your chat sessions and UI theme preferences (Black, White, or Monochrome B&W) are stored directly inside your browser / desktop application's local storage (`localStorage`).
- **User Control:** You can delete individual chat sessions or purge all local chat history at any time using the trash icon or by clearing application data.

### C. System Diagnostics
- If you request troubleshooting assistance (such as analyzing a `systemctl status` log or package error), only the text you explicitly provide in the chat input is processed. The AI Assistant does not scan your personal home directory or read private files without your explicit action.

---

## 3. Third-Party Service Providers

To provide AI intelligence, the backend interacts with Google Gemini APIs:
1. **API Requests:** Requests forwarded to the AI API contain only the text prompt and immediate conversation context needed for the turn.
2. **Compliance:** Usage complies with standard cloud API privacy and security standards. Data transmitted over the network is encrypted in transit using industry-standard TLS / HTTPS encryption.
3. **No Credential Sharing:** Your local Linux system passwords, SSH keys, GPG keys, and disk encryption passphrases are never collected or transmitted.

---

## 4. Package Management & Network Requests

When you update packages or browse the web in Dorowu OS:
1. **Arch Linux Mirrors:** `pacman` and `paru`/AUR helpers communicate directly with official Arch Linux mirrors and Arch User Repository servers to download package tarballs and signatures.
2. **Network Transparency:** All network activity is visible to you through standard Linux utilities such as `ss`, `netstat`, `nethogs`, and `wireshark`.

---

## 5. Security & Data Protection

- **Encrypted Transmission:** All communications with the AI Assistant backend occur over HTTPS (TLS encryption).
- **No Unsolicited Background Access:** The AI Assistant operates only when opened and invoked by you.
- **Installer Security:** Calamares enforces individual user account passwords and root segregation during system installation.

---

## 6. Your Rights & Data Retention

- **Access and Portability:** You have full access to your session history within the application interface.
- **Deletion:** Clicking the Delete button on any chat session permanently removes it from your device's local storage.
- **Offline Capability:** If you choose not to use the AI Assistant, Dorowu OS functions completely offline as a standalone Arch Linux operating system.

---

## 7. Changes to this Privacy Policy

We may update this Privacy Policy from time to time as features expand. Any updates will be reflected in the official repository (`PRIVACY_POLICY.md`) and in the system documentation directory (`/usr/share/doc/dorowu-os/PRIVACY_POLICY.md`).

---

## 8. Contact Information

If you have questions, feedback, or concerns regarding privacy practices in Dorowu OS:
- **Repository:** https://github.com/SAMI23450/dorowu-os
- **Issue Tracker:** https://github.com/SAMI23450/dorowu-os/issues
- **Community Support:** Via the official GitHub project discussions and issue tracker.
