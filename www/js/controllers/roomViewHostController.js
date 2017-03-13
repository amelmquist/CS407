/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp').controller('roomViewHostController', function($scope, $state) {

  $scope.closeRoom = function() {
    //Todo, make this function ask for confirmation before closing the room
    //Todo, make this transition always go "backward" google seems to think we need to use $ionicHistory goBack
    $state.go('routingPage');
  };

  $scope.changeOptions = function() {
    $state.go('roomOptionsPage');
  };



  var song;

  $scope.play = function(){
    var url = "file:///www/example.mp3";
    // var url = "http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3";
    // var url = "cdvfile://localhost/persistent/audio/hangouts_incoming_call.ogg"

    song = new Media(url,
      // success callback
      function () { $scope.debug = "playAudio():Audio Success"; },
      // error callback
      function (err) { $scope.debug = "playAudio():Audio Error: " + err; }
    );
    song.play();

    $scope.debug = "Playing music!";

  };

  $scope.pause = function(){
    song.pause();
    $scope.dubug = "Paused music!";
  };

});
