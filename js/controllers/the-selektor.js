(function(){
angular.module("theSelektor", ['ui.bootstrap', 'themoviedbAPI', 'ngCookies']);

angular.module("theSelektor").controller("theSelektorCtrl", function($scope, $cookies, $http, themoviedbAPI){

$scope.serie = {};
$scope.serie.seasons = {};

themoviedbAPI.setLanguageConversion(true);
themoviedbAPI.setApiKey("apikey");

var episodesAlreadySelected = [];
var seasonsComplete = 0;

if(!$cookies.get("lang")){
	var lang = navigator.browserLanguage!=undefined ?  navigator.browserLanguage : navigator.language;
	var lang = lang.split("-")[0] ? lang.split("-")[0] : "en";
	$cookies.put("lang", lang);
}

$scope.lang = $cookies.get("lang");

selectLanguage();


$scope.changeLanguage = function(){
	$cookies.put("lang", $scope.lang);
	selectLanguage();
}

$scope.getSeries = function(val) {
	$scope.serie = {};

	return themoviedbAPI.getData('/search/tv', {query:val, language:$scope.lang}).then(function(response){
		return response.data.results.map(function(item){
			return {name: item.name, id: item.id, img:item.poster_path, overview:item.overview, first_air_date: item.first_air_date};
		});
	});
};


  //seleciona os dados da série escolhida
$scope.selectSeries = function(item, model, label){
	$scope.serie.img = item.img;
	$scope.serie.overview = item.overview;
	$scope.serie.id = item.id;

	var first_air_date = new Date(item.first_air_date);
	
	var data = [];
	data["language"] = $scope.lang;
	themoviedbAPI.getData('/tv/'+item.id, data, function(response){
		var data = response.data;
		if(data){
			var seasons = data.seasons;
			if(seasons[0].season_number<1)
				seasons = seasons.slice(1, seasons.length);
			
			seasons = seasons.filter(function(season){
				if(new Date(season.air_date) <= new Date()) return season;
			});

			$scope.serie.seasons = seasons;
		}
	});
};

  //se o checkbox master foi mudado altera todos
$scope.isSelected = function(seasons, master){
	if(master)
		return master;

	return seasons.some(function(season){
		return season.selected;
	});
};

  //ação para selecionar um episódio aletório(chamando getEpisodeUrl(serie_id, season_number))
$scope.selectEpisode = function(serie){
	
	$scope.buton_disabled = true;
	
	delete serie.episode;

	var seasons = serie.seasons;

	seasons = seasons.filter(function(season){
		if(season.selected) return season;
	});

	var value = seasons[0] ? 1 : 0;

	var number_season = Math.floor(Math.random() * seasons.length-value)+1;
	number_season = seasons[number_season].season_number;

	getEpisodeUrl(serie.id, number_season, seasons.length);
	
};

$scope.selectAll = function(seasons, master){
	angular.forEach(seasons, function(itm){ itm.selected = master});
};

  //método recursivo que seleciona um episódio viável
function getEpisodeUrl(serie_id, season_number, total_seasons){
	
	var data = [];
	data["language"] = $scope.lang;
	
	themoviedbAPI.getData('/tv/'+serie_id+"/season/"+season_number, data, function(response){
		
		var data = response.data;
		
		if(data){

			var episodes = data.episodes.filter(function(episode){
				if(new Date(episode.air_date) <= new Date()) return episode;
			});
			
			if(seasonsComplete == total_seasons)
				episodesAlreadySelected = [];
			
			if(!episodesAlreadySelected[data.id])
				episodesAlreadySelected[data.id] = [];
			else 
				if(episodesAlreadySelected[data.id].length == episodes.length)
					seasonsComplete++;
					
				
			var number_episode = Math.floor(Math.random() * episodes.length-1) + 1;

			var episode = episodes[number_episode];
			
			if(episodesAlreadySelected[data.id].indexOf(episode.id) != -1 || !episode){ 
				getEpisodeUrl(serie_id, season_number, total_seasons);
			} else {
				$scope.serie.episode = episode;
				episodesAlreadySelected[data.id].push(episode.id);
				$scope.buton_disabled = false;
			}

		}
	});
};

function selectLanguage(){
	var url = window.location.href;
	$http({
	  method: 'GET',
	  url: url+'languages/'+$scope.lang+".json"
	}).then(function successCallback(response) {
		$scope.language = response.data;
	});
}

});

})();