CLOCKWORKRT.API.appPath=function(){
    return "ms-appx:///game/gamefiles";
}
CLOCKWORKRT.apps={};
CLOCKWORKRT.apps.getDependency=function(name,version,callback){
    //Load cached dependencies
    loadTextFile("ms-appx:///game/dependencies/"+name+"/"+version, callback);
}