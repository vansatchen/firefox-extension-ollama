# firefox-extension-ollama
Based on [Ollama Translation by shada](https://addons.mozilla.org/en-US/firefox/addon/ollama-translation/)

To allow response from ollama-server, add 
```
Environment="OLLAMA_ORIGINS=moz-extension://*"
```
to ollama.service
