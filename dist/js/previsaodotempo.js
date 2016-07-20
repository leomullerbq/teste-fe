/*! Teste Front-End Leonardo Müller 
 * previsaodotempo.js
 * ================
 *
 * @Author  Leonardo Müller
 * @Email   <falecom@leomuller.com.br>
 * @version 0.0.1
 * @license MIT <http://opensource.org/licenses/MIT>
 */

var minima;
var maxima;
var forecast;

var praia;
var praiaDia;

var maximas;
var minimas;
var labels;

var areaChartCanvas;
var areaChart;

var defaultPlace;
var placeName;
var placeQuery;

$(document).ready(function () {
    areaChartCanvas = $("#areaChart").get(0).getContext("2d");
    buscaCidade();
    favoritar();
    
    defaultPlace = (window.localStorage.getItem('local'))?window.localStorage.getItem('local'):'/q/zmw:00000.3.83872';
    placeName = (window.localStorage.getItem('name'))?window.localStorage.getItem('name'):'Blumenau';
    
    previsaoDoTempo(defaultPlace);
});

function previsaoDoTempo(cidadeQuery) {
    resetVars();
    
    $.ajax({
        url: 'http://api.wunderground.com/api/14e7f8134873dc80/forecast10day/lang:BR' + cidadeQuery + '.json',
        dataType: 'jsonp',
        success: function (data) {
            
            forecast = data.forecast.simpleforecast.forecastday;
            len = forecast.length;
            
            for (var i = 0; i < len; i++) {
                previsaoDia = forecast[i];
                date = previsaoDia.date.day + '/' + previsaoDia.date.monthname_short;
                
                labels.push(date);
                maximas.push(previsaoDia.high.celsius);
                minimas.push(previsaoDia.low.celsius);

                getMaxima(previsaoDia);
                getMinima(previsaoDia);

                getPraia(previsaoDia);
            }

            console.log('preenche info');
            drawForecast();
            setMaximaeMinima();
            setPraia();

            getMap();
        }
    });
}

function setPraia() {
    if (praia) {
        $('#praia p').html('O ' + praiaDia[0].dia + ' parece um bom dia para ir à Praia com ' + praiaDia[0].temp + '° C');
        $('#praia i').removeClass('fa-cloud');
        if (!$('#praia i').hasClass('fa-sun-o')) {
            $('#praia i').addClass('fa-sun-o');
        }
    } else {
        $('#praia p').html('Melhor ficar em casa aproveitando a Netflix');
        $('#praia i').removeClass('fa-sun-o');
        if (!$('#praia i').hasClass('fa-cloud')) {
            $('#praia i').addClass('fa-cloud');
        }
    }
}

function setMaximaeMinima() {
    $('#temp-max').html(maxima.temp + 'º C no dia ' + maxima.dia);
    $('#temp-min').html(minima.temp + 'º C no dia ' + minima.dia);
}

function getMaxima(dia) {
    if (dia.high.celsius > maxima.temp) {
        maxima.temp = dia.high.celsius;
        maxima.dia = date;
    }
}

function getMinima(dia) {
    if (dia.low.celsius < minima.temp) {
        minima.temp = dia.low.celsius;
        minima.dia = date;
    }
}

function getPraia(dia) {
    if (dia.date.weekday == 'Sábado' || dia.date.weekday == 'Domingo') {
        if (dia.high.celsius >= 25 && (dia.icon=='clear'||dia.icon=='partlycloudy')) {
            praia = true;
            praiaDia.push({'dia': dia.date.weekday, 'temp': dia.high.celsius});
        }
    }
}

function getMap(){
    areaChartData = {
        labels: labels,
        datasets: [
            {
                label: "Máxima",
                fillColor: " rgba(245,105,84, 0.9)",
                strokeColor: " rgba(245,105,84, 0.8)",
                pointColor: "#f56954",
                pointStrokeColor: " rgba(245,105,84,1)",
                pointHighlightFill: "#fff",
                pointHighlightStroke: " rgba(245,105,84,1)",
                data: maximas
            },
            {
                label: "Mínima",
                fillColor: "rgba(60,141,188,0.9)",
                strokeColor: "rgba(60,141,188,0.8)",
                pointColor: "#3b8bba",
                pointStrokeColor: "rgba(60,141,188,1)",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(60,141,188,1)",
                data: minimas
            }
        ]
    };
    
    if (typeof(areaChart) == 'object') {
        killChart();
    } else {
        areaChart = new Chart(areaChartCanvas);
        areaChart.Line(areaChartData, areaChartOptions);
    }
    
    $('.overlay').hide();
}

function buscaCidade() {

    $('#previsaodotempo').submit(function (e) {

        e.preventDefault();
        var form = $(this);
        var msg = form.find('.msg');
        var erro = "";
        msg.html('').removeClass('alert-success alert-danger');

        form.find('*[required=required]').each(function () {

            //campo não preenchido ou email inválido
            if ($(this).val() == "") {
                $(this).addClass('error');
                erro = "Preencha os campos obrigatórios.";

            } else {
                $(this).removeClass('error');
            }
        });

        if (erro != "") {
            msg.html(erro).addClass('alert-danger');
            form.find('*[required=required].error:eq(0)').focus();

        } else {
            console.log('Busca ZWT');
            msg.html('').removeClass('alert-success alert-danger');

            $.ajax({
                url: form.attr('action') + '?' + form.serialize(),
                dataType: 'jsonp',
                jsonp: 'cb',
                success: function (data) {
                    placeName = data.RESULTS[0].name;
                    placeQuery = data.RESULTS[0].l;
                    previsaoDoTempo(data.RESULTS[0].l);
                }
            });
        }
    });
}

function resetVars() {
    
    $('.overlay').show();

    minima = {'temp': 999, 'dia': "segunda"};
    maxima = {'temp': -100, 'dia': "segunda"};
    forecast = [];

    praia = false;
    praiaDia = [];

    maximas = [];
    minimas = [];
    labels = [];
}

function drawForecast(){
    $('#forecasts').html('');
    $('#place-name').html('Previsão para '+placeName);
    len = forecast.length;
    for (var i = 0; i < len; i++) {
        day = forecast[i];
        $('#forecasts').append(
                '<div class="col-md-1 col-xs-4" style="min-height:250px;">\n\
                    <h4>'+day.date.weekday+' <br />'+day.date.day+'/'+day.date.monthname_short+'</h4>\n\
                    <img src="'+day.icon_url+'" alt="'+day.conditions+'" />\n\
                    <p>'+day.conditions+'</p>\n\
                    <p>Max: '+day.high.celsius+'º C <br />\n\
                       Min: '+day.low.celsius+'º C</p>\n\
                </div>');
    }
}

function favoritar(){
    $('#favoritar').click(function() { 
        window.localStorage.setItem('local', placeQuery); 
        window.localStorage.setItem('name', placeName);
        
        alert('Local favoritado');
    });
}

function killChart() {
    $('#areaChart').remove(); // this is my <canvas> element
    $('.chart').append('<canvas id="areaChart"><canvas>');
    canvas = document.querySelector('#areaChart'); // why use jQuery?
    ctx = canvas.getContext('2d');
    ctx.canvas.width = $('.chart').width(); // resize to parent width
    ctx.canvas.height = $('.chart').height();

    areaChart = new Chart(ctx);
    areaChart.Line(areaChartData, areaChartOptions);
}

/*! 
 *  Criação do Gráfico
 */

var areaChartOptions = {
    //Boolean - If we should show the scale at all
    showScale: true,
    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines: false,
    //String - Colour of the grid lines
    scaleGridLineColor: "rgba(255,255,255,.07)",
    //Number - Width of the grid lines
    scaleGridLineWidth: 1,
    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,
    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,
    //Boolean - Whether the line is curved between points
    bezierCurve: true,
    //Number - Tension of the bezier curve between points
    bezierCurveTension: 0.3,
    //Boolean - Whether to show a dot for each point
    pointDot: true,
    //Number - Radius of each point dot in pixels
    pointDotRadius: 4,
    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth: 1,
    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius: 20,
    //Boolean - Whether to show a stroke for datasets
    datasetStroke: true,
    //Number - Pixel width of dataset stroke
    datasetStrokeWidth: 2,
    //Boolean - Whether to fill the dataset with a color
    datasetFill: false,
    //String - A legend template
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%> color:#fff\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
    //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
    maintainAspectRatio: true,
    //Boolean - whether to make the chart responsive to window resizing
    responsive: true,
    defaults: {global: {defaultFontColor: '#fff'}}
};