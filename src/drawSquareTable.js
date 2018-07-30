import Konva from'konva'

export function drawSquareTable(options, xPos=(options.innerWidth / 2) - 30, yPos=(options.innerHeight / 2) - 30, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        width: options.width,
        height: options.height,
        draggable: true,
        id: "tableSquare",
        guid: options.createdTableId,
        name: options.tableName,
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const rect = new Konva.Rect({
        width: options.width,
        height: options.height,
        fill: options.fill,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        opacity: options.opacity,
        strokeScaleEnabled: false,
        id: options.tableName,
        seats: options.tableSeats,
        name: "rect"
    })

    const text = new Konva.Text({
        text: options.tableName,
        fontSize: options.tableFontSize,
        fontFamily: options.tableFontFamily,
        fill: options.tableTextColor,
        x: rect.getWidth() / 2,
        y: rect.getHeight() / 2
    })

    text.setOffset({
        x: text.getWidth() / 2,
        y: text.getHeight() / 2
    })
    const gap = rotation * -1
    text.rotate(gap)

    group.add(rect, text)
    group.on('click tap', options.transformSize)
    group.on('mouseup', options.dragElement)
    group.on('contextmenu', options.handleContextMenu)
    group.on('mouseleave', () => {
        options.stage.setAttr('cursor', 'default')
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
