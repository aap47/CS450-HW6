import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      selected_data:[],
      sentimentColors : { 
        gpt: "#e41a1c",
        gemini: "#377eb8", 
        palm: "#4daf4a",
        claude: "#984ea3",
        llama: "#ff7f00"
      }
    };
  }
  componentDidMount(){
    this.renderChart()
  }
  componentDidUpdate(){
    this.renderChart()
}
set_data = (csv_data) => {
  this.setState({ data: csv_data });
}
renderChart=()=>{
  var margin ={left:50,right:150,top:10,bottom:10},width = 700,height=600;
  var innerWidth = width - margin.left - margin.right
  var innerHeight = height - margin.top - margin.bottom
  const streamgraph = d3.select(".streamgraph").attr("width",width).attr("height",height)
  const chart = d3.select(".inner_chart").attr("width",innerWidth).attr("height",innerHeight).attr("transform", `translate(${margin.left}, ${margin.top})`)
  const key = d3.select(".key").attr("transform", `translate(${margin.left + innerWidth + 70}, ${margin.top})`)
  
  const tooltip = d3.selectAll(".tooltip").data([0]).join("svg").attr("class", "tooltip")
  .style("opacity", 0).style("background-color", "white").style("position", "absolute")
  .style("border", "1px solid gray").style("border-radius", "5px").style("padding", "5px")
  .attr("width",300).attr("height",150)

  // This is creating the legend.
  const x = 5
  const r = 5
  const dx = 15
  var y = 5
  const y_increment = 15
  key.append("circle").attr("r", r).attr("fill",this.state.sentimentColors.llama).attr("cx", x).attr("cy",y)
  key.append("text").attr("dx", dx).attr("dy", y + r).attr("fill","black").text("LLaMA-3.1")
  y += y_increment
  key.append("circle").attr("r", r).attr("fill",this.state.sentimentColors.claude).attr("cx", x).attr("cy",y)
  key.append("text").attr("dx", dx).attr("dy", y + r).attr("fill","black").text("Claude")
  y += y_increment
  key.append("circle").attr("r", r).attr("fill",this.state.sentimentColors.palm).attr("cx", x).attr("cy",y)
  key.append("text").attr("dx", dx).attr("dy", y + r).attr("fill","black").text("PaLM-2")
  y += y_increment
  key.append("circle").attr("r", r).attr("fill",this.state.sentimentColors.gemini).attr("cx", x).attr("cy",y)
  key.append("text").attr("dx", dx).attr("dy", y + r).attr("fill","black").text("Gemini")
  y += y_increment
  key.append("circle").attr("r", r).attr("fill",this.state.sentimentColors.gpt).attr("cx", x).attr("cy",y)
  key.append("text").attr("dx", dx).attr("dy", y + r).attr("fill","black").text("GPT-4")
  y += y_increment

  const maxSum = d3.sum([
    d3.max(this.state.data, d => d.llama),
    d3.max(this.state.data, d => d.claude),
    d3.max(this.state.data, d => d.palm),
    d3.max(this.state.data, d => d.gemini),
    d3.max(this.state.data, d => d.gpt),
  ])
  /*
  const maxes = {
    llama: d3.max(this.state.data, d => d.llama),
    claude: d3.max(this.state.data, d => d.claude),
    palm: d3.max(this.state.data, d => d.palm),
    gemini: d3.max(this.state.data, d => d.gemini),
    gpt: d3.max(this.state.data, d => d.gpt),
  }
  */
  const maxes = [
    d3.max(this.state.data, d => d.llama),
    d3.max(this.state.data, d => d.claude),
    d3.max(this.state.data, d => d.palm),
    d3.max(this.state.data, d => d.gemini),
    d3.max(this.state.data, d => d.gpt),
  ]
  const xScale = d3.scaleLinear()
    .domain(d3.extent(this.state.data, d => d.date))
    .range([0, innerWidth]);
  const yScale = d3.scaleLinear()
    .domain([-maxSum, maxSum])
    .range([innerHeight, 0]);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec'
  ]

  var stack = d3.stack().keys(['gpt','gemini','palm','claude','llama']).offset(d3.stackOffsetWiggle);
  var stackedSeries = stack(this.state.data);
  var areaGenerator = d3.area().x(d => xScale(d.data.date)).y0(d => yScale(d[0])).y1(d => yScale(d[1])).curve(d3.curveCardinal);

  chart.selectAll("path")
  .data(stackedSeries)
  .join("path")
  .style("fill", d=> this.state.sentimentColors[d.key]).attr('d', d=>areaGenerator(d))
  .on("mouseover", (event, d) => {
    tooltip.style("opacity", 1)
    const barXScale = d3.scaleBand()
      .domain([0,1,2,3,4,5,6,7,8,9])
      .range([30, 290])
      .padding(0.1);
    const barYScale = d3.scaleLinear()
      .domain([0, d3.max(maxes)])
      .range([90,0])
    tooltip.style("left", `${event.pageX}px`).style("top", `${event.pageY-35}px`)
    var i = -1;
    tooltip.selectAll("rect")
    .data(d)
    .join("rect")
    .attr("fill", this.state.sentimentColors[d.key])
    .attr("x", d => {i += 1; return barXScale(i)} )
    .attr("height", d => barYScale(d[1] - d[0]))
    .attr("width",barXScale.bandwidth())
    .attr("y", d => barYScale.range()[1] - barYScale(d[1] - d[0]) + barYScale.range()[0])
    tooltip.selectAll(".x-axis")
    .data([null]).join("g").attr("class", "x-axis")
    .attr("transform", `translate(0, ${90})`)
    .call(d3.axisBottom(barXScale).ticks(10).tickValues([0,1,2,3,4,5,6,7,8,9]).tickFormat(d => `${months[d]}`));
    tooltip.selectAll(".y-axis")
    .data([null])
    .join("g")
    .attr("transform", `translate(30, 0)`)
    .attr("class", "y-axis")
    .call(d3.axisLeft(barYScale).ticks(5));
    }
  )
  .on("mouseleave", () => tooltip.style("opacity", 0));
  
  // Draw x-axis
  streamgraph.selectAll(".x-axis")
  .data([null]).join("g").attr("class", "x-axis")
  .attr("transform", `translate(${margin.left}, ${400})`)
  .call(d3.axisBottom(xScale).ticks(10).tickValues(this.state.data.date).tickFormat(d => `${months[d-1]}`));

}
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item"> 
          <h2>Projected Tweets</h2> 
            <svg className="streamgraph">
              <g className="inner_chart"></g>
              <g className="key"></g>
            </svg> 
          </div>
        </div>
      </div>
    );
  }
}

export default App;
