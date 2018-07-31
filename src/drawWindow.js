import Konva from'konva'

export function drawWindow(shapeParams, width=60, height=4, fill='#ffffff', stroke='#ffffff', strokeWidth=1, opacity=1, xPos=(shapeParams.innerWidth / 2) - 30, yPos=(shapeParams.innerHeight / 2) - 2, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        draggable: true,
        id: "window",
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const window = new Konva.Rect({
        width: width,
        height: height,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: opacity,
        strokeScaleEnabled: false,
        name: "rect"
    })

    group.add(window)
    group.on('click tap', shapeParams.transformSize)
    group.on('mouseup', shapeParams.dragElement)
    group.on('contextmenu', shapeParams.handleContextMenu)
    group.on('mouseleave', () => {
        shapeParams.stage.setAttr('cursor', 'default')
    })

    shapeParams.layer.add(group)
    shapeParams.layer.draw()

}
