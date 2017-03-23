function btoa(input) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var str = String(input);
    for (
        var block, charCode, idx = 0, map = chars, output = '';
        str.charAt(idx | 0) || (map = '=', idx % 1);
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
            //throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
    }
    return output;
}

function parseCSSAttributes(attributes) {
    var result = attributes.map(function (prop) {
        var parts = prop.split(': ')
        if (parts.length === 2) {
            var propname = parts[0]
            var propvalue = parts[1].replace(';', '')
        } else {
            var propname = "undefined"
            var propvalue = "undefined"
        }

        var propsObj = {}
        propsObj[propname] = propvalue;
        return propsObj
    })
    return result
}

function onRun(context) {
    var app = NSApplication.sharedApplication()
    var sketch = context.api()

    var document = context.document
    var pages = document.pages()

    var data = {
        fileId: String(document.publisherFileName()),
        styles: []
    }

    var textStyles = document.documentData().layerTextStyles().objects()
    var shapeStyles = document.documentData().layerStyles().objects()

    var mockShape = MSShapeGroup.alloc().init()
    for (var i = 0; i < shapeStyles.length; i++) {
        var sharedStyle = shapeStyles[i]
        mockShape.setStyle(sharedStyle.style())

        data.styles.push({
            id: String(sharedStyle.objectID()),
            name: String(sharedStyle.name()),
            type: 'box',
            properties: parseCSSAttributes(mockShape.CSSAttributes().slice(1))
        })
    }

    var mockText = MSTextLayer.alloc().init()
    mockText.stringValue = "mock"

    for (var i = 0; i < textStyles.length; i++) {
        var sharedStyle = textStyles[i]
        mockText.setStyle(sharedStyle.style())

        data.styles.push({
            id: String(sharedStyle.objectID()),
            name: String(sharedStyle.name()),
            type: 'text',
            properties: parseCSSAttributes(mockText.CSSAttributes().slice(1))
        })
    }

    if (!data.styles.length) {
        app.displayDialog_withTitle("It seems there are no shared styles defined yet.", "Whoops! Nothing to export!")
    } else {

        var str = JSON.stringify(data)
        var updateUrl = NSURL.URLWithString(@"finch://sketch?data=" + btoa(str))

        var workspace = NSWorkspace.sharedWorkspace()
        if (String(workspace.URLForApplicationToOpenURL(updateUrl)).indexOf('Finch') !== -1) {
            workspace.openURL(updateUrl)
        } else {
            app.displayDialog_withTitle("It seems that Finch app is not installed yet.", "Can't find Finch!")
        }

    }

}
