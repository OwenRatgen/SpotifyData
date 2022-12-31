'use strict';

const e = React.createElement;

class PieChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
      ]
    };
    for (var i = 0; i < names.length; i++) {
      this.state.data.push({name: names[i], score: scores[i]});
    }
  }

  render() {
    const totalScore = this.state.data.reduce((acc, item) => acc + item.score, 0);
    let startAngle = 0;

    const colors = [
        'red',
        'orange',
        'yellow',
        'green',
        'blue',
        'indigo',
        'violet',
        'pink',
        'purple',
        'brown'
      ];

    const chartData = this.state.data.map((item, index) => {
      const percentage = Math.round((item.score / totalScore) * 10000)/100;
      const angle = (percentage / 100) * 360;
      const endAngle = startAngle + angle;

      const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
      const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
      const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
      const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`;

      startAngle = endAngle;

      return {
        name: item.name,
        value: percentage,
        pathData: pathData,
        color: colors[index]
      };
    });

    return e(
      'div',
      {},
      e(
        'svg',
        { width: '100', height: '100' },
        chartData.map(item => {
          return e(
            'path',
            {
              d: item.pathData,
              fill: item.color,
              stroke: 'black',
              'strokeWidth': '3',
              'data-name': item.name,
              'data-value': item.value,
              onMouseOver: event => {
                event.target.setAttribute('stroke-width', '6');
                ReactDOM.render(
                  e(
                    'text',
                    {
                    },
                    `${item.name}: ${item.value}%`
                  ),
                  document.getElementById('pie_chart_label')
                );
              },
              onMouseOut: event => {
                event.target.setAttribute('stroke-width', '3');
                ReactDOM.render(
                  e(
                    'text',
                    {
                    },
                    'Genre Breakdown'
                  ),
                  document.getElementById('pie_chart_label')
                );
              }           
            },
          );
        })
      )
    );
  }
}

const namesUnread = document.getElementById('genres').getElementsByTagName('li');
const scoresUnread = document.getElementById('genreFreq').getElementsByTagName('li');

const names = [];
const scores = [];

for (var i = 0; i < namesUnread.length; i++) {
    names.push(namesUnread[i].innerHTML);
    scores.push(parseInt(scoresUnread[i].innerHTML));
}

const domContainer = document.querySelector('#pie_chart_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(PieChart, {names: names, scores: scores}));
