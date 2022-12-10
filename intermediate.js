function I_ParseBool(val) {
    if (val === true) {
        return "1";
    } else {
        return "0";
    }
}

function I_CommentParse(com, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement('comment');
    if (com.bookmark) {
        _var_el.setAttribute('bookmark', "1");
    }
    _var_el.textContent = com.content;
    dest_tree.appendChild(_var_el);
}

function I_ParamParse(param, dest_tree, xmlDoc) {
    let _param = xmlDoc.createElement('param');
    _param.setAttribute('id', param.id);
    _param.setAttribute('name', param.name);
    _param.textContent = param.value;
    dest_tree.appendChild(_param);
}

function I_ConditionParse(con, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement('condition');
    if (con.behavior) {
        _var_el.setAttribute('behavior', con.behavior);
    }
    if (con.disabled) {
        _var_el.setAttribute('disabled', "1");
    }
    _var_el.setAttribute('id', con.id);
    if (con.inverted) {
        _var_el.setAttribute('inverted', "1");
    }
    if (con.sid) {
        _var_el.setAttribute('sid', con.sid);
    }
    _var_el.setAttribute('type', con.type);
    for (const param of con.params) {
        I_ParamParse(param, _var_el, xmlDoc);
    }
    dest_tree.appendChild(_var_el);
}

function I_ActionParse(act, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement('action');
    if (act.disabled) {
        _var_el.setAttribute('disabled', "1");
    }
    if (act.behavior) {
        _var_el.setAttribute('behavior', act.behavior);
    }
    if (act.breakpoint) {
        _var_el.setAttribute('breakpoint', "1");
    }
    _var_el.setAttribute('id', act.id);
    _var_el.setAttribute('name', act.name);
    if (act.sid) {
        _var_el.setAttribute('sid', act.sid);
    }
    _var_el.setAttribute('type', act.type);
    act.params.forEach((param) => {
        I_ParamParse(param, _var_el, xmlDoc);
    });
    dest_tree.appendChild(_var_el);
}

function I_VariableParse(vr, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement('variable');
    _var_el.setAttribute('constant', I_ParseBool(vr.constant));
    if (vr.bookmark) {
        _var_el.setAttribute('bookmark', "1");
    }
    _var_el.setAttribute('name', vr.name);
    if (vr.sid) {
        _var_el.setAttribute('sid', vr.sid);
    }
    _var_el.setAttribute('static', I_ParseBool(vr.static));
    _var_el.setAttribute('type', vr.type);
    if (vr.value) {
        _var_el.textContent = vr.value;
    }
    dest_tree.appendChild(_var_el);
}

function I_EventParse(eve, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement('event');
    if (eve.bookmark) {
        _var_el.setAttribute('bookmark', "1");
    }
    if (eve.sid) {
        _var_el.setAttribute('sid', eve.sid);
    }
    _cond = xmlDoc.createElement('conditions');
    for (const cond of eve.conditions) {
        I_ConditionParse(cond, _cond, xmlDoc);
    }
    _var_el.appendChild(_cond);
    _act = xmlDoc.createElement('actions');
    for (const act of eve.actions) {
        I_ActionParse(act, _act, xmlDoc);
    }
    _var_el.appendChild(_act);
    let _subev = xmlDoc.createElement('sub-events');
    for (const block of eve.subevents) {
        if (block._type === "Variable") {
            I_VariableParse(block, _subev, xmlDoc);
        }
        if (block._type === "Event") {
            I_EventParse(block, _subev, xmlDoc);
        }
        if (block._type === "EventGroup") {
            I_EventGroupParse(block, _subev, xmlDoc);
        }
        if (block._type === "Comment") {
            I_CommentParse(block, _subev, xmlDoc);
        }
    };
    _var_el.appendChild(_subev);
    dest_tree.appendChild(_var_el);
}


function I_EventGroupParse(grp, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement("event-group");
    _var_el.setAttribute("description", grp.description);
    if (grp.disabled) {
        _var_el.setAttribute("disabled", "1");
    }
    if (grp.sid) {
        _var_el.setAttribute('sid', grp.sid);
    }
    _var_el.setAttribute('title', grp.title);
    let _subev = xmlDoc.createElement("sub-events");
    for (const block of grp.subevents) {
        if (block._type === "Variable") {
            I_VariableParse(block, _subev, xmlDoc);
        }
        if (block._type === "Event") {
            I_EventParse(block, _subev, xmlDoc);
        }
        if (block._type === "EventGroup") {
            I_EventGroupParse(block, _subev, xmlDoc);
        }
        if (block._type === "Comment") {
            I_CommentParse(block, _subev, xmlDoc);
        }
    }
    _var_el.appendChild(_subev);
    dest_tree.appendChild(_var_el);
}

function I_IncludeParse(include, dest_tree, xmlDoc) {
    let _var_el = xmlDoc.createElement("include");
    _var_el.textContent = include.sheetname;
    dest_tree.appendChild(_var_el);
}


function I_ParseEvents(events, dest_tree, xmlDoc) {
    for (const event of events) {
        if (event._type === "Variable") {
            I_VariableParse(event, dest_tree, xmlDoc);
        }
        if (event._type === "Comment") {
            I_CommentParse(event, dest_tree, xmlDoc);
        }
        if (event._type === "Condition") {
            I_ConditionParse(event, dest_tree, xmlDoc);
        }
        if (event._type === "Event") {
            I_EventParse(event, dest_tree, xmlDoc);
        }
        if (event._type === "EventGroup") {
            I_EventGroupParse(event, dest_tree, xmlDoc);
        }
        if (event._type === "Include") {
            I_IncludeParse(event, dest_tree, xmlDoc);
        }
    }
}


function IntermediateToXML(sheet) {
    let xmlDoc = document.implementation.createDocument(null, 'c2eventsheet', null);

    let _name = xmlDoc.createElement('name');
    _name.textContent = sheet.name;

    xmlDoc.documentElement.appendChild(_name);

    let _events = xmlDoc.createElement('events');

    I_ParseEvents(sheet.events, _events, xmlDoc);

    xmlDoc.documentElement.appendChild(_events);
    

    let s = new XMLSerializer();
    let docStr = s.serializeToString(xmlDoc); 

    docStr = vkbeautify.xml(docStr);
    

    return docStr;
}
