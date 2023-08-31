const namespace = "accesibilityId";

if (figma.editorType === "dev") {
  if (figma.mode === "inspect") {
    showUI();
    figma.on("selectionchange", (event) => {
      showUI();
    });
  } else if (figma.mode === "codegen") {
    figma.codegen.on("generate", (event) => {
      let {node} = event;
      let name = getNodeIdHierarchy(node);
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
    let html = `
    <script>
    function setNodeId() {
       const enteredId = document.getElementById('accesibilityId').value;
       parent.postMessage({ pluginMessage: {"action": "setNodeId", "value": enteredId} }, '*')
    }
   </script>
    <form name="">
        <label for="accesibilityId"> Please enter accesibility Id:</label>
        <input type="text" value="${nodeId}" id="accesibilityId" name="accesibilityId">
        <input type="button" onClick="return setNodeId()" value="Submit"> 
    </form>
    <br>
    <br>
    --------------------------------<br>
    <b>All accessibility Ids</b><br>
    <br>
    <ul id="allIds"></ul>
    <script>
        onmessage = (event) => {
          let allNodeIds = event.data.pluginMessage;
          let list = document.getElementById("allIds");
          for (i = 0; i < allNodeIds.length; ++i) {
              let li = document.createElement('li');
              let key = allNodeIds[i].key;
              li.onclick = function () {
                parent.postMessage({ pluginMessage: {"action": "select", "value": key} }, '*')
              };
              li.innerText = allNodeIds[i].value;
              list.appendChild(li);
          }
        }
    </script>
    `;
    figma.showUI(html);

    let allNodeIds = getAllNodeIds();
    figma.ui.postMessage(allNodeIds);
  
    figma.ui.onmessage = (message) => {
      let action = message.action;
      let value = message.value;
      if (action == "setNodeId") {
        console.log("Set Id " + value);
        setNodeId(node, value);
      } else if (action == "select") {
        console.log("Go to " + value);
        figma.currentPage.findWidgetNodesByWidgetId
        const node = figma.currentPage.findAll(n => n.id === value);
        if (node != null) {
          figma.currentPage.selection = node;
        }
      }
    }
  } else {
    figma.showUI("Please select a component...");
  }

}


function getNodeId(node) {
  if (node != null) {
    return node.getSharedPluginData(namespace, node.id);
  }
}

function getAllNodeIds() {
  let keys = figma.root.getSharedPluginDataKeys(namespace);
  let nodeIds = [];
  for (let index = 0; index < keys.length; index++) {
    let key = keys[index];
    let nodeId = figma.root.getSharedPluginData(namespace, key);
    //console.log(key + " " + nodeId);
    nodeIds.push({"key":key, "value":nodeId});
  }
  return nodeIds;
}

function getNodeIdHierarchy(node) {
  if (node != null) {
    let name = node.name + " -> " + node.getSharedPluginData(namespace, node.id);
    if (node.children != null) {
      for (let index = 0; index < node.children.length; index++) {
        const child = node.children[index];
        let childId = child.getSharedPluginData(namespace, child.id);
        name += "\n\t" + child.name + " -> " + childId;
      }
    }
    return name;
  }
}

function setNodeId(node, nodeId) {
  node.setSharedPluginData(namespace, node.id, nodeId);
  figma.root.setSharedPluginData(namespace, node.id, nodeId);
  showUI();
}
