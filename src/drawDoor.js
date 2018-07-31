import Konva from'konva'

export function drawDoor(shapeParams, width=50, height=8, fill='#805716', stroke='#805716', strokeWidth=1, opacity=1, xPos=(shapeParams.innerWidth / 2) - 25, yPos=(shapeParams.innerHeight / 2) - 4, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        draggable: true,
        id: "door",
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const door = new Konva.Rect({
        width: width,
        height: height,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: opacity,
        strokeScaleEnabled: false,
        name: "rect"
    })

    const knob = new Konva.Circle({
        radius: 3,
        fill: '#ffffff',
        name: "circ",
        x: 45,
        y: 9
    })

    group.add(door, knob)
    group.on('click tap', shapeParams.transformSize)
    group.on('mouseup', shapeParams.dragElement)
    group.on('contextmenu', shapeParams.handleContextMenu)
    group.on('mouseleave', () => {
        shapeParams.stage.setAttr('cursor', 'default')
    })

    shapeParams.layer.add(group)
    shapeParams.layer.draw()

}
