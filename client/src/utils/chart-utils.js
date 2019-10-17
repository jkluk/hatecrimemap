export const CHARTS = {
  RACE_ETHNICITY: 1,
  RELIGION: 2,
  GENDER_SEXUALITY: 3,
  OTHER: 4
}

// var raceData = 
// // ( ({ african_american_harassed_total, arab_harassed_total, asian_american_harassed_total, latinx_harassed_total, native_american_harassed_total, pacific_islander_harassed_total, immigrants_harassed_total, white_harassed_total }) => ({ african_american_harassed_total, arab_harassed_total, asian_american_harassed_total, latinx_harassed_total, native_american_harassed_total, pacific_islander_harassed_total, immigrants_harassed_total, white_harassed_total }) )(statetotals[currentState]);
// var religionData = [];
// //( ({jewish_harassed_total, muslim_harassed_total, sikh_harassed_total}) => ({jewish_harassed_total, muslim_harassed_total, sikh_harassed_total}) )(statetotals[currentState]);
// var genderData = [];
// //( ({lgbt_harassed_total, women_harassed_total, girls_harassed_total, men_harassed_total, boys_harassed_total}) => ({lgbt_harassed_total, women_harassed_total, girls_harassed_total, men_harassed_total, boys_harassed_total}) )(statetotals[currentState]);
// var otherData = [];
// //( ({disabled_harassed_total, trump_supporter_harassed_total, others_harassed_total}) => ({disabled_harassed_total, trump_supporter_harassed_total, others_harassed_total}))(statetotals[currentState]);

var raceChartData = {
  labels: ["African American", "Arab", "Asian American", "Chinese", "Native American/Alaska Native", "Latinx", "Pacific Islander", "White"],
  datasets: [
  {
    label:"Number of Hate Crimes against Race Groups",
    backgroundColor: 'rgba(255,99,132,0.2)',
    borderColor: 'rgba(255,99,132,1)',
    borderWidth: 1,
    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    hoverBorderColor: 'rgba(255,99,132,1)'
  }]
};

var religionChartData = {
  labels: ["Jewish", "Muslim", "Sikh"],
  datasets: [
  {
    label:"Number of Hate Crimes against Religious Groups",
    backgroundColor: 'rgba(255,99,132,0.2)',
    borderColor: 'rgba(255,99,132,1)',
    borderWidth: 1,
    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    hoverBorderColor: 'rgba(255,99,132,1)'
  }]
};
var genderChartData = {
  labels: ["Women", "Men", "Girls", "Boys"],
  datasets: [
  {
    label:"Number of Hate Crimes based on Gender",
    backgroundColor: 'rgba(255,99,132,0.2)',
    borderColor: 'rgba(255,99,132,1)',
    borderWidth: 1,
    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    hoverBorderColor: 'rgba(255,99,132,1)'
  }]
};
var otherChartData = {
  labels: ["LGBT", "Trump Supporter", "Disabled"],
  datasets: [
  {
    label:"Number of Hate Crimes against Other Groups",
    backgroundColor: 'rgba(255,99,132,0.2)',
    borderColor: 'rgba(255,99,132,1)',
    borderWidth: 1,
    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    hoverBorderColor: 'rgba(255,99,132,1)'
  }]
};

// Could make a single function, but this should allow us to customize chart colors more easily in the future
export function getChartData(chart, allData) {
  var chartData;
  var data;
  if (chart === CHARTS.RACE_ETHNICITY) {
    chartData = raceChartData;
    data = getRaceData(allData);
  } else if (chart === CHARTS.RELIGION) {
    chartData = religionChartData;
    data = getReligionData(allData);
  } else if (chart === CHARTS.GENDER_SEXUALITY) {
    chartData = genderChartData;
    data = getGenderData(allData);
  } else if (chart === CHARTS.OTHER) {
    chartData = otherChartData;
    data = getOtherData(allData);
  }

  chartData.datasets[0].data = data;
  return chartData;
}

const getRaceData = (data) => (
  [
    data['african_american_harassed_total'], data['arab_harassed_total'],
    data['asian_american_harassed_total'], data['latinx_harassed_total'],
    data['native_american_harassed_total'], data['pacific_islander_harassed_total'],
    data['immigrants_harassed_total'], data['white_harassed_total']
  ]
);

const getReligionData = (data) => (
  [
    data['jewish_harassed_total'], data['muslim_harassed_total'],
    data['sikh_harassed_total']
  ]
);

const getGenderData = (data) => (
  [
    data['lgbt_harassed_total'], data['women_harassed_total'],
    data['girls_harassed_total'], data['men_harassed_total'],
    data['boys_harssed_total']
  ]
);

const getOtherData = (data) => (
  [
    data['diabled_harassed_total'], data['trump_supporter_harassed_total'],
    data['others_harassed_total']
  ]
);

export const wholeYAxis = {scales: {
      yAxes: [{
        ticks: {
          // beginAtZero:true,
          // callback: function(value) {if(value % 1 ===0) {return value;}},
          min: 0,
          max: 30
          // stepSize: 1
        }
      }]
    }};
