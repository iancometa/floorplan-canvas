import React, { Component } from 'react';
import Konva from'konva'
import { 
    Stage, 
    Layer
 } from 'react-konva'
import MapNavButton from './components/MapNavButton'
import { drawChair } from './components/drawChair'
import { drawWindow } from './components/drawWindow'
import { drawWall } from './components/drawWall'
import { drawDoor } from './components/drawDoor'
import { drawText } from './components/drawText'
import { drawSquare } from './components/drawSquare'
import { drawCircle } from './components/drawCircle'
import './styles/home.css';
import './styles/App.css'

class App extends Component {

  state = {
    innerWidth: window.innerWidth - 160,
    innerHeight: window.innerHeight - 200,
    shape: '',
    gridSize: 10,
    shapeNode: '',
    shapeStrokeColor: '',
    shapeStrokeWidth: '',
    shapeFillColor: '',
    shapeOpacity: '',
    stageSelector: false,
    canvasLayer: '',
    canvasStage: ''
  }

  componentDidMount() {
    this.setState({
        canvasLayer: this.layer,
        canvasStage: this.stage
    })
    var gridSize = this.state.gridSize,
        canvasHeight = this.state.innerHeight,
        canvasWidth = this.state.innerWidth;

    /**
     * this will create grid 
     * on the stage canvas 
     */
    for (var i = 0; i <= (canvasWidth / gridSize); i++) {
        this.baseLayer.add(new Konva.Line({
            points: [i * gridSize, 0, i * gridSize, canvasHeight],
            stroke: '#fff',
            strokeWidth: 0.5
        }))
        this.baseLayer.add(new Konva.Line({
            points: [0, i * gridSize, canvasWidth, i * gridSize],
            stroke: '#fff',
            strokeWidth: 0.5
        }))
    }       

}

componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleTextRotation)
}

dragElement = (e) => {
    const shapeNode = e.currentTarget
    if (this.state.stageSelector === false) this.layer.find('#stageSelect').destroy()
    const grid = this.state.gridSize
    const x = Math.floor(shapeNode.getAttr('x'))
    const y = Math.floor(shapeNode.getAttr('y'))
    shapeNode.setAttr('x', Math.round(x / grid) * grid)
    shapeNode.setAttr('y', Math.round(y / grid) * grid)
    this.layer.find('Transformer').destroy()
    this.layer.draw()
}

handleTextRotation = () => {
    if (this.state.shapeNode === "") return

    this.layer.find('Transformer').destroy() 
    this.layer.draw()           
    const rot = this.state.shapeNode.getAttr('rotation')
    let prevRot = this.state.shapeNode.getAttr('prevRotation')

    if (prevRot === undefined) {
        prevRot = 0
    }

    this.state.shapeNode.setAttr('prevRotation',rot)

    this.layer.draw()
    document.removeEventListener('mouseup', this.handleTextRotation)
    
}

handleTransform = () => {
    document.addEventListener('mouseup', this.handleTextRotation)
}

transformSize = (e) => {  
    const shapeNode = e.currentTarget
  
    this.setState({
        shapeFillColor: shapeNode.children[0].attrs['fill'],
        shapeStrokeColor: shapeNode.children[0].attrs['stroke'],
        shapeStrokeWidth: shapeNode.children[0].attrs['strokeWidth'],
        shapeOpacity: shapeNode.children[0].attrs['opacity'],
        shapeNode: shapeNode
    })
    
    this.layer.find('Transformer').destroy()
    const tr = new Konva.Transformer()
    this.layer.add(tr)
    tr.attachTo(shapeNode)
    shapeNode.on('transform', this.handleTransform)
    this.layer.draw()
}

showDialog = (shape) => {
    
    const shapeParams = {
        innerWidth: this.state.innerWidth, 
        innerHeight: this.state.innerHeight, 
        transformSize: this.transformSize, 
        dragElement: this.dragElement,
        layer: this.layer,
        stage: this.stage.getStage()
    }

    switch (shape) {
        case 'Chair':
            return drawChair(shapeParams) 
        case 'Door':
            return drawDoor(shapeParams) 
        case 'Wall':
            return drawWall(shapeParams)
        case 'Window':
            return drawWindow(shapeParams)  
        case 'Text':
            return drawText(shapeParams)
        case 'Square':
            return drawSquare(shapeParams)
        case 'Circle':
            return drawCircle(shapeParams)
        default:
            return
    }
}

  render() {

    const mapLeftBtnProps = {
      showDialog: this.showDialog
    }

    return (
      <div>
            <h2>FloorPlan Canvas</h2>

            <div style={{display: "flex"}}>
                
                <div style={{width:160}}>
                    <MapNavButton {...mapLeftBtnProps} buttonName="Window" />
                    <MapNavButton {...mapLeftBtnProps} buttonName="Wall" />
                    <MapNavButton {...mapLeftBtnProps} buttonName="Door" />
                    <MapNavButton {...mapLeftBtnProps} buttonName="Chair" />
                    <MapNavButton {...mapLeftBtnProps} buttonName="Text" />
                    <MapNavButton {...mapLeftBtnProps} buttonName="Square" />  
                    <MapNavButton {...mapLeftBtnProps} buttonName="Circle" />              
                </div>
                
                <Stage 
                    width={this.state.innerWidth} 
                    height={this.state.innerHeight}
                    name="stage"
                    style={{
                        backgroundColor: "#696767"
                    }}
                    ref={node => {
                        this.stage = node
                    }}
                    onClick={this.clickStage}
                >
                    <Layer
                        ref={node => {
                            this.baseLayer = node
                        }}
                    >
                    </Layer>
                    <Layer
                        ref={node => {
                            this.layer = node
                        }}
                    >
                    </Layer>
                </Stage>
            </div>
        
        </div>
    )
  }
}

export default App;
