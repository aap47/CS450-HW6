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
      sentimentColors : { positive: "green", negative: "red", neutral: "gray" }
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
  var margin ={left:50,right:150,top:10,bottom:10},width = 500,height=300;
  var innerWidth = width - margin.left - margin.right
  var innerHeight = height - margin.top - margin.bottom
  d3.select(".scatterplot").attr("width",width).attr("height",height)
  const chart = d3.select(".inner_chart").attr("transform", `translate(${margin.left}, ${margin.top})`)
  const key = d3.select(".key").attr("transform", `translate(${margin.left + innerWidth + 10}, ${margin.top})`)

  key.append("circle").attr("r", 5).attr("fill",this.state.sentimentColors.positive).attr("cx", 5).attr("cy",5)
  key.append("text").attr("dx", 15).attr("dy", 10).attr("fill","black").text("Positive")
  key.append("circle").attr("r", 5).attr("fill",this.state.sentimentColors.negative).attr("cx", 5).attr("cy",20)
  key.append("text").attr("dx", 15).attr("dy", 25).attr("fill","black").text("Negative")
  key.append("circle").attr("r", 5).attr("fill",this.state.sentimentColors.neutral).attr("cx", 5).attr("cy",35)
  key.append("text").attr("dx", 15).attr("dy", 40).attr("fill","black").text("Neutral")

  const xScale = d3.scaleLinear()
    .domain([d3.min(this.state.data, d => d["Dimension 1"]), d3.max(this.state.data, d => d["Dimension 1"])])
    .range([0, innerWidth]);
  const yScale = d3.scaleLinear()
    .domain([d3.min(this.state.data, d => d["Dimension 2"]), d3.max(this.state.data, d => d["Dimension 2"])])
    .range([innerHeight, 0]);

  chart.selectAll("circle").data(this.state.data).join("circle")
  .attr("r", 5)
  .attr("fill", d => this.state.sentimentColors[(d["PredictedSentiment"])])
  .attr("cx", d => xScale(d["Dimension 1"]))
  .attr("cy", d => yScale(d["Dimension 2"]))

  var brush = d3.brush().on('start brush', (e) => {
    var filtered_data = this.state.data.filter(item => {
      var x = xScale(item["Dimension 1"]);
      var y = yScale(item["Dimension 2"])
      return x >= e.selection[0][0] &&
        x <= e.selection[1][0] &&
        y >= e.selection[0][1] &&
        y <= e.selection[1][1]
    });
    this.setState({selected_data : filtered_data})
  })

  chart.call(brush)
}
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item"> 
          <h2>Projected Tweets</h2> 
            <svg className="scatterplot">
              <g className="inner_chart"></g>
              <g className="key"></g>
            </svg> 
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2>
            <div> {this.state.selected_data.map(item =><p className={item.PredictedSentiment}>{item.Tweets}</p>)} </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
