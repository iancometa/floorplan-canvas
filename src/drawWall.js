import Konva from'konva'

export function drawWall(shapeParams, width=10, height=80, fill='#c0c0c0', stroke='#c0c0c0', strokeWidth=1, opacity=1, xPos=(shapeParams.innerWidth / 2) - 5, yPos=(shapeParams.innerHeight / 2) - 40, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        draggable: true,
        id: "wall",
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const wall = new Konva.Rect({
        width: width,
        height: height,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: opacity,
        strokeScaleEnabled: false,
        name: "rect"
    })

    group.add(wall)
    group.on('click tap', shapeParams.transformSize)
    group.on('mouseup', shapeParams.dragElement)
    group.on('contextmenu', shapeParams.handleContextMenu)
    group.on('mouseleave', () => {
        shapeParams.stage.setAttr('cursor', 'default')
    })

    shapeParams.layer.add(group)
    shapeParams.layer.draw()
    
}
