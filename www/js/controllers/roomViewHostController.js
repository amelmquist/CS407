/**
 * Created by Steven on 3/5/2017.
 */

starter.factory('Room', function ($firebaseArray, $firebaseObject) {

  var fb = {};

  var fburl = "https://jamfly-5effe.firebaseio.com/";

  fb.initialize = function (roomID) {
    fb.roomID = roomID;
    fb.roomRef = new Firebase(fburl).child("roomList").child(roomID);
    fb.messages = $firebaseArray(fb.roomRef.child("messages"));
    fb.songQueue = $firebaseArray(fb.roomRef.child("songQueue"));
    fb.roomData = $firebaseObject(fb.roomRef.child("roomData"));
    fb.library = $firebaseArray(fb.roomRef.child("library"));
    fb.requestList = $firebaseArray(fb.roomRef.child("requests"));

    fb.delete = function () {
      fb.roomRef.remove();
    };

    return fb;

  };

  return fb;
});

starter.factory("$fileFactory", function ($q) {

  var File = function () {
  };
  File.prototype = {

    getParentDirectory: function (path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function (fileSystem) {
        fileSystem.getParent(function (result) {
          deferred.resolve(result);
        }, function (error) {
          deferred.reject(error);
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntriesAtRoot: function () {
      var deferred = $q.defer();
      var homePath = cordova.file.externalRootDirectory;
      var homePath = homePath + "/Music";
      window.resolveLocalFileSystemURI(homePath, function (fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function (entries) {
          deferred.resolve(entries);
        }, function (error) {
          deferred.reject(error);
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntries: function (path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function (fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function (entries) {
          deferred.resolve(entries);
        }, function (error) {
          deferred.reject(error);
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }
  };
  return File;

});

starter.controller('roomViewHostController', function (Room, $rootScope, $scope, $state, $stateParams, $ionicLoading,
                                                       $ionicViewSwitcher, $interval, $fileFactory,
                                                       $ionicPlatform, $ionicSideMenuDelegate, $ionicPopup) {
  //room host control properties
  $scope.roomName = $stateParams.room_name;
  $scope.password = $stateParams.password;
  // $scope.hostName = $rootScope.currUser.name;
  var roomID = "";
  if ($scope.roomName == null) {
    if ($rootScope.name != null) {
      $scope.roomName = $rootScope.name + "'s Room";
      roomID = $rootScope.name;
    }
    else {
      roomID = "default";
      $scope.roomName = "Unnamed Room";
    }
  }
  else {
    roomID = $scope.roomName;
  }
  console.log(roomID);
  var fb = Room.initialize(roomID);

  $scope.messages = fb.messages;
  $scope.roomData = fb.roomData;
  $scope.onlineLibrary = fb.library;
  $scope.requestList = fb.requestList;
  $scope.songQueue = fb.songQueue;

  //queueLength won't update automatically, need to watch for it!
  $scope.songQueue.$loaded(function (event) {
    $scope.queueLength = $scope.songQueue.length;
  });
  $scope.songQueue.$watch(function (event) {
    $scope.queueLength = $scope.songQueue.length;
  });

  //Always watch the request list, add new songs when they come in!
  $scope.requestList.$watch(function (event) {
    if (event.event == "child_added")
      $scope.addSongtoQueue($scope.requestList.$getRecord(event.key));
    $scope.requestList.$remove($scope.requestList.$getRecord(event.key));
  });

  $scope.roomData.$loaded().then(function () {
    //Only overwrite values if the room is brand new
    if ($scope.roomData.roomName == null) {
      $scope.roomData.roomName = $scope.roomName;
      $scope.roomData.numMessages = 0;
      $scope.roomData.nowPlaying = "";
      $scope.roomData.numUsers = "1";
      $scope.roomData.$save();
    }
  });

  $scope.addMessage = function () {

    $ionicPopup.prompt({
      title: 'New Message',
      template: 'Type your message below!'
    }).then(function (res) {
      $scope.messages.$add({
        "user": $rootScope.name,
        "message": res
      });
      $scope.roomData.numMessages++;
      $scope.roomData.$save();
    });
  };

  $scope.removeMessage = function (message) {
    $scope.messages.$remove(message);
    $scope.roomData.numMessages--;
    $scope.roomData.$save();
  };

  $scope.closeRoom = function () {
    var confirmed = $ionicPopup.confirm({
      title: 'Closing Room',
      template: 'Are you sure you want to close the room?'
    });

    confirmed.then(function (res) {
      if (res) {
        $ionicPopup.alert({
          title: 'Deleting Room'
        });
        $scope.endMusic();
        fb.roomRef.remove();
        $ionicViewSwitcher.nextDirection('back');
        $state.go('routingPage');
      }
    });
  };

  $scope.changeOptions = function () {
    $state.go('roomOptionsPage');
  };

  $scope.viewUsers = function () {
    $state.go('usersPage');
  };


  //music queue control mechanisms
  $scope.musicQueue = [];

  // $scope.timeRemaining;
  $scope.hasCurrentSong = false;

  $scope.songPlaying = false; //initially start with no song
  $scope.currentSong = "";

  $scope.updateQueue = function (status) {
    switch (status) {
      case 0: //MEDIA_NONE
              // $scope.debug = "MEDIA_NONE";
        $scope.mediaStatus = status;
        $scope.playing = false;
        break;
      case 1: //MEDIA_STARTING
              // $scope.debug = "MEDIA_STARTING";
        $scope.mediaStatus = status;
        $scope.playing = false;
        break;
      case 2: //MEDIA_RUNNING
              // $scope.debug = "MEDIA_RUNNING";
        $scope.mediaStatus = status;
        $scope.playing = true;
        break;
      case 3: //MEDIA_PAUSED
              // $scope.debug = "MEDIA_PAUSED";
        $scope.mediaStatus = status;
        $scope.playing = false;
        break;
      case 4: //MEDIA_STOPPED
              // $scope.debug = "MEDIA_STOPPED";
        $scope.mediaStatus = status;
        $scope.playing = false;
        $scope.currentSong.song.release();
        $scope.hasCurrentSong = false;
        $scope.play();
      default:
    }
  };

  $scope.playing = false;
  $scope.togglePlay = function(){
    if($scope.playing == false){
      $scope.play();
    }else{
      $scope.pause();
    }

  };

  $scope.play = function () {
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.play();
      //} else if ($scope.musicQueue.length > 0)
    } else if ($scope.queueLength > 0) {
      //var nextSong = new Media($scope.musicQueue[0].songPath,
      var nextSongKey = $scope.songQueue.$keyAt(0);
      var nextSong = new Media($scope.songQueue.$getRecord(nextSongKey).songPath,
        // success callback
        function () {
          $scope.debug = "created media";
        },
        // error callback
        function onError(err) {
          $scope.debug = "media error";
        },
        function onStatus(status) {
          $scope.$apply(function () {
            $scope.updateQueue(status);
            $scope.mediaStatus = "status: " + status;
          })
        }
      );
      $scope.currentSong = {
        //"name": $scope.musicQueue[0].name,
        "name": $scope.songQueue.$getRecord(nextSongKey).name,
        //"songPath": $scope.musicQueue[0].songPath,
        "songPath": $scope.songQueue.$getRecord(nextSongKey).songPath,
        "song": nextSong
      };
      //$scope.musicQueue.shift();
      $scope.songQueue.$remove($scope.songQueue.$indexFor(nextSongKey));
      $scope.hasCurrentSong = true;
      $scope.currentSong.song.play();
      $scope.debug = $scope.currentSong.name;
      $scope.roomData.nowPlaying = $scope.currentSong.name;
      $scope.roomData.$save();
    } else {
      $scope.currentSong = "";
      $scope.roomData.nowPlaying = "";
      $scope.roomData.$save();
    }
  };

  $scope.pause = function () {
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.pause();
    }
  };

  $scope.next = function () {
    if ($scope.hasCurrentSong) {
      // $scope.currentSong.song.pause();
      $scope.currentSong.song.release();
      $scope.playing = false;
      //$scope.songQueue.$remove(nextSongKey);
      // $scope.hasCurrentSong = false;
      // $scope.debug = "removed current song";
    }
  };

  $scope.endMusic = function () {
    //$scope.musicQueue = "";
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.release();
    }
  };

  $scope.songUp = function (argSong) {
    var index = $scope.songQueue.$indexFor($scope.songQueue.$keyAt(argSong));
    if (index > 0) {
      var tempName = $scope.songQueue[index - 1].name;
      var tempPath = $scope.songQueue[index - 1].songPath;
      $scope.songQueue[index - 1].name = $scope.songQueue[index].name;
      $scope.songQueue[index - 1].songPath = $scope.songQueue[index].songPath;
      $scope.songQueue[index].name = tempName;
      $scope.songQueue[index].songPath = tempPath;
      $scope.songQueue.$save(index);
      $scope.songQueue.$save(index - 1);
    }
  };
  $scope.songDown = function (argSong) {
    var index = $scope.songQueue.$indexFor($scope.songQueue.$keyAt(argSong));
    if ($scope.songQueue.$keyAt(index + 1) != null) {
      var tempName = $scope.songQueue[index + 1].name;
      var tempPath = $scope.songQueue[index + 1].songPath;
      $scope.songQueue[index + 1].name = $scope.songQueue[index].name;
      $scope.songQueue[index + 1].songPath = $scope.songQueue[index].songPath;
      $scope.songQueue[index].name = tempName;
      $scope.songQueue[index].songPath = tempPath;
      $scope.songQueue.$save(index);
      $scope.songQueue.$save(index + 1);
    }
  };
  $scope.removeSong = function (argSong) {
    $scope.songQueue.$remove(argSong);
  };

  //logic for file management
  var fs = new $fileFactory();
  // $scope.debug = "location 1: Debug started";
  $ionicPlatform.ready(function () {

    //Get the root music directory - found in sdcard/Music (externalRootStorage()/Music)
    fs.getEntriesAtRoot().then(function (result) {
      $scope.files = result;
      $scope.getAllFiles($scope.files);
      //uploadLibraryToFirebase();
    }, function (error) {
      console.error(error);
    });

    //recursive function for going through entire music library
    $scope.getAllFiles = function (entries) {
      //for all entries in path, either add them to music library or add their contents
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isFile) {
          //it must be a file to get to this place: avoid directories with ".mp3"
          if (entries[i].name.includes('.mp3')) {
            // only add mp3 files
            var name = entries[i].name.split('.mp3')[0];
            var songPath = entries[i].nativeURL;

            //$scope.musicLibrary.push({"name": name, "songPath": songPath});
            $scope.onlineLibrary.$add({"name": name, "songPath": songPath});
          }
        }
        else {
          fs.getEntries(entries[i].nativeURL).then(function (result) {
            $scope.getAllFiles(result);
          });
        }
      }
    }
  });

  $scope.addSongtoQueue = function (songtoAdd) {
    $ionicLoading.show({ template: "Song Added!", noBackdrop: false, duration: 500 });
    //$scope.musicQueue.push({"name": songtoAdd.name, "songPath": songtoAdd.songPath});
    $scope.songQueue.$add({"name": songtoAdd.name, "songPath": songtoAdd.songPath});
    //songtoAdd.song.release();
  };

  // dealing with side menu
  $scope.toggleMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

});

