---
date: "2026-08-10"
tags: ["Security", "Cryptography", "Rust"]
---

Encrypting values with AES-256-GCM isn't enough if you don't bind the key name in the Authenticated Additional Data (AAD). Without AAD binding, an attacker with write access to the raw store could swap the ciphertext of `user_role: "admin"` into another user's slot. Binding the key name to the AAD ensures the payload will fail authentication if decrypted under any other key.
