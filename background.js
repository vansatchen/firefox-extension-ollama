function showLoading() {
  browser.tabs.executeScript({
    code: `
      (function() {
        const loadingOverlay = document.createElement("div");
        loadingOverlay.style.position = "fixed";
        loadingOverlay.style.top = "50%";
        loadingOverlay.style.left = "50%";
        loadingOverlay.style.transform = "translate(-50%, -50%)";
        loadingOverlay.style.backgroundColor = "black";
        loadingOverlay.style.color = "white";
        loadingOverlay.style.border = "1px solid #ccc";
        loadingOverlay.style.padding = "20px";
        loadingOverlay.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        loadingOverlay.style.zIndex = "9999";

        const loadingText = document.createElement("p");
        loadingText.textContent = "Please wait a while...";
        loadingOverlay.appendChild(loadingText);

        document.body.appendChild(loadingOverlay);
      })();
    `
  });
}

function hideLoading() {
  browser.tabs.executeScript({
    code: `
      (function() {
        const loadingOverlay = document.querySelector("div[style*='position: fixed; top: 50%; left: 50%;']");
        if (loadingOverlay) {
          loadingOverlay.remove();
        }
      })();
    `
  });
}

function escapeStringForJSON(s) {
    var newstr = "";
    for (var i=0; i<s.length; i++) {
        c = s.charAt(i);
        switch (c) {
            case '\"':
                newstr+="\\\"";
                break;
            case '\\':
                newstr+="\\\\";
                break;
            case '/':
                newstr+="\\/";
                break;
            case '\b':
                newstr+="\\b";
                break;
            case '\f':
                newstr+="\\f";
                break;
            case '\n':
                newstr+="\\n";
                break;
            case '\r':
                newstr+="\\r";
                break;
            case '\t':
                newstr+="\\t";
                break;
            default:
                newstr+=c;
        }
   }
   return newstr;
}

async function sendMailEditRequest(text) {
  text = escapeStringForJSON(text);

  const promptTemplate = `{
    "model": "qwen2:7b-instruct-q8_0",
    "prompt": "Измени текст в письме на вежливый и деловой: {text}",
    "stream": false,
    "temperature": 0
  }`;
  const prompt = promptTemplate.replace("{text}", text);

  const response = await fetch("http://ollama.example.com:11434", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: prompt
  });

  hideLoading();

  const mailEditResult = await response.json();
  return mailEditResult;
}

async function sendTranslationRequest(text) {
  text = escapeStringForJSON(text);

  const promptTemplate = `{
    "model": "qwen2:7b-instruct-q8_0",
    "prompt": "Переведи текст на русский язык：{text}",
    "stream": false
  }`;
  const prompt = promptTemplate.replace("{text}", text);

  const response = await fetch("http://ollama.example.com:11434", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: prompt
  });

  hideLoading();

  var translationResult = await response.json();
  translationResult = JSON.parse(JSON.stringify(translationResult ));
  return translationResult;
}

function showTranslation(translationResult) {
  browser.tabs.executeScript({
    code: `
      (function() {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "50%";
        overlay.style.left = "50%";
        overlay.style.transform = "translate(-50%, -50%)";
        overlay.style.backgroundColor = "black";
        overlay.style.color = "white";
        overlay.style.border = "1px solid #ccc";
        overlay.style.padding = "20px";
        overlay.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        overlay.style.zIndex = "9999";

        const content = document.createElement("p");
        content.textContent = "${translationResult.replace(/\n/g, "\\n")}";
        overlay.appendChild(content);

        const closeButton = document.createElement("button");
        closeButton.textContent = "OK";
        closeButton.style.display = "block";
        closeButton.style.margin = "10px auto 0";
        closeButton.onclick = function() {
          overlay.remove();
        };
        overlay.appendChild(closeButton);

        document.body.appendChild(overlay);
      })();
    `
  });
}

browser.menus.create({
  icons: {
    16: "icons/mail-16.png",
    32: "icons/mail-32.png",
  },
  id: "mailEditor",
  title: "Business email style",
  contexts: ["selection"]
});

browser.menus.create({
  icons: {
    16: "icons/translate-16.png",
    32: "icons/translate-32.png",
  },
  id: "translater",
  title: "Translate to russian",
  contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    const selectedText = info.selectionText;
    showLoading();

  if (info.menuItemId === "translater") {
    sendTranslationRequest(selectedText).then(translationResult => {
      hideLoading();
      showTranslation(translationResult.response);
    });
  }

  if (info.menuItemId === "mailEditor") {
    sendMailEditRequest(selectedText).then(translationResult => {
      hideLoading();
      showTranslation(translationResult.response);
    });
  }
});
