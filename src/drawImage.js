import Konva from'konva'


export function drawImage(options) {

    const imageObj = new Image()
    
    imageObj.onload = function() {

        const myLayer = options.layer
        
        if (options.id === "image") {
            const group = new Konva.Group({
                x: options.x, 
                y: options.y, 
                draggable: true,
                id: options.id,
                prevRotation: options.prevRotation,
                rotation: options.rotation,
                scaleX: options.scaleX,
                scaleY: options.scaleY,
                src: options.loadImageSrc
            })
    
            const img = new Konva.Image({
                x: 0, 
                y: 0, 
                image: imageObj,
                id: options.id
            })
            group.add(img)
            group.on('click', options.transformSize)
            group.on('mouseup', options.dragElement)
            group.on('contextmenu', options.handleContextMenu)
            myLayer.add(group)
            myLayer.draw()

        } else {
            // add background
            const img = new Konva.Image({
                x: 0, 
                y: 0, 
                image: imageObj,
                id: options.id,
                src: options.loadImageSrc
            })
            myLayer.add(img)
            myLayer.draw()

            for (let n of myLayer.children) {
                if (n.attrs.id === "background") {
                    n.moveToBottom()
                    myLayer.draw()
                }
            }
        }

        const layer = myLayer.getLayer()
        const obj = layer.toObject()
        if (options.addHistory !== "") {
            options.addHistory(obj)
        }

    }

    imageObj.src = options.loadImageSrc
}