import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import * as d3 from 'd3';
import miserables  from './miserables'; //Network Data
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: 'Test Content',
      clicked: ''
    }
    this.link = null;
    this.node = null;
    this.simulation = null;
  }
  componentDidMount() {
    this.drawNetwork();
    ReactTooltip.rebuild();
  }
  componentDidUpdate(state) {
    ReactTooltip.hide();
  }
  drawNetwork = () => {
    const svg = d3.select('svg'),
      width = +svg.attr('width'),
      height = +svg.attr('height');
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    //Simulation 
    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));
    
    this.link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(miserables.links)
      .enter().append("line")
      .attr("stroke-width", function (d) { return Math.sqrt(d.value); });
    
    this.node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(miserables.nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr('data-tip', '')
      .attr('data-for', 'd3Tooltip')
      .attr('ref', (d) => {return `ref${d.id}`; })
      .attr("fill", function (d) { return color(d.group); })
      .on('click', (d, e) => { this.clicked(d, e) })
      .call(d3.drag()
        .on("start", this.dragstarted)
        .on("drag", this.dragged)
        .on("end", this.dragended));
    this.simulation.nodes(miserables.nodes).on("tick", this.ticked);
    this.simulation.force("link").links(miserables.links);
  }
  ticked = () => {
    this.link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });
    this.node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  }
  clicked = (d, e) => {
    this.setState({
      clicked: d.id
    });
  }
  dragstarted = (d) => {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  dragged = (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  dragended = (d) => {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  returHTML() {
    return <div>
      <h1>{this.state.clicked}</h1>
      <span onClick={() => ReactTooltip.hide()} className='close-me'>Close</span>
    </div>
  }
  render() {
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 data-tip='' data-for='d3Tooltip' className='App-title'>React Tooltip for D3 Force Layout</h1>
        </header>
        <svg width='960' height='600'></svg>
        <ReactTooltip
          disable={false}
          tip=''
          event='click'
          // afterShow={() => console.log('showing tooltip')}
          // afterHide={() => console.log('hiding tooltip')}
          scrollHide={true}
          id='d3Tooltip'
          className='extraClass'
          effect='solid'
          type='success' >
          {this.returHTML()}
        </ReactTooltip>
      </div>
    );
  }
}

export default App;
