import Konva from'konva'

export function drawRoundTable(options, xPos=(options.innerWidth / 2) - 15, yPos=(options.innerHeight / 2) - 15,  prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        radius: options.radius,
        draggable: true,
        id: "tableRound",
        guid: options.createdTableId,
        name: options.tableName,
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const circ = new Konva.Ellipse({
        radius: options.radius,
        fill: options.fill,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        opacity: options.opacity,
        strokeScaleEnabled: false,
        id: options.tableName,
        seats: options.tableSeats,
        name: "circ"
    })

    const text = new Konva.Text({
        text: options.tableName,
        fontSize: options.tableFontSize,
        fontFamily: options.tableFontFamily,
        fill: options.tableTextColor
    })

    text.setOffset({
        x: text.getWidth() / 2,
        y: text.getHeight() / 2
    })

    const gap = rotation * -1
    text.rotate(gap)

    
    group.add(circ, text)
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
