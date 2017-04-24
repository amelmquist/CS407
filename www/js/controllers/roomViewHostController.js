/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp')
  .factory('Song', function()
  {
    return function(name, duration)
    {
      this.name = name;
      this.duration = duration;
    };
  })
  .controller('roomViewHostController', function($scope, $state, $interval, Song) {


  $scope.closeRoom = function() {
    //Todo, make this function ask for confirmation before closing the room
    //Todo, make this transition always go "backward" google seems to think we need to use $ionicHistory goBack
    $state.go('routingPage');
  };

  $scope.changeOptions = function() {
    $state.go('roomOptionsPage');
  };

  $scope.theTime = "Finding time...";
  $interval(clock, 1000);
  function clock()
  {
    var currentTime = new Date();
    $scope.theTime = currentTime.toLocaleTimeString();
  }




  $scope.musicQueue = [];

  function getFromQueue() {

    if($scope.musicQueue.length > 0)
    {
      return $scope.musicQueue.shift();
    }
    else
    {
      return 0;
    }
  };


  $scope.timeRemaining;

  $scope.songPlaying = false; //initially start with no song
  $scope.currentSong = "";

  var intervalPromise;

  function updatePlaylist()
  {
    if($scope.songPlaying != true)
    {
      if($scope.musicQueue.length > 0)
      {

        $scope.currentSong = getFromQueue();
        $scope.timeRemaining = $scope.currentSong.duration;
        $scope.songPlaying = true;
        intervalPromise = $interval(ageSong, 1000);
      }
    }
  }

  function ageSong()
  {
    $scope.timeRemaining--;
    if($scope.timeRemaining == 0)
    {
      $scope.songPlaying = false;
      if(angular.isDefined(intervalPromise))
      {
        $interval.cancel(intervalPromise);
      }
      updatePlaylist();
    }
  }

  $scope.addSongX = function()
  {
    //songX is 4 seconds long
    var newSong = new Song("Song X", 4);
    $scope.musicQueue.push(newSong);
    updatePlaylist();
  };
  $scope.addSongY = function()
  {
    //songY is 7 seconds long
    var newSong = new Song("Song Y", 7);
    $scope.musicQueue.push(newSong);
    updatePlaylist();
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
