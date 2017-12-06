/**
 * Created by maciej on 29.11.17.
 */
var loadingData = function (data) {

        var faToCel = function (fahre) {
            return Math.round((fahre -32)/1.8);
        }

        var dayConverter = function (key) {
            key = key.substring(0,key.length -1);
            var days = {
                Mon:"Pon.", Tue:"Wt.", Wed:"Śr.", Thu:"Czw.", Fri:"Pt.", Sat:"Sob.", Sun:"Niedz."
            };

            return days[key];
        }

        var monthConverter = function (key) {

            var months = {
                Jan:"01", Feb:"02", Mar:"03", Apr:"04", May:"05", Jun:"06",
                Jul:"07", Aug:"08", Sep:"09", Oct:"10", Nov:"11", Dec:"12"
            };

            return months[key];
        }

        var dateConverter = function (data) {
            var d = data.item.condition.date.split(' ');
            var newDate = dayConverter(d[0])+' '+d[1]+'-'+monthConverter(d[2])+'-'+d[3];
            return newDate;
        }

        var conditionConverter = function (data) {
            var cond = data.item.condition.code;
            var code = {
                0:'Tornado',
                1:'Burza Tropikalna',
                2:'Huragan',
                3:'Silne Burze',
                4:'Burze',
                5:'Deszcz ze śniegiem',
                6:'Marznący śnieg',
                7:'Marznący śnieg',
                8:'Gołoledź',
                9:'Mżawka',
                10:'Marznący deszcz',
                11:'Przelotne opady',
                12:'Przelotne opady',
                13:'Zamieć',
                14:'Przelotne opady śniegu',
                15:'Zamieć',
                16:'Opady śniegu',
                17:'Grad',
                18:'Śnieg z deszczem',
                19:'Burza piaskowa',
                20:'Mglisto',
                21:'Mgła',
                22:'smoky',
                23:'Zawiechura',
                24:'Wietrznie',
                25:'Zimno',
                26:'Pochmurno',
                27:'W większości pochmurnie ',
                28:'W większości pochmurnie',
                29:'Częściowe zachmurzenie',
                30:'Częściowe zachmurzenie',
                31:'Bezchmurnie',
                32:'Słonecznie',
                33:'Umiarkowana',
                34:'Umiarkowana',
                35:'Deszcz/Śnieg',
                36:'Gorąco',
                37:'Możliwe burze',
                38:'Możliwe burze',
                39:'Możliwe burze',
                40:'Przelotne opady',
                41:'Opady mokrego śniegu',
                42:'Przelotne opady śniegu',
                43:'Opady mokrego śniegu',
                44:'Częściowe zachmurzenie',
                45:'Burza',
                46:'Śnieg',
                47:'Przelotne ulewy',
                3200:'brak'
            }
            return code[cond];
        }

        var getLink = function (data) {
            var desc = data.item.description.split('<BR />')[11].split('"')[1];
            var index = desc.indexOf('https');
            var txt = desc.substring(index,desc.length);

            return txt;
        }

        var getImg = function (data) {
            var img = data.item.description.split('<BR />')[0].split('"')[1];


            return img;
        }

   return {
            obj: {
                city: data.location.city,
                country: data.location.country,
                temp: faToCel(data.item.condition.temp),
                date: dateConverter(data),
                cond: conditionConverter(data),
                description: getLink(data),
                image: getImg(data)
            }
   };
};



var start = function loadData(cities,callback) {
    var txt = function () {
        var abc ='';
        cities.forEach(function (p1) {
            abc+=" or text='"+p1+"'";
        })
        return abc.replace('or','');
    }

    var url = "https://query.yahooapis.com/v1/public/yql?q=select location,item.condition,item.description from weather.forecast where woeid in (select woeid from geo.places(1) where "+txt()+")&format=json";
    var httpReq = new XMLHttpRequest();
    httpReq.timeout = 2000;
    httpReq.onreadystatechange =function () {
        if(this.readyState== 4) {
            if(this.status == 200){
                callback(null,this.responseText);
            }else {
                callback(this.status,null);
            }
        }
    }
    httpReq.ontimeout =function () {
      console.log("error");
    };
    httpReq.open("GET", url, true);
    httpReq.send();
}



var page = function (p) {
        var c  =document.querySelector('.frame');
        c.querySelector('.city').textContent = p.obj.city;
        c.querySelector('.temperature').innerHTML = p.obj.temp + ' &#8451;';
        c.querySelector('.image').getElementsByTagName("img")[0].src = p.obj.image;
        c.querySelector('.description').firstElementChild.textContent = p.obj.cond;
        c.querySelector('.date').textContent = p.obj.date;
        document.querySelector(".frame").onclick = function () {
            var w = window.open(p.obj.description, '_blank');
            w.focus();
        };
}

var randomCites = function (database) {
    var randCities = [];
    var city=[];
    var i = 0;
    while(i < 3) {
        var r = Math.floor((Math.random() *(database.length)));
        if(city.indexOf(database[r].obj.city) == -1) {
            city.push(database[r].obj.city);
            randCities.push(database[r]);
            i += 1;
        }
    }
    return randCities;
};




var cities = ['Krakow','New York','Łódź','London','Paryz','Tokio','Moskwa','Berlin','Rzym','Madryt','Las Vegas'];

var i =0;
var database = []
function  execute(a, b) {
    if(a === null) {
        var data = JSON.parse(b);
        data.query.results.channel.forEach(function (el1) {
            var tmp  = loadingData(el1);
            database.push(tmp);
        })
        i = database.length;
    }

    if(a !== null){
        console.log(a);
    }
    if(i == cities.length){
        var j =0;
        var r = randomCites(database);
        var c1 = 0;
        var p1 = 10000;

        var one = function(){
            i = 0;
            database.splice(0,database.length);
            database.length = 0;
            start(cities,execute);
        };
        var two = function(){
            if(r.length > 0){
                page(r[j]);
                j+=1;
                if(j == r.length){
                    j=0;
                }
            }
            if(c1 * p1 < 60000-p1){
                setTimeout(two,p1);
            }else{
                one();
            }
            c1 += 1;
        };
        two();
    }
}

start(cities,execute);


