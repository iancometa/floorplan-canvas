import Konva from'konva'

export function drawCircle(options, radius={x:30,y:30}, fill='#F8E71C', stroke='#F8E71C', strokeWidth=1, opacity=1, xPos=(options.innerWidth / 2) - 15, yPos=(options.innerHeight / 2) - 15, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {
   
    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        radius: radius,
        draggable: true,
        id: "circle",
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const circ = new Konva.Ellipse({
        radius: radius,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: opacity,
        strokeScaleEnabled: false,
        name: "circ"
    })

    group.add(circ)
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
