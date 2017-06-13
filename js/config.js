var startyear = 1960,
    endyear = 2090,
    curryear = 2015,
    inityear = 1970;

var title_fontsize = '30pt',
    name_fontsize = '20pt',
    valuetoken_fontsize = '8pt';


/*
 * colors
 *
 * */

var colors = [
    '#ff5722',
    '#ff9800',
    '#ffc107',
    '#ffeb3b',
    '#cddc39',
    '#8bc34a',
    '#4caf50',
    '#009688',
    '#00bcd4',
    '#03a9f4',
    '#2196f4',
    '#3f51b5',
    '#673ab7',
    '#9c27b0',
    '#e91e63'
];
/*
var catecolors = [
    '#e7298a',
    '#d95f02',
    '#a6761d',
    '#e6ab02',
    '#66a61e',
    '#1b9e77',
    '#7570b3'
];*/
var pink = '#f781bf',
    red = '#e41a1c',
    brown = '#a65628',
    orange = '#ff7f00',
    yellow = '#ffff33',
    lightgreen = '#adff2f',
    green = '#4daf4a',
    skyblue = '#4fc3f7',
    blue = '#377eb8',
    purple = '#984ea3';

// sequential
/*
var reds = ['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15'],
    greens = ['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'],
    blues = ['#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c'],
    purples = ['#f2f0f7','#cbc9e2','#9e9ac8','#756bb1','#54278f']
*/
var reds = ['#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
    limes = ['#F0F4C3','#E6EE9C','#D4E157','#C0CA33','#AFB42B'],
    greens2 = ['#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
    greens = ['#C8E6C9','#81C784','#4CAF50','#388E3C','#1B5E20'],
    blues = ['#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'],
    indigos = ['#C5CAE9', '#7986CB', '#3F51B5', '#303F9F', '#1A237E'],
    deeppurples = ['#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486'],
    purples = ['', '#CE93D8', '#AB47BC', '#8E24AA', '#6A1B9A'];

var spred = '#ef5350',
    darkteel = '#26a69a',
    teel = '#4db6ac',
    customMix = '#57a0a2',
    darkcyan = '#0097a7',
    cyan = '#00acc1',
    lightcyan = '#80deea',
    sppurple = '#7e57c2';

// categorical colors of 4
var color40 = '#e41a1c',
    color42 = '#377eb8',
    color43 = '#984ea3';

// categorical colors of 3
var color30 = '#d95f02',
    color31 = '#1b9e77',
    color32 = '#7570b3';

// categorical colors of 3 (lighter)
var lcolor30 = '#fc8d62',
    lcolor31 = '#66c2a5',
    lcolor32 = '#8da0cb';

var color_dic = {
    '': '#ffffff',
    // underage
    'Pre-economic-activity': spred,
    'Underage': reds[2],//color40,
    '0f': reds[0],//colors[14],
    '5f': reds[1],//colors[0],
    '10f': reds[3],//colors[1],
    '15f': reds[4],//colors[2],
    // adults
    'In-economic-activity': customMix,
    'Adult': greens[2],//color41,
    '20f': greens[0],//colors[3],
    '25f': greens[1],//colors[4],
    '30f': greens[3],//colors[5],
    '35f': greens[4],//colors[6],
    'Middle-aged': indigos[2], //color42,
    '40f': indigos[0],//colors[7],
    '45f': indigos[1],//colors[8],
    '50f': indigos[3],//colors[9],
    '55f': indigos[4],//colors[10],
    // old
    'Post-economic-activity': sppurple,
    'Old': purples[2], //color43,
    '60f': purples[1],//colors[11],
    '65f': purples[3],//colors[12],
    '70ormore': purples[4]//colors[13]
};


