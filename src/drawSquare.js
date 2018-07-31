import Konva from'konva'

export function drawSquare(options, width=60, height=60, fill='#D0021B', stroke='#D0021B', strokeWidth=1, opacity=1, xPos= (options.innerWidth / 2) - 30, yPos=(options.innerHeight / 2) - 30, prevRotation=0, rotation=0, scaleX=1, scaleY=1) {

    const group = new Konva.Group({
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        draggable: true,
        id: "square",
        prevRotation: prevRotation,
        rotation: rotation,
        scaleX: scaleX,
        scaleY: scaleY
    })

    const rect = new Konva.Rect({
        width: width,
        height: height,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: opacity,
        strokeScaleEnabled: false,
        name: "rect"
    })

    group.add(rect)
    group.on('click tap', options.transformSize)
    group.on('mouseup', options.dragElement)
    group.on('mouseleave', () => {
        const s = options.stage.getStage()
        s.setAttr('cursor', 'default')
    })

    options.layer.add(group)
    options.layer.draw()

}
