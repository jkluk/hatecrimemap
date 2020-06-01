export const CHARTS = {
  RACE_ETHNICITY: 1,
  RELIGION: 2,
  GENDER_SEXUALITY: 3,
  OTHER: 4,
  TOP: 5
}

// var raceData = 
// // ( ({ african_american, arab, asian_american, latinx, native_american, pacific_islander, immigrants, white }) => ({ african_american, arab, asian_american, latinx, native_american, pacific_islander, immigrants, white }) )(statetotals[currentState]);
// var religionData = [];
// //( ({jewish, muslim, sikh}) => ({jewish, muslim, sikh}) )(statetotals[currentState]);
// var genderData = [];
// //( ({lgbt, women, girls, men, boys}) => ({lgbt, women, girls, men, boys}) )(statetotals[currentState]);
// var otherData = [];
// //( ({disabled, trump_supporter, others}) => ({disabled, trump_supporter, others}))(statetotals[currentState]);

const CHART_COLORS = ["#003f5c", "#ffa600", "#665191", "#d45087", "#f95d6a", "#a05195", "#ff7c43", "#2f4b7c"]

var raceChartData = {
  datasets: [
  {
    label:"Number of Hate Crimes against Race Groups",
    backgroundColor: CHART_COLORS.map(c => c + "33"),
    borderColor: CHART_COLORS,
    borderWidth: 1,
    hoverBackgroundColor: CHART_COLORS.map(c => c + "66"),
    hoverBorderColor: CHART_COLORS
  }]
};

var religionChartData = {
  datasets: [
  {
    label:"Number of Hate Crimes against Religious Groups",
    backgroundColor: CHART_COLORS.map(c => c + "33"),
    borderColor: CHART_COLORS,
    borderWidth: 1,
    hoverBackgroundColor: CHART_COLORS.map(c => c + "66"),
    hoverBorderColor: CHART_COLORS
  }]
};
var genderChartData = {
  datasets: [
  {
    label:"Number of Hate Crimes based on Gender",
    backgroundColor: CHART_COLORS.map(c => c + "33"),
    borderColor: CHART_COLORS,
    borderWidth: 1,
    hoverBackgroundColor: CHART_COLORS.map(c => c + "66"),
    hoverBorderColor: CHART_COLORS
  }]
};
var otherChartData = {
  datasets: [
  {
    label:"Number of Hate Crimes against Other Groups",
    backgroundColor: CHART_COLORS.map(c => c + "33"),
    borderColor: CHART_COLORS,
    borderWidth: 1,
    hoverBackgroundColor: CHART_COLORS.map(c => c + "66"),
    hoverBorderColor: CHART_COLORS
  }]
};
var topChartData = {
  datasets: [
  {
    label:"Number of Hate Crimes",
    backgroundColor: CHART_COLORS.map(c => c + "33"),
    borderColor: CHART_COLORS,
    borderWidth: 1,
    hoverBackgroundColor: CHART_COLORS.map(c => c + "66"),
    hoverBorderColor: CHART_COLORS
  }]
}

// Could make a single function, but this should allow us to customize chart colors more easily in the future
export function getChartData(chart, allData) {
  let chartData;
  let data;
  if (chart === CHARTS.RACE_ETHNICITY) {
    chartData = raceChartData;
  } else if (chart === CHARTS.RELIGION) {
    chartData = religionChartData;
  } else if (chart === CHARTS.GENDER_SEXUALITY) {
    chartData = genderChartData;
  } else if (chart === CHARTS.OTHER) {
    chartData = otherChartData;
  } else if (chart === CHARTS.TOP) {
    chartData = topChartData;
  }

  data = getTopData(allData);
  const [total, ...labels] = data.labels
  chartData.datasets[0].data = data.counts.filter(x => x!==undefined); // because we don't want "counts" => undefined
  chartData.labels = labels;
  return chartData;
}

// TODO: move labels to globals for consistency
const getRaceData = (data) => (
  [
    data['jewish'],
    data['african_american'], data['arab'],
    data['asian_american'], data['chinese'], 
    data['native_american'], data['latinx'], data['pacific_islander'],
    data['white']
  ]
);

const getReligionData = (data) => (
  [
    data['muslim'],
    data['sikh']
  ]
);

const getGenderData = (data) => (
  [
    data['male'], data['female'], data['nonbinary']
  ]
);

const getOtherData = (data) => (
  {
    labels: Object.keys(data),
    counts: Object.entries(data).map(([parent, counts]) => counts.count)
  }
);

const getTopData = (data) => (
    {
      labels: Object.keys(data),
      counts: Object.entries(data).map(([parent, counts]) => counts.count)
    }
    // [
    //   data['Race/Ethnicity'],
    //   data['Gender/Sexuality'],
    //   data['Religion'],
    //   data['Other']
    // ]
  )