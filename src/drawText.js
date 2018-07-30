import Konva from'konva'

export function drawText(options, fill='#000000', stroke='#000000', strokeWidth=1, opacity=1, xPos=options.innerWidth / 2, yPos=options.innerHeight / 2, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        draggable: true,
        id: "text",
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const text = new Konva.Text({
        text: "Text",
        fontSize: options.tableFontSize,
        fontFamily: options.tableFontFamily,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        strokeScaleEnabled: false,
        opacity: opacity,
        name: "text"
    })

    group.add(text)
    group.on('click tap', options.transformSize)
    group.on('mouseup', options.dragElement)
    group.on('contextmenu', options.handleContextMenu)
    group.on('mouseleave', () => {
        const s = options.stage.getStage()
        s.setAttr('cursor', 'default')
    })

    options.layer.add(group)
    options.layer.draw()
    options.resetTableState()

    const layer = options.layer.getLayer()
    const obj = layer.toObject()
        if (options.addHistory !== "") {
            options.addHistory(obj)
        }

}
