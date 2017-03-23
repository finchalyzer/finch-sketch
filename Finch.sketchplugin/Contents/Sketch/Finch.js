function btoa(input) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var str = String(input);
    for (
        var block, charCode, idx = 0, map = chars, output = '';
        str.charAt(idx | 0) || (map = '=', idx % 1);
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
        charCode = str.charCodeAt(idx += 3 / 4);
        block = block << 8 | charCode;
    }
    return output;
}

function parseCSSAttributes(attributes) {

   var result = {}

   attributes.forEach(function (property) {

      var parts = property.split(': ')
      if (parts.length !== 2) return

      var propName = parts[0].replace(/-.*/, function(a) { return a.charAt(1).toUpperCase() + a.slice(2) })
      var propValue = parts[1].replace(';', '')

      switch (propName) {
         case "background":
            propName = "backgroundColor"
         break
      }

      result[propName] = [{
         value: propValue,
         media: ""
      }]

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
            sketchId: String(sharedStyle.objectID()),
            title: String(sharedStyle.name()),
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
            sketchId: String(sharedStyle.objectID()),
            title: String(sharedStyle.name()),
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
