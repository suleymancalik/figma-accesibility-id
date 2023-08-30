if (figma.editorType === "dev") {
  if (figma.mode === "inspect") {
    showUI();
    figma.on("selectionchange", (event) => {
      showUI();
    });
  } else if (figma.mode === "codegen") {
    figma.codegen.on("generate", (event) => {
      let {node} = event;
      let name = getNodeId(node);
      if (name != null) {
        return [{ title: "Accesibility Id", code: name, language: "PLAINTEXT" }]
      } else {
        return []
      }
    });
  }
} else if (figma.editorType === "figma") {
  showUI();
  figma.on("selectionchange", (event) => {
    showUI();
  });
}

function showUI() {
  let node = figma.currentPage.selection[0];
  let nodeId = getNodeId(node);

  if (nodeId != null) {
    let html = `\
    <script>
    function setNodeId() {
       const enteredId = document.getElementById('accesibilityId').value;
       parent.postMessage({ pluginMessage: enteredId }, '*')
    }
   </script>
    <form name="">\
        <label for="accesibilityId"> Please enter accesibility Id:</label>\
        <input type="text" value="${nodeId}" id="accesibilityId" name="accesibilityId">\
        <input type="button" onClick="return setNodeId()" value="Submit">  \
    </form>\
    `;
    figma.showUI(html);
  
    figma.ui.onmessage = (message) => {
      setNodeId(node, message);
    }
  } else {
    figma.showUI("Please select a component...");
  }

}


function getNodeId(node) {
  if (node != null) {
    return node.getSharedPluginData("accesibilityId", node.id);
  }
}

function setNodeId(node, nodeId) {
  node.setSharedPluginData("accesibilityId", node.id, nodeId);
}
