/**
 * Created by Steven on 3/5/2017.
 */

starter.factory('Room', function () {

  return function (hostUserObject, roomName, roomPassword) {
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

    this.addUser = function (someUser) {

      // if user is already in this room
      if (this.allUsersInRoom[someUser.name] != null) {
        alert("User " + someUser.name + "has already joined this room!");
      }
      else {
        this.allUsersInRoom[someUser.name] = someUser;
      }

    };

    this.removeUser = function (someUser) {
      if (this.hostName === someUser.name) {
        this.quitRoom = true;
      }
      else {
        delete this.allUsersInRoom[someUser.name];
      }
    };

    this.addSong = function (newSong) {
      this.queue.push(newSong);
    };

    this.goToNextSong = function () {
      this.queue.shift();
    };

    this.updateSkipThreshold = function (newThreshold) {
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

starter.factory('Song', function () {
  return function (name, duration) {
    this.name = name;
    this.duration = duration;
  };
})

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

})

starter.controller('roomViewHostController', function (Room, $rootScope, $scope, $state, $stateParams,
                                                       $ionicViewSwitcher, $interval, Song, $fileFactory,
                                                       $ionicPlatform, $ionicSideMenuDelegate) {
  //room host control properties
  $scope.roomName = $stateParams.room_name;
  $scope.password = $stateParams.password;
  // $scope.hostName = $rootScope.currUser.name;

  //$scope.createRoom = function() {
  // var room = new Room($rootScope.currUser, $scope.roomName, $scope.password);
  var room = new Room("USER X", $scope.roomName, $scope.password);
  $scope.room = room;
  $scope.numUsers = Object.keys($scope.room.allUsersInRoom).length;

  console.log($rootScope);
  console.log($scope);

  if ($scope.room.quitRoom == true) {
    $scope.closeRoom();
  }

  $scope.closeRoom = function () {
    //Todo, make this function ask for confirmation before closing the room
    if ($scope.currentSong) {
      $scope.currentSong.song.release();
    }
    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

  $scope.changeOptions = function () {
    $state.go('roomOptionsPage');
  };

  $scope.viewUsers = function () {
    $state.go('usersPage', {
      'room': $scope.room,
    });
  };

  //music queue control mechanisms
  $scope.musicQueue = [];

  // function getFromQueue() {
  //   if ($scope.musicQueue.length > 0) {
  //     return $scope.musicQueue.shift();
  //   }
  //   else {
  //     return 0;
  //   }
  // };


  $scope.timeRemaining;
  $scope.hasCurrentSong = false;

  $scope.songPlaying = false; //initially start with no song
  $scope.currentSong = "";

  // var intervalPromise;
  //
  // function updatePlaylist() {
  //   if ($scope.songPlaying != true) {
  //     if ($scope.musicQueue.length > 0) {
  //       $scope.currentSong = getFromQueue();
  //       $scope.timeRemaining = $scope.currentSong.duration;
  //       $scope.songPlaying = true;
  //       intervalPromise = $interval(ageSong, 1000);
  //     }
  //   }
  // }

  $scope.updateQueue = function (status) {
    switch (status) {
      case 0: //MEDIA_NONE
              // $scope.debug = "MEDIA_NONE";
        break;
      case 1: //MEDIA_STARTING
              // $scope.debug = "MEDIA_STARTING";
        break;
      case 2: //MEDIA_RUNNING
              // $scope.debug = "MEDIA_RUNNING";
        break;
      case 3: //MEDIA_PAUSED
              // $scope.debug = "MEDIA_PAUSED";
        break;
      case 4: //MEDIA_STOPPED
              // $scope.debug = "MEDIA_STOPPED";
        $scope.currentSong.song.release();
        $scope.hasCurrentSong = false;
        $scope.play();
      // $scope.next();
      default:
    }
  }

  // function ageSong() {
  //   $scope.timeRemaining--;
  //   if ($scope.timeRemaining == 0) {
  //     $scope.songPlaying = false;
  //     if (angular.isDefined(intervalPromise)) {
  //       $interval.cancel(intervalPromise);
  //     }
  //     updatePlaylist();
  //   }
  // }

  // $scope.startQueue = function(){
  //   if ($scope.musicQueue.length > 0) {
  //     // $scope.currentSong = $scope.musicQueue[0];
  //     $scope.currentSong = $scope.musicQueue.shift();
  //     $scope.hasCurrentSong = true;
  //   }
  //     //     return $scope.musicQueue.shift();
  //     //   }
  //     //   else {
  //     //     return 0;
  //     //   }
  // };

  $scope.play = function () {
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.play();
    } else if ($scope.musicQueue.length > 0) {
      $scope.currentSong = {"name": $scope.musicQueue[0].name, "song": $scope.musicQueue[0].song};
      $scope.musicQueue.shift();
      $scope.hasCurrentSong = true;
      $scope.currentSong.song.play();
      $scope.debug = $scope.currentSong.name;
    } else {
      $scope.currentSong = "";
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
      // $scope.hasCurrentSong = false;
      $scope.debug = "removed current song";

    }
    // $scope.play();

    // if($scope.musicQueue.length > 0){
    //   // $scope.currentSong = $scope.musicQueue.shift();
    //   // $scope.currentSong.song.play();
    //   // $scope.hasCurrentSong = true;
    //   // $scope.debug = "started the next song";
    // }else{
    //   $scope.currentSong = "";
    //   $scope.hasCurrentSong = false;
    //   $scope.debug = "there were no songs left";
    // }


    // $scope.debug = "next song!";
    // $scope.debug = currentSong.song.MEDIA_STATE;
  };

  //logic for file management
  $scope.musicLibrary = [];
  var fs = new $fileFactory();
  // $scope.debug = "location 1: Debug started";
  $ionicPlatform.ready(function () {
    // $scope.debug = "location 1.5";
    cordova.plugins.diagnostic.requestExternalStorageAuthorization(function (status) {
      // $scope.perms = "Authorization: " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied");
    }, function (error) {
      // $scope.perms = error;
    });

    //Get the root music directory - found in sdcard/Music (externalRootStorage()/Music)
    fs.getEntriesAtRoot().then(function (result) {
      //$scope.debug = "location 4";
      $scope.files = result;
      // $scope.debug = "Results obtained!";
      $scope.getAllFiles($scope.files);
      //$scope.debug = "finished loading music";
      // $scope.debug = $scope.musicLibrary;
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
            var foundSong = new Media(entries[i].nativeURL,
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
            $scope.musicLibrary.push({"name": name, "song": foundSong});
          }
        }
        else {
          fs.getEntries(entries[i].nativeURL).then(function (result) {
            $scope.getAllFiles(result);
          });
        }
        // $scope.debug = "end of for loop";
      }
      // $scope.debug = "end of function";
      // $scope.debug = $scope.musicLibrary;
    }
  });

  $scope.addSongtoQueue = function (songtoAdd) {
    $scope.musicQueue.push({"name": songtoAdd.name, "song": songtoAdd.song});
    songtoAdd.song.release();
  };


  // dealing with side menu
  $scope.toggleMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

});

