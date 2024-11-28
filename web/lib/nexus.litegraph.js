LiteGraph.use_uuids = true
LiteGraph.uuidv4 = function() { return Date.now() }

LGraph.prototype.getGroupByUUID = function (uuid) {
    let groups = this._groups
    let group = null
    for (let index = 0; index < groups.length; index++) {
        let tgroup = groups[index];
        if (tgroup.uuid && tgroup.uuid == uuid) {
            group = tgroup
            break
        }
    }
    return group
}

LGraph.prototype.getGroupIndexByUUID = function (uuid) {
    let groups = this._groups
    let at = -1
    for (let index = 0; index < groups.length; index++) {
        let tgroup = groups[index];
        if (tgroup.uuid && tgroup.uuid == uuid) {
            at = index
            break
        }
    }
    return at
}


LGraph.prototype.add = function (node, skip_compute_order) {

    if (!node) {
        return;
    }

    //groups
    if (node.constructor === LGraphGroup) {
        this._groups.push(node);
        this.setDirtyCanvas(true);
        this.change();
        if(!node.uuid) {
            node.uuid = LiteGraph.uuidv4()
        }
        node.graph = this;
        this._version++;
        if (this.onGroupAdded)
            this.onGroupAdded(node)
        return;
    }

    //nodes
    if (node.id != -1 && this._nodes_by_id[node.id] != null) {
        console.warn(
            "Nexus LiteGraph: there is already a node with this ID, will reuse it"
        );
        if (LiteGraph.use_uuids) {
            node.id = LiteGraph.uuidv4()
        }
        else {
            node.id = ++this.last_node_id;
        }
    }

    if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
        throw "LiteGraph: max number of nodes in a graph reached";
    }

    //give him an id
    if (LiteGraph.use_uuids) {
        if (node.id == null || node.id == -1)
            node.id = LiteGraph.uuidv4();

        let uuid = localStorage.getItem('nexus-socket-uuid');
        if (uuid) {
            node.properties.owner = uuid
        }
        this.last_node_id = node.id;
    }
    else {
        if (node.id == null || node.id == -1) {
            node.id = ++this.last_node_id;
        } else if (this.last_node_id < node.id) {
            this.last_node_id = node.id;
        }
    }

    node.graph = this;
    this._version++;

    this._nodes.push(node);
    this._nodes_by_id[node.id] = node;

    if (node.onAdded) {
        node.onAdded(this);
    }

    if (this.config.align_to_grid) {
        node.alignToGrid();
    }

    if (!skip_compute_order) {
        this.updateExecutionOrder();
    }

    if (this.onNodeAdded) {
        this.onNodeAdded(node);
    }

    this.setDirtyCanvas(true);
    this.change();

    return node; //to chain actions
};

LGraph.prototype.addNexus = function (node, skip_compute_order) {

    if (!node) {
        return;
    }

    //groups
    if (node.constructor === LGraphGroup) {
        this._groups.push(node);
        this.setDirtyCanvas(true);
        this.change();
        // node.id = LiteGraph.uuidv4();
        node.graph = this;
        this._version++;
        return;
    }

    // //nodes
    // if (node.id != -1 && this._nodes_by_id[node.id] != null) {
    //     console.warn(
    //         "Nexus LiteGraph: there is already a node with this ID, will reuse it"
    //     );
    //     if (LiteGraph.use_uuids) {
    //         node.id = LiteGraph.uuidv4();
    //     }
    //     else {
    //         node.id = ++this.last_node_id;
    //     }
    // }

    if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
        throw "LiteGraph: max number of nodes in a graph reached";
    }

    //give him an id
    // if (LiteGraph.use_uuids) {
    // if (node.id == null || node.id == -1)
    // let uuid = localStorage.getItem('nexus-socket-uuid');
    // if (uuid) {
    //     node.properties.owner = uuid
    // }
    // node.id = LiteGraph.uuidv4();
    // }
    // else {
    //     if (node.id == null || node.id == -1) {
    //         node.id = ++this.last_node_id;
    //     } else if (this.last_node_id < node.id) {
    this.last_node_id = node.id;
    //     }
    // }

    node.graph = this;
    this._version++;

    this._nodes.push(node);
    this._nodes_by_id[node.id] = node;

    if (this.config.align_to_grid) {
        node.alignToGrid();
    }

    if (!skip_compute_order) {
        this.updateExecutionOrder();
    }

    if (this.onNodeAddedNexus) {
        this.onNodeAddedNexus(node);
    }

    this.setDirtyCanvas(true);
    this.change();

    return node; //to chain actions
};

LGraph.prototype.remove = function (node) {
    if (node.constructor === LiteGraph.LGraphGroup) {
        var index = this._groups.indexOf(node);
        if (index != -1) {
            this._groups.splice(index, 1);
        }
        node.graph = null;
        this._version++;
        this.setDirtyCanvas(true, true);
        this.change();
        if (this.onGroupRemoved)
            this.onGroupRemoved(node)
        return;
    }

    if (this._nodes_by_id[node.id] == null) {
        return;
    } //not found

    if (node.ignore_remove) {
        return;
    } //cannot be removed

    this.beforeChange(); //sure? - almost sure is wrong

    //disconnect inputs
    if (node.inputs) {
        for (var i = 0; i < node.inputs.length; i++) {
            var slot = node.inputs[i];
            if (slot.link != null) {
                node.disconnectInput(i);
            }
        }
    }

    //disconnect outputs
    if (node.outputs) {
        for (var i = 0; i < node.outputs.length; i++) {
            var slot = node.outputs[i];
            if (slot.links != null && slot.links.length) {
                node.disconnectOutput(i);
            }
        }
    }

    //node.id = -1; //why?

    //callback
    if (node.onRemoved) {
        node.onRemoved();
    }

    node.graph = null;
    this._version++;

    //remove from canvas render
    if (this.list_of_graphcanvas) {
        for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
            var canvas = this.list_of_graphcanvas[i];
            if (canvas.selected_nodes[node.id]) {
                delete canvas.selected_nodes[node.id];
            }
            if (canvas.node_dragged == node) {
                canvas.node_dragged = null;
            }
        }
    }

    //remove from containers
    var pos = this._nodes.indexOf(node);
    if (pos != -1) {
        this._nodes.splice(pos, 1);
    }
    delete this._nodes_by_id[node.id];

    if (this.onNodeRemoved) {
        this.onNodeRemoved(node);
    }

    //close panels
    this.sendActionToCanvas("checkPanels");

    this.setDirtyCanvas(true, true);
    this.afterChange(); //sure? - almost sure is wrong
    this.change();

    this.updateExecutionOrder();
};

LGraph.prototype.removeNexus = function (node) {

    if (node.constructor === LiteGraph.LGraphGroup) {
        var index = this._groups.indexOf(node);
        if (index != -1) {
            this._groups.splice(index, 1);
        }
        node.graph = null;
        this._version++;
        this.setDirtyCanvas(true, true);
        this.change();
        return;
    }

    if (this._nodes_by_id[node.id] == null) {
        return;
    } //not found

    if (node.ignore_remove) {
        return;
    } //cannot be removed

    this.beforeChange(); //sure? - almost sure is wrong

    //disconnect inputs
    if (node.inputs) {
        for (var i = 0; i < node.inputs.length; i++) {
            var slot = node.inputs[i];
            if (slot.link != null) {
                node.disconnectInput(i);
            }
        }
    }

    //disconnect outputs
    if (node.outputs) {
        for (var i = 0; i < node.outputs.length; i++) {
            var slot = node.outputs[i];
            if (slot.links != null && slot.links.length) {
                node.disconnectOutput(i);
            }
        }
    }

    //node.id = -1; //why?

    //callback
    if (node.onRemoved) {
        node.onRemoved();
    }

    node.graph = null;
    this._version++;

    //remove from canvas render
    if (this.list_of_graphcanvas) {
        for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
            var canvas = this.list_of_graphcanvas[i];
            if (canvas.selected_nodes[node.id]) {
                delete canvas.selected_nodes[node.id];
            }
            if (canvas.node_dragged == node) {
                canvas.node_dragged = null;
            }
        }
    }

    //remove from containers
    var pos = this._nodes.indexOf(node);
    if (pos != -1) {
        this._nodes.splice(pos, 1);
    }
    delete this._nodes_by_id[node.id];

    //close panels
    this.sendActionToCanvas("checkPanels");

    this.setDirtyCanvas(true, true);
    this.afterChange(); //sure? - almost sure is wrong
    this.change();

    this.updateExecutionOrder();
};

LGraphNode.prototype.configureNexus = function (info) {
    if (this.graph) {
        this.graph._version++;
    }
    for (var j in info) {
        if (j == "properties") {
            //i don't want to clone properties, I want to reuse the old container
            for (var k in info.properties) {
                this.properties[k] = info.properties[k];
            }
            continue;
        }

        if (info[j] == null) {
            continue;
        } else if (typeof info[j] == "object") {
            //object
            if (this[j] && this[j].configure) {
                this[j].configure(info[j]);
            } else {
                this[j] = LiteGraph.cloneObject(info[j], this[j]);
            }
        } //value
        else {
            this[j] = info[j];
        }
    }

    if (!info.title) {
        this.title = this.constructor.title;
    }

    if (this.inputs) {
        for (var i = 0; i < this.inputs.length; ++i) {
            var input = this.inputs[i];
            if (this.onInputAdded)
                this.onInputAdded(input);
        }
    }

    if (this.outputs) {
        for (var i = 0; i < this.outputs.length; ++i) {
            var output = this.outputs[i];
            if (!output.links) {
                continue;
            }
            if (this.onOutputAdded)
                this.onOutputAdded(output);
        }
    }

    if (this.widgets) {
        for (var i = 0; i < this.widgets.length; ++i) {
            var w = this.widgets[i];
            if (!w)
                continue;
            if (w.options && w.options.property && (this.properties[w.options.property] != undefined))
                w.value = JSON.parse(JSON.stringify(this.properties[w.options.property]));
        }
        if (info.widgets_values) {
            for (var i = 0; i < info.widgets_values.length; ++i) {
                if (this.widgets[i]) {
                    this.widgets[i].value = info.widgets_values[i];
                }
            }
        }
    }

    if (this.onConfigure) {
        this.onConfigure(info);
    }
};

LGraphCanvas.prototype.selectNodesNexus = function (nodes, add_to_current_selection) {
    if (!add_to_current_selection) {
        this.deselectAllNodes();
    }

    nodes = nodes || this.graph._nodes;
    if (typeof nodes == "string") nodes = [nodes];
    for (var i in nodes) {
        var node = nodes[i];
        if (node.is_selected) {
            this.deselectNode(node);
            continue;
        }

        if (!node.is_selected && node.onSelected) {
            node.onSelected();
        }
        node.is_selected = true;
        this.selected_nodes[node.id] = node;

        if (node.inputs) {
            for (var j = 0; j < node.inputs.length; ++j) {
                this.highlighted_links[node.inputs[j].link] = true;
            }
        }
        if (node.outputs) {
            for (var j = 0; j < node.outputs.length; ++j) {
                var out = node.outputs[j];
                if (out.links) {
                    for (var k = 0; k < out.links.length; ++k) {
                        this.highlighted_links[out.links[k]] = true;
                    }
                }
            }
        }
    }

    this.setDirty(true);
};

LGraphCanvas.prototype.deselectNodeNexus = function(node) {

    if (!node.is_selected) {
        return;
    }

    if (node.onDeselected) {
        node.onDeselected();
    }

    node.is_selected = false;

    //remove highlighted
    if (node.inputs) {
        for (var i = 0; i < node.inputs.length; ++i) {
            delete this.highlighted_links[node.inputs[i].link];
        }
    }
    if (node.outputs) {
        for (var i = 0; i < node.outputs.length; ++i) {
            var out = node.outputs[i];
            if (out.links) {
                for (var j = 0; j < out.links.length; ++j) {
                    delete this.highlighted_links[out.links[j]];
                }
            }
        }
    }
};

LGraphGroup.prototype.move = function (deltax, deltay, ignore_nodes) {
    this._pos[0] += deltax;
    this._pos[1] += deltay;
    if (ignore_nodes) {
        return;
    }
    for (var i = 0; i < this._nodes.length; ++i) {
        var node = this._nodes[i];
        node.pos[0] += deltax;
        node.pos[1] += deltay;
        if (this.onGroupNodeMoved)
            this.onGroupNodeMoved(node)
    }
    if (this.onGroupMoved)
        this.onGroupMoved(this)
};

LGraphGroup.prototype.configure = function (o) {
    this.title = o.title;
    this.owner = o.owner;
    this.uuid = o.uuid;
    this._bounding.set(o.bounding);
    this.color = o.color;
    if (o.font_size) {
        this.font_size = o.font_size;
    }
};

LGraphGroup.prototype.serialize = function () {
    var b = this._bounding;
    return {
        title: this.title,
        bounding: [
            Math.round(b[0]),
            Math.round(b[1]),
            Math.round(b[2]),
            Math.round(b[3])
        ],
        uuid: this.uuid,
        color: this.color,
        font_size: this.font_size
    };
};

LGraph.prototype.addNode = function (nodeData) {
    let node = LiteGraph.createNode(nodeData.type, nodeData.title);
    if (!node) {
        console.warn("Node type not found: " + nodeData.type);
        return false;
    }
    node.id = nodeData.id;
    node.configureNexus(nodeData);
    this.addNexus(node);
    return true;
};

LGraph.prototype.removeNode = function (data) {
    let node = this.getNodeById(data.id);
    if (!node) {
        console.warn("Node ID not found: " + data);
        return false;
    }
    this.removeNexus(node);
    return true;
};

LGraph.prototype.addLink = function (linkData) {
    let link = new LiteGraph.LLink();
    link.configure(linkData);
    this.links[link.id] = link;
    return;
};

LGraph.prototype.addGroup = function (data) {
    var group = new LiteGraph.LGraphGroup();
    group.configure(data);
    this._groups.push(group);
    this.setDirtyCanvas(true);
    this.change();
    group.graph = this;
    this._version++;
    if (this.onGroupAdded)
        this.onGroupAdded(group)
    return;
};

LGraph.prototype.removeGroup = function (group) {
    let existingGroupIndex = this.getGroupIndexByUUID(group.uuid);
    if (existingGroupIndex != -1) {
        this._groups.splice(existingGroupIndex, 1);
    }
    group.graph = null;
    this._version++;
    this.setDirtyCanvas(true, true);
    this.change();
    return;
};

LGraph.prototype.updateNode = function (nodeData, type = "all") {
    let existingNode = this.getNodeById(nodeData.id);
    if (existingNode) {
        if (type == "all") {
            existingNode.configureNexus(nodeData);
        } else if (type == "widgets") {
            if (existingNode.widgets) {
                for (var i = 0; i < existingNode.widgets.length; ++i) {
                    var w = existingNode.widgets[i];
                    if (!w)
                        continue;
                    if (w.options && w.options.property && (existingNode.properties[w.options.property] != undefined))
                        w.value = JSON.parse(JSON.stringify(existingNode.properties[w.options.property]));
                }
                if (nodeData.widgets_values) {
                    for (var i = 0; i < nodeData.widgets_values.length; ++i) {
                        if (existingNode.widgets[i]) {
                            existingNode.widgets[i].value = nodeData.widgets_values[i];
                        }
                    }
                }
            }
        }
    } else {
        this.addNode(nodeData);
    }
};

LGraph.prototype.updateLink = function (linkData) {

    if (linkData) {

        let id

        if (linkData instanceof Object) {
            id = linkData.id
        } else {
            id = linkData[0]
        }

        let existingLink = this.links[id];
        if (existingLink) {
            existingLink.configure(linkData);
        } else {
            this.addLink(linkData);
        }

    }

};

LGraph.prototype.updateLinkManual = function (change, linkData, node, graph) {
    if (change == "add") {
        this.updateLink(linkData)
    } else if (change == "remove") {
        let existingLink = this.links[linkData[0]];
        if (existingLink) {
            this.removeLink(linkData[0])
            delete this.links[linkData[0]]
        }
    }
    if (node) {
        this.updateNode(node)
    }
    graph.updateExecutionOrder();
    graph._version++;
    graph.setDirtyCanvas(true, true);
};

LGraph.prototype.updateGroup = function (groupData) {
    let existingGroup = this.getGroupByUUID(groupData.uuid);
    if (existingGroup) {
        existingGroup.configure(groupData);
    } else {
        this.addGroup(groupData);
    }
};

LGraph.prototype.updateNodes = function (newNodes) {
    newNodes.forEach(nodeData => this.updateNode(nodeData));
};

LGraph.prototype.updateLinks = function (newLinks) {
    newLinks.forEach(linkData => this.updateLink(linkData));
};

LGraph.prototype.updateGroups = function (newGroups) {
    newGroups.forEach(groupData => this.updateGroup(groupData));
};