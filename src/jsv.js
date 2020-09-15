var JSV = (function () {
    var _containerId, _container, _states = {};

    return JSV;

    function JSV(id) {
        _containerId = id;
        _container = document.getElementById(id);
        return {
            context: mount(_container),
            template: template,
            state: state
        }
    }

    // ========================================================================

    function mount(element) {
        var context = {};

        m(element);

        return context;

        function m(el) {
            mountElement(el);
            if (el.children.length == 0) return;
            for (var i = 0; i < el.children.length; i++) {
                m(el.children[i]);
            }
        }

        function mountElement(element) {
            var attrs = element.attributes;
            if (!attrs) return;
            var idAttr = attrs['id'];
            if (idAttr) {
                if (context[idAttr.value])
                    throw new Error('duplicate HTML element id: ' + idAttr.value);
                context[idAttr.value] = element;
            }

            var templateAttr = attrs['template'];
            if (templateAttr) {
                var templateId = templateAttr.value;
                var createTemplate = template(templateId);
                element.appendChild(createTemplate());
            }
        }
    }


    // ========================================================================

    function template(id) {
        var template = document.getElementById(id);
        if (!template || template.tagName.toLowerCase() !== 'template')
            throw new Error('not a template: ' + id);
        template.parentElement.removeChild(template);

        return function t(binder) {
            var node = template.content.cloneNode(true);
            var context = mount(node);
            binder && binder(context);
            return node;

            function getElementById(element, id) {
                var idAttr = element.attributes['id'];
                if (idAttr && idAttr.value === id) return element;

                for (var i = 0; i < element.children.length; i++) {
                    var found = getElementById(element.children[i], id);
                    if (found) return found;
                }
            }
        }
    }

    // ========================================================================

    function state(name) {
        var state = _states[name] || (_states[name] = []);
        return {
            pub: function (value) { state.forEach(function (fn) { fn(value); }); },
            sub: function (fn) { state.push(fn); }
        }
    }
})();