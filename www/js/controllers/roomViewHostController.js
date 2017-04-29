/**
 * Created by Steven on 3/5/2017.
 */

starter.factory('Room', function() {

  return function(hostUserObject, roomName, roomPassword) {
    this.hostName = hostUserObject.name;
    this.roomName = roomName;
    this.roomPassword = roomPassword;
    this.allUsersInRoom = {};
    this.allUsersInRoom[hostUserObject.name] = hostUserObject;
    // intelligent queue data structure
    this.queue = [];
    // Every time a room is created or modified, check if this bool var is true. If so, exit the room.
    // Currently, this is how we handle the case where the host deletes themselves from the room
    this.quitRoom = false;
    this.skipThreshold = 0;

    this.addUser = function(someUser) {

      // if user is already in this room
      if (this.allUsersInRoom[someUser.name] != null) {
        alert("User "+someUser.name+"has already joined this room!");
      }
      else {
        this.allUsersInRoom[someUser.name] = someUser;
      }

      };

    this.removeUser = function(someUser) {
      if (this.hostName === someUser.name) {
        this.quitRoom = true;
      }
      else {
        delete this.allUsersInRoom[someUser.name];
      }
    };

    this.addSong = function(newSong) {
      this.queue.push(newSong);
    };

    this.goToNextSong = function() {
      this.queue.shift();
    };

    this.updateSkipThreshold = function(newThreshold) {
      if (newThreshold >= 0 && newThreshold <= 100) {
        this.skipThreshold = newThreshold;
      }
      else {
        alert("Threshold provided was invalid!");
      }
    }

    //TODO: Need to change host to guest view and the new host to host view instantaneously
    /* this.changeHost = function(someUser) {
      var userId = someUser;
      if (this.allUsersInRoom[userId] != null) {
        this.hostId = userId;
      }
    };*/
  }
});

starter.factory('Song', function()
{
  return function(name, duration)
  {
    this.name = name;
    this.duration = duration;
  };
})

.factory("$fileFactory", function($q) {

  var File = function() { };
  File.prototype = {

    getParentDirectory: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function(fileSystem) {
        fileSystem.getParent(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntriesAtRoot: function() {
      var deferred = $q.defer();
      var homePath = cordova.file.externalRootDirectory;
      var homePath = homePath + "/Music";
      window.resolveLocalFileSystemURI(homePath, function(fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function(entries) {
          deferred.resolve(entries);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntries: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function(fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function(entries) {
          deferred.resolve(entries);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }
  };
  return File;

})

starter.controller('roomViewHostController', function(Room, $rootScope, $scope, $state, $stateParams,
                                                      $ionicViewSwitcher, $interval, Song, $fileFactory,
                                                      $ionicPlatform, $ionicSideMenuDelegate) {
  //room host control properties
  $scope.roomName = $stateParams.room_name;
  $scope.password = $stateParams.password;
  $scope.hostName = $rootScope.currUser.name;

  //$scope.createRoom = function() {
  var room = new Room($rootScope.currUser, $scope.roomName, $scope.password);
  $scope.room = room;
  $scope.numUsers = Object.keys($scope.room.allUsersInRoom).length;

  console.log($rootScope);
  console.log($scope);

  if ($scope.room.quitRoom == true) {
    $scope.closeRoom();
  }

  $scope.closeRoom = function() {
    //Todo, make this function ask for confirmation before closing the room
    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

  $scope.changeOptions = function() {
    $state.go('roomOptionsPage');
  };

  $scope.viewUsers = function() {
    $state.go('usersPage', {
      'room': $scope.room,
    });
  };

  //music queue control mechanisms
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
    $scope.musicQueue[0].song.play();
    $scope.debug = "playing song";
  };

  $scope.pause = function(){
    $scope.musicQueue[0].song.pause();
    $scope.debug = "Paused music!";
  };

  $scope.next = function(){
    $scope.musicQueue[0].song.release();

    getFromQueue();
    $scope.play();
    $scope.debug = "next song!";
  };

  //logic for file management
  var fs = new $fileFactory();
  $scope.debug = "location 1: Debug started";
  $ionicPlatform.ready(function() {
    $scope.debug = "location 1.5";
    cordova.plugins.diagnostic.requestExternalStorageAuthorization(function(status){
      $scope.perms = "Authorization: " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied");
    }, function(error){
      $scope.perms = error;
    });

    fs.getEntriesAtRoot().then(function(result) {
      //$scope.debug = "location 4";
      $scope.files = result;
      $scope.debug = "Results obtained!";
    }, function(error) {
      console.error(error);
    });

    var newSong;
    $scope.getDirectoryContents = function(file, path) {
      //if mp3 selected, add it to the playlist
      if(path.includes(".mp3")){
        $scope.debug = "mp3 detected!";
        //$scope.debug = path;

        newSong = new Media(path,
          // success callback
          function () { $scope.debug = "playAudio():Audio Success"; },
          // error callback
          function (err) { $scope.debug = "playAudio():Audio Error: " + err; }
        );
        file.name = file.name.split('.mp3')[0];
        $scope.musicQueue.push({"name": file.name, "song":newSong});
        $scope.debug = "added song to queue";
        $scope.debug = newSong.getDuration();

        //$scope.debug = "Just before reading media tags";


      }
      else{
        fs.getEntries(path).then(function(result) {
         $scope.files = result;
         $scope.files.unshift({name: "[parent]"});
         fs.getParentDirectory(path).then(function(result) {
           result.name = "[parent]";
           $scope.files[0] = result;
         });
        });
      }
    }
  });


  // dealing with side menu
  $scope.toggleMenu = function() {
    $ionicSideMenuDelegate.toggleRight();
  };

});

