(function(){
angular.module("themoviedbAPI", []);

angular.module("themoviedbAPI").factory('themoviedbAPI', function($http){
	
	var baseUrl = "http://api.themoviedb.org/";
	var languageConversion = false;
	var defaultLang = "en";
	var version = "3";
	var apiKey  = "s";
	var languages = ['en', 'de', 'fr', 'es', 'pt'];
	
	var lang  	= (navigator.browserLanguage!=undefined)?  navigator.browserLanguage : navigator.language;
	
	function setBaseUrl(value) {
		baseUrl = value;
	}
	
	function setLanguageConversion(value) {
		languageConversion = value;
	}
	
	function setDefaultLang(value) {
		defaultLang = value;
	}
	
	function setVersion(value) {
		version = value;
	}
	
	function setApiKey(value) {
		apiKey = value;
	}
	
	function setLanguages(value) {
		languages = value;
	}
	
	function mergeLanguage(defaultLanguage, language){
		angular.forEach(language, function(value, key) {
		  angular.forEach(value, function(v, k) {
			  if(v){
				  if(Array.isArray(defaultLanguage[key][k]))
					defaultLanguage[key][k] = mergeLanguageArray(defaultLanguage[key][k], v);
				  else if(typeof defaultLanguage[key][k] == "object")
					defaultLanguage[key][k] = mergeLanguageObject(defaultLanguage[key][k], v);
				  else
					defaultLanguage[key][k] = v;
			  }
				  
		  });
		});
		return defaultLanguage;
	}
	
	function mergeLanguageObject(dest, source){
		if(dest)
			for(var p in source)
				if(source[p])
					dest[p] = source[p];
		
		return dest;
	}
	
	function mergeLanguageArray(dest, source){
		if(source.length!=0){
			angular.forEach(source, function(value, key) {
				if(Array.isArray(dest[key]))
					dest[key] = mergeLanguageArray(dest[key], value);
				else if(typeof dest[key] == "object")
					dest[key] = mergeLanguageObject(dest[key], value);
				else
					dest[key] = value;
			});
		}
		
		return dest;
	}
	
	
	
	function getData(search, params = [], callback = null, async = true, language = null){
		
			params["api_key"] = apiKey;
			
			if(!params["language"])
				params["language"] = lang;
			
			if(languages.indexOf(params["language"]) == -1 || language)
				params["language"] = defaultLang;
			
			return $http.get(baseUrl+version+search, {
					async:async,
					params: params,
					}).then(function(response){
						if(response.status_code == 25) 
							setTimeout(getData(search, params, search), 10000);
						else {
							if(languageConversion){
								if(!language && params["language"] != defaultLang){
									params["language"] = defaultLang;
									language = response.data.results ? response.data.results : response.data;
									return getData(search, params, callback, async, language);
									
								} else {
									var defaultLanguage = response.data.results ? response.data.results : response.data;
									
									var finalLanguage = mergeLanguage(defaultLanguage, language);

									if(response.data.results)
										response.data.results = finalLanguage;
									else
										response.data = finalLanguage;
									
								}
							}
							
							if(callback != null)
								callback(response);
							else
								return response;
												
						}
					});
	};
	
	return { 
		baseUrl: baseUrl,
		languageConversion: languageConversion,
		defaultLang: defaultLang,
		version: version,
		apiKey: apiKey,
		languages: languages,
		setLanguageConversion: setLanguageConversion,
		setBaseUrl: setBaseUrl,
		setLanguageConversion: setLanguageConversion,
		setDefaultLang: setDefaultLang,
		setVersion: setVersion,
		setLanguages: setLanguages,
		setApiKey: setApiKey,
		getData: getData
	};
});
})();